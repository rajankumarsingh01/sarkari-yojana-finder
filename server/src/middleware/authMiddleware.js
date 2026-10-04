import jwt from "jsonwebtoken";
import { AppError } from "../utils/errorHandler.js";

export function requireAuth(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) throw new AppError("Not authenticated", 401);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    next(new AppError("Not authenticated", 401));
  }
}