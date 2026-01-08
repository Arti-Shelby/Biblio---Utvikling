import express from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db/connection.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const db = getDb();
  const collection = db.collection("records");
  const results = await collection.find({}).toArray();
  return res.status(200).send(results);
});

router.get("/:id", async (req, res) => {
  const db = getDb();
  const collection = db.collection("records");

  try {
    const query = { _id: new ObjectId(req.params.id) };
    const result = await collection.findOne(query);
    if (!result) return res.status(404).send("Not found");
    return res.status(200).send(result);
  } catch {
    return res.status(400).send("Invalid id");
  }
});

router.post("/", async (req, res) => {
  try {
    const db = getDb();
    const collection = db.collection("records");

    const newDocument = {
      name: req.body.name,
      position: req.body.position,
      level: req.body.level,
      createdAt: new Date(),
    };

    const result = await collection.insertOne(newDocument);
    return res.status(201).json({ _id: result.insertedId, ...newDocument });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Error adding record");
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const db = getDb();
    const collection = db.collection("records");
    const query = { _id: new ObjectId(req.params.id) };

    const updates = {
      $set: {
        name: req.body.name,
        position: req.body.position, // fixed
        level: req.body.level,
        updatedAt: new Date(),
      },
    };

    const result = await collection.updateOne(query, updates);
    if (result.matchedCount === 0) return res.status(404).send("Not found");
    return res.status(200).send(result);
  } catch (err) {
    console.error(err);
    return res.status(400).send("Invalid request");
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const db = getDb();
    const collection = db.collection("records");
    const query = { _id: new ObjectId(req.params.id) };

    const result = await collection.deleteOne(query);
    if (result.deletedCount === 0) return res.status(404).send("Not found");
    return res.status(200).send(result);
  } catch (err) {
    console.error(err);
    return res.status(400).send("Invalid id");
  }
});

export default router;
