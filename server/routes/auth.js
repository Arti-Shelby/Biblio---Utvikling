import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDb } from "../db/connection.js";

const router = express.Router();

function calcAge(birthDate) {
  const b = new Date(birthDate);
  if (Number.isNaN(b.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - b.getFullYear();
  const m = today.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
  return age;
}

router.post("/register", async (req, res) => {
  const db = getDb();
  const users = db.collection("users");

  const { name, email, password, birthDate, guardianName, guardianPhone } =
    req.body;

  if (!name || !email || !password || !birthDate) {
    return res.status(400).send("Missing required fields");
  }

  const age = calcAge(birthDate);
  if (age === null) return res.status(400).send("Invalid birthDate");

  if (age < 18 && !guardianPhone) {
    return res
      .status(400)
      .send("Du er under 18 år. Telefonnummer til foresatt må registreres.");
  }

  const existing = await users.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).send("Email already in use");

  const passwordHash = await bcrypt.hash(password, 10);

  const userDoc = {
    name,
    email: email.toLowerCase(),
    passwordHash,
    birthDate: new Date(birthDate),
    role: "student", // default
    guardian:
      age < 18
        ? { name: guardianName || "", phone: guardianPhone }
        : null,
    createdAt: new Date(),
  };

  const result = await users.insertOne(userDoc);

  const token = jwt.sign(
    { userId: result.insertedId.toString(), role: userDoc.role },
    process.env.JWT_SECRET || "dev_secret",
    { expiresIn: "7d" }
  );

  return res.status(201).json({
    token,
    user: { _id: result.insertedId, name: userDoc.name, role: userDoc.role },
  });
});

router.post("/login", async (req, res) => {
  const db = getDb();
  const users = db.collection("users");

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).send("Missing credentials");

  const user = await users.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(401).send("Invalid email or password");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).send("Invalid email or password");

  const token = jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_SECRET || "dev_secret",
    { expiresIn: "7d" }
  );

  return res.status(200).json({
    token,
    user: { _id: user._id, name: user.name, role: user.role },
  });
});

export default router;
