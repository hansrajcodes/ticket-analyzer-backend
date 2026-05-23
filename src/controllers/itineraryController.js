const crypto = require("crypto");
const {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const OpenAI = require("openai");

const Itinerary = require("../models/Itinerary");
const { s3, isS3Configured } = require("../config/s3");

const llm = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const MAX_IMAGES_PER_REQUEST = 5;

const ITINERARY_PROMPT = `You are a travel concierge. The user will give you one or more travel
booking documents (flight tickets, hotel confirmations, train/bus tickets,
activity passes). Read them carefully and build a clean day-by-day itinerary
that a real traveler would actually find useful.

Return STRICT JSON with this shape:

{
  "title": "short trip title",
  "destination": "primary destination",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "travelers": 1,
  "summary": "rich 3-5 sentence overview of the whole trip",
  "bookings": [
    {
      "type": "flight|hotel|train|bus|car|cruise|activity|other",
      "title": "",
      "provider": "",
      "reference": "",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "origin": "",
      "destination": "",
      "location": ""
    }
  ],
  "days": [
    {
      "date": "YYYY-MM-DD",
      "summary": "2-3 sentence description of what happens this day",
      "activities": [
        {
          "time": "HH:mm",
          "title": "",
          "description": "useful detail, not a restatement of the title",
          "type": "flight|hotel|transport|activity|meal|note",
          "location": ""
        }
      ]
    }
  ],
  "tips": ["short tip", "short tip"]
}

How to extract travelers:
- Count the unique passenger names printed on the document(s).
- If only one passenger name appears, travelers = 1.
- Never infer traveler count from the number of flight segments,
  bookings, or seats — only from named passengers.
- If genuinely unreadable, default to 1.

How to write the summary (3-5 sentences):
- Mention origin, destination, dates, and trip length.
- Call out the route shape (direct, one stop, multi-city) and total
  travel time including layovers if computable.
- Note anything notable a traveler should know upfront: long
  layover, overnight flight, red-eye, date-line crossing, airline.
- Write naturally, like briefing a friend — not a list of facts.

How to write each day summary (2-3 sentences):
- Describe what the traveler actually does that day in plain language.
- Mention layover duration if there is one, time zone changes, and
  whether the day is mostly in transit vs. on the ground.

How to write activity descriptions:
- Add information that is NOT already in the title.
- For flights: include flight duration if you can compute it, layover
  length before the next leg, terminal/gate if shown, baggage info if
  shown, and the time-zone or date change on arrival.
- For hotels: check-in/out times, address, confirmation/PIN if shown.
- Never just restate the title (bad: "Flight from X to Y" when the
  title already says "Flight X to Y").

How to write tips (3-6 items):
- Be specific to THIS trip. Generic tips like "verify flight times"
  or "check in for all passengers" are useless — skip them.
- Good tips: visa/transit visa requirements for the route, time-zone
  change in hours, recommended check-in window for the airline,
  layover length and whether to leave the airport, currency at
  destination, weather/season at arrival, what time of day arrival is.

General rules:
- Use "" for unknown strings, [] for unknown arrays.
- Use 24h time and YYYY-MM-DD dates in the LOCAL time of each event.
- Order days chronologically and activities within a day by time.
- Do not invent bookings, passengers, or details that are not in the
  documents. It is fine to compute durations and layovers from the
  times that ARE in the documents.
- Output JSON only. No prose, no markdown fences.`;

const parseAiJson = (text) => {
  let clean = text.trim();
  // strip ```json ... ``` fence if present
  const fence = clean.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fence) clean = fence[1].trim();

  try {
    return JSON.parse(clean);
  } catch (e) {
    // sometimes the model adds a trailing comment - try to salvage between braces
    const start = clean.indexOf("{");
    const end = clean.lastIndexOf("}");
    if (start !== -1 && end > start) {
      return JSON.parse(clean.slice(start, end + 1));
    }
    throw new Error("AI returned a response that was not valid JSON");
  }
};

const ACTIVITY_TYPES = ["flight", "hotel", "transport", "activity", "meal", "note"];
const BOOKING_TYPES = ["flight", "hotel", "train", "bus", "car", "cruise", "activity", "other"];

