import express from "express";
import { getAllSchemes, getSchemeBySlug } from "../controllers/schemeController.js";

const router = express.Router();

router.get("/", getAllSchemes);
router.get("/:slug", getSchemeBySlug);

export default router;