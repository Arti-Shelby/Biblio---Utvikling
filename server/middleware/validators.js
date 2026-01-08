import { HttpError } from "../utils/httpError.js";

export function requireFields(fields = []) {
  return (req, _res, next) => {
    for (const f of fields) {
      if (req.body?.[f] === undefined || req.body?.[f] === null || req.body?.[f] === "")
        return next(new HttpError(400, `Missing field: ${f}`));
    }
    next();
  };
}

export function validateItemBody(req, _res, next) {
  const { title, type, totalCount } = req.body;

  if (!title || typeof title !== "string") return next(new HttpError(400, "Invalid title"));
  if (!["book", "movie"].includes(type)) return next(new HttpError(400, "Invalid type"));
  if (typeof totalCount !== "number" || totalCount < 1)
    return next(new HttpError(400, "totalCount must be a number >= 1"));

  next();
}

export function validateRegisterBody(req, _res, next) {
  const { name, email, password, birthDate } = req.body;

  if (!name) return next(new HttpError(400, "Missing field: name"));
  if (!email || !email.includes("@")) return next(new HttpError(400, "Invalid email"));
  if (!password || password.length < 6) return next(new HttpError(400, "Password must be at least 6 chars"));
  if (!birthDate) return next(new HttpError(400, "Missing field: birthDate"));

  next();
}