// Map any model-returned type onto the schema's allowed enum.
const coerceActivityType = (t) => {
  const v = String(t || "").toLowerCase();
  if (ACTIVITY_TYPES.includes(v)) return v;
  if (["train", "bus", "car", "taxi", "cruise", "ferry", "transfer"].includes(v)) return "transport";
  return "activity";
};

const coerceBookingType = (t) => {
  const v = String(t || "").toLowerCase();
  if (BOOKING_TYPES.includes(v)) return v;
  return "other";
};

const normalizeItinerary = (data) => ({
  title: data.title || "Untitled Trip",
  destination: data.destination || "",
  startDate: data.startDate || "",
  endDate: data.endDate || "",
  travelers: Number(data.travelers) > 0 ? Number(data.travelers) : 1,
  summary: data.summary || "",
  bookings: (Array.isArray(data.bookings) ? data.bookings : []).map((b) => ({
    ...b,
    type: coerceBookingType(b.type),
  })),
  days: (Array.isArray(data.days) ? data.days : []).map((d) => ({
    ...d,
    activities: (Array.isArray(d.activities) ? d.activities : []).map((a) => ({
      ...a,
      type: coerceActivityType(a.type),
    })),
  })),
  tips: Array.isArray(data.tips) ? data.tips.filter(Boolean) : [],
});

const buildS3Key = (userId, originalName) => {
  const safe = (originalName || "file").replace(/[^a-zA-Z0-9._-]/g, "_").slice(-60);
  const stamp = Date.now();
  const rand = crypto.randomBytes(4).toString("hex");
  return `users/${userId}/${stamp}-${rand}-${safe}`;
};

// Turn an uploaded file into one or more {mimeType, base64} image parts.
// PDFs are rasterized page-by-page; images pass through.
const fileToImageParts = async (file) => {
  if (file.mimetype === "application/pdf") {
    const { pdf } = await import("pdf-to-img");
    const document = await pdf(file.buffer, { scale: 2 });
    const pages = [];
    for await (const pageBuffer of document) {
      pages.push({ mimeType: "image/png", base64: pageBuffer.toString("base64") });
    }
    return pages;
  }
  if (file.mimetype && file.mimetype.startsWith("image/")) {
    return [{ mimeType: file.mimetype, base64: file.buffer.toString("base64") }];
  }
  throw new Error(`Unsupported file type: ${file.mimetype}. Upload images or PDFs.`);
};

// POST /api/itineraries
exports.createItinerary = async (req, res, next) => {
  try {
    const files = req.files || [];
    if (files.length === 0) {
      res.status(400);
      throw new Error("Please upload at least one booking document");
    }

    // 1. Convert uploads to image parts (PDFs become one image per page)
    const imageParts = [];
    for (const f of files) {
      const parts = await fileToImageParts(f);
      imageParts.push(...parts);
    }
    if (imageParts.length === 0) {
      res.status(400);
      throw new Error("Could not read any pages from the uploaded files");
    }
    if (imageParts.length > MAX_IMAGES_PER_REQUEST) {
      // keep the first N pages so the model has the most important content
      imageParts.length = MAX_IMAGES_PER_REQUEST;
    }

    // 2. Send to the LLM (Groq, OpenAI-compatible API)
    const userText = req.body.notes
      ? `Build the itinerary JSON from these documents. Traveler notes: ${req.body.notes}`
      : "Build the itinerary JSON from these documents.";

    const result = await llm.chat.completions.create({
      model: process.env.GROQ_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.5,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: ITINERARY_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: userText },
            ...imageParts.map((p) => ({
              type: "image_url",
              image_url: { url: `data:${p.mimeType};base64,${p.base64}` },
            })),
          ],
        },
      ],
    });

    const parsed = parseAiJson(result.choices[0].message.content);
    const itinerary = normalizeItinerary(parsed);

    // 3. Upload originals to S3 (if configured)
    const storedFiles = [];
    if (isS3Configured()) {
      for (const f of files) {
        const key = buildS3Key(req.user._id, f.originalname);
        await s3.send(
          new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key,
            Body: f.buffer,
            ContentType: f.mimetype,
            ServerSideEncryption: "AES256",
          })
        );
        storedFiles.push({
          originalName: f.originalname,
          mimeType: f.mimetype,
          size: f.size,
          s3Key: key,
        });
      }
    } else {
      // record metadata only - file content is not stored
      for (const f of files) {
        storedFiles.push({
          originalName: f.originalname,
          mimeType: f.mimetype,
          size: f.size,
          s3Key: "",
        });
      }
    }

    // 4. Save to Mongo
    const doc = await Itinerary.create({
      user: req.user._id,
      title: itinerary.title,
      destination: itinerary.destination,
      startDate: itinerary.startDate,
      endDate: itinerary.endDate,
      travelers: itinerary.travelers,
      summary: itinerary.summary,
      bookings: itinerary.bookings,
      days: itinerary.days,
      tips: itinerary.tips,
      files: storedFiles,
    });

    res.status(201).json({ itinerary: doc });
  } catch (err) {
    next(err);
  }
};

