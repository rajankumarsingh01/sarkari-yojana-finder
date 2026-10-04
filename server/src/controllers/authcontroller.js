import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { registerSchema, loginSchema, parseOrThrow } from "../utils/validators.js";
import { AppError } from "../utils/errorHandler.js";

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

function setAuthCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = parseOrThrow(registerSchema, req.body);

    const existing = await User.findOne({ email });
    if (existing) throw new AppError("Email already registered", 409);

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });

    const token = signToken(user._id);
    setAuthCookie(res, token);

    res.status(201).json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = parseOrThrow(loginSchema, req.body);

    const user = await User.findOne({ email });
    if (!user) throw new AppError("Invalid credentials", 401);

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) throw new AppError("Invalid credentials", 401);

    const token = signToken(user._id);
    setAuthCookie(res, token);

    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    next(err);
  }
}

export function logout(req, res) {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
}

export async function me(req, res, next) {
  try {
    const user = await User.findById(req.userId).select("-passwordHash");
    if (!user) throw new AppError("User not found", 404);
    res.json(user);
  } catch (err) {
    next(err);
  }
}