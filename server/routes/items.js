import express from "express";
import { ObjectId } from "mongodb";

import { getDb } from "../db/connection.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { validateItemBody } from "../middleware/validators.js";
import { validateObjectId } from "../middleware/validate.js";

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const db = getDb();
    const col = db.collection("items");

    const { type, search, available } = req.query;
    const filter = {};

    if (type) filter.type = type;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { authorOrProducer: { $regex: search, $options: "i" } },
      ];
    }

    if (available === "true") filter.availableCount = { $gt: 0 };
    if (available === "false") filter.availableCount = { $eq: 0 };

    const results = await col.find(filter).sort({ createdAt: -1 }).toArray();
    res.status(200).json(results);
  })
);

router.get(
  "/borrowed-books",
  asyncHandler(async (_req, res) => {
    const db = getDb();
    const col = db.collection("items");
    const results = await col
      .find({ type: "book", borrowedCount: { $gt: 0 } })
      .sort({ title: 1 })
      .toArray();
    res.status(200).json(results);
  })
);

router.get(
  "/:id",
  validateObjectId("id"),
  asyncHandler(async (req, res) => {
    const db = getDb();
    const col = db.collection("items");
    const item = await col.findOne({ _id: new ObjectId(req.params.id) });
    if (!item) throw new HttpError(404, "Not found");
    res.status(200).json(item);
  })
);

router.post(
  "/",
  requireAuth,
  requireAdmin,
  validateItemBody,
  asyncHandler(async (req, res) => {
    const db = getDb();
    const col = db.collection("items");

    const {
      title,
      type,
      authorOrProducer = "",
      year = null,
      language = "",
      genre = [],
      tags = [],
      image = "",
      totalCount,
      isNew = false,
    } = req.body;

    const doc = {
      title,
      type,
      authorOrProducer,
      year,
      language,
      genre,
      tags,
      image,
      totalCount,
      availableCount: totalCount,
      borrowedCount: 0,
      isNew,
      createdAt: new Date(),
    };

    const result = await col.insertOne(doc);
    res.status(201).json({ _id: result.insertedId, ...doc });
  })
);

router.patch(
  "/:id/counts",
  requireAuth,
  requireAdmin,
  validateObjectId("id"),
  asyncHandler(async (req, res) => {
    const db = getDb();
    const col = db.collection("items");

    const { totalCount } = req.body;
    if (typeof totalCount !== "number" || totalCount < 0) {
      throw new HttpError(400, "totalCount must be a number >= 0");
    }

    const _id = new ObjectId(req.params.id);
    const item = await col.findOne({ _id });
    if (!item) throw new HttpError(404, "Not found");

    if (item.borrowedCount > totalCount) {
      throw new HttpError(409, "totalCount cannot be less than borrowedCount");
    }

    const availableCount = totalCount - item.borrowedCount;

    await col.updateOne(
      { _id },
      { $set: { totalCount, availableCount, updatedAt: new Date() } }
    );

    res.status(200).json({ ok: true, totalCount, availableCount });
  })
);

export default router;