// GET /api/itineraries
exports.listItineraries = async (req, res, next) => {
  try {
    const items = await Itinerary.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ items });
  } catch (err) {
    next(err);
  }
};

// GET /api/itineraries/:id
exports.getItinerary = async (req, res, next) => {
  try {
    const doc = await Itinerary.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!doc) {
      res.status(404);
      throw new Error("Itinerary not found");
    }

    // attach a signed S3 URL to each file (if available)
    const obj = doc.toObject();
    if (isS3Configured() && Array.isArray(obj.files)) {
      for (const f of obj.files) {
        if (!f.s3Key) continue;
        try {
          f.url = await getSignedUrl(
            s3,
            new GetObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET,
              Key: f.s3Key,
            }),
            { expiresIn: 3600 }
          );
        } catch (e) {
          // skip if signing fails
        }
      }
    }

    res.json({ itinerary: obj });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/itineraries/:id
exports.updateItinerary = async (req, res, next) => {
  try {
    const allowed = ["title", "destination", "startDate", "endDate", "travelers", "summary", "tips", "days", "bookings"];
    const update = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }

    const doc = await Itinerary.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: update },
      { new: true }
    );
    if (!doc) {
      res.status(404);
      throw new Error("Itinerary not found");
    }
    res.json({ itinerary: doc });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/itineraries/:id
exports.deleteItinerary = async (req, res, next) => {
  try {
    const doc = await Itinerary.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!doc) {
      res.status(404);
      throw new Error("Itinerary not found");
    }

    if (isS3Configured()) {
      for (const f of doc.files || []) {
        if (!f.s3Key) continue;
        try {
          await s3.send(
            new DeleteObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET,
              Key: f.s3Key,
            })
          );
        } catch (e) {
          // ignore - we already removed the DB row
        }
      }
    }

    res.json({ message: "Itinerary deleted" });
  } catch (err) {
    next(err);
  }
};

// POST /api/itineraries/:id/share
exports.toggleShare = async (req, res, next) => {
  try {
    const doc = await Itinerary.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!doc) {
      res.status(404);
      throw new Error("Itinerary not found");
    }

    doc.isPublic = Boolean(req.body.isPublic);
    if (doc.isPublic && !doc.shareToken) {
      doc.shareToken = crypto.randomBytes(16).toString("hex");
    }
    await doc.save();

    res.json({
      isPublic: doc.isPublic,
      shareToken: doc.isPublic ? doc.shareToken : null,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/itineraries/share/:token
exports.getSharedItinerary = async (req, res, next) => {
  try {
    const doc = await Itinerary.findOne({
      shareToken: req.params.token,
      isPublic: true,
    }).lean();

    if (!doc) {
      res.status(404);
      throw new Error("This itinerary is not available");
    }

    // don't leak owner id, files, etc.
    res.json({
      itinerary: {
        _id: doc._id,
        title: doc.title,
        destination: doc.destination,
        startDate: doc.startDate,
        endDate: doc.endDate,
        travelers: doc.travelers,
        summary: doc.summary,
        bookings: doc.bookings,
        days: doc.days,
        tips: doc.tips,
        createdAt: doc.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};
