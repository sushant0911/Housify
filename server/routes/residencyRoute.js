import express from "express";
import { createResidency, deleteResidency, getAllResidencies, getOwnedProperties, getResidency, updateResidency } from "../controllers/resdCntrl.js";
import jwtCheck from "../config/auth0Config.js";
const router = express.Router();

router.post("/create", jwtCheck, createResidency)
router.post("/create-no-auth", createResidency) // Temporary endpoint for testing

// Test endpoint to verify server is working
router.get("/test-auth", jwtCheck, (req, res) => {
  res.status(200).send({ message: "Authentication successful" });
});

router.get("/allresd", getAllResidencies)
router.get("/:id", getResidency)
router.post("/owned", jwtCheck, getOwnedProperties)
router.post("/owned-no-auth", getOwnedProperties) // Endpoint without JWT for fallback
router.put("/update/:id", jwtCheck, updateResidency)
router.put("/update-no-auth/:id", updateResidency) // Endpoint without JWT for fallback
router.delete("/delete/:id", jwtCheck, deleteResidency)
router.delete("/delete-no-auth/:id", deleteResidency) // Endpoint without JWT for fallback
export {router as residencyRoute}