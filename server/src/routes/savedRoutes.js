import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  getSavedSchemes,
  saveScheme,
  unsaveScheme,
} from "../controllers/savedController.js";

const router = express.Router();

router.use(requireAuth); // every route below needs login

router.get("/", getSavedSchemes);
router.post("/", saveScheme);
router.delete("/:slug", unsaveScheme);

export default router;