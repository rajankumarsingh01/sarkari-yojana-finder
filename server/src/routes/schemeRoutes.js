import express from "express";
import { listSchemes, getScheme } from "../controllers/schemeController.js";

const router = express.Router();

router.get("/", listSchemes);
router.get("/:slug", getScheme);

export default router;