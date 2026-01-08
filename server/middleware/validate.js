import { ObjectId } from "mongodb";
import { HttpError } from "../utils/httpError.js";

export function validateObjectId(paramName = "id") {
  return (req, _res, next) => {
    const val = req.params[paramName];
    if (!ObjectId.isValid(val)) return next(new HttpError(400, "Invalid id"));
    next();
  };
}
