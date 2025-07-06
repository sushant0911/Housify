import express from "express";
import { createResidency, getAllResidencies, getResidency } from "../controllers/resdCntrl.js";
import jwtCheck from "../config/auth0Config.js";
const router = express.Router();

router.post("/create", jwtCheck, createResidency)
router.post("/create-no-auth", createResidency) // Temporary endpoint for testing

// Test endpoint to verify JWT is working
router.get("/test-auth", jwtCheck, (req, res) => {
  res.status(200).send({ message: "JWT authentication working", user: req.auth });
});
router.get("/allresd", getAllResidencies)
router.get("/:id", getResidency)
export {router as residencyRoute}