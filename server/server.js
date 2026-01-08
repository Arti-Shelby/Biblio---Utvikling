import express from "express";
import cors from "cors";
import "dotenv/config";

import { connectToMongo } from "./db/connection.js";
import { notFound, errorHandler } from "./middleware/error.js";

import records from "./routes/record.js";
import items from "./routes/items.js";
import auth from "./routes/auth.js";
import loans from "./routes/loans.js";

const PORT = process.env.PORT || 5050;
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  })
);

app.use(express.json());

app.get("/api/health", (req, res) => res.status(200).json({ ok: true }));

app.use("/api/records", records);
app.use("/api/items", items);
app.use("/api/auth", auth);
app.use("/api/loans", loans);

app.use(notFound);
app.use(errorHandler);

connectToMongo()
  .then(() => {
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });
