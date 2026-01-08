import express from "express";
import { ObjectId } from "mongodb";

import { getDb } from "../db/connection.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import { requireAuth } from "../middleware/auth.js";
import { validateObjectId } from "../middleware/validate.js";
import { requireFields } from "../middleware/validators.js";

const router = express.Router();

router.post(
  "/",
  requireAuth,
  requireFields(["itemId"]),
  asyncHandler(async (req, res) => {
    const db = getDb();
    const items = db.collection("items");
    const loans = db.collection("loans");

    if (!ObjectId.isValid(req.body.itemId)) throw new HttpError(400, "Invalid itemId");
    const itemId = new ObjectId(req.body.itemId);

    const item = await items.findOne({ _id: itemId });
    if (!item) throw new HttpError(404, "Item not found");
    if (item.availableCount <= 0) throw new HttpError(409, "Not available");

    const loanDoc = {
      userId: new ObjectId(req.user.userId),
      itemId,
      borrowedAt: new Date(),
      returnedAt: null,
      status: "borrowed",
    };

    await loans.insertOne(loanDoc);

    const upd = await items.updateOne(
      { _id: itemId, availableCount: { $gt: 0 } },
      { $inc: { availableCount: -1, borrowedCount: 1 } }
    );

    if (upd.modifiedCount === 0) {
      await loans.deleteOne({ _id: loanDoc._id });
      throw new HttpError(409, "Not available");
    }

    res.status(201).json(loanDoc);
  })
);

router.patch(
  "/:id/return",
  requireAuth,
  validateObjectId("id"),
  asyncHandler(async (req, res) => {
    const db = getDb();
    const items = db.collection("items");
    const loans = db.collection("loans");

    const loanId = new ObjectId(req.params.id);
    const loan = await loans.findOne({ _id: loanId });
    if (!loan) throw new HttpError(404, "Loan not found");
    if (loan.status !== "borrowed") throw new HttpError(409, "Already returned");

    if (loan.userId.toString() !== req.user.userId && req.user.role !== "admin") {
      throw new HttpError(403, "Forbidden");
    }

    await loans.updateOne(
      { _id: loanId },
      { $set: { status: "returned", returnedAt: new Date() } }
    );

        await items.updateOne(
      { _id: loan.itemId },
      { $inc: { availableCount: 1, borrowedCount: -1 } }
    );

    res.status(200).json({ ok: true });
  })
);

export default router;
