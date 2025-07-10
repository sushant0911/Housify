import express from "express";
import {
  bookVisit,
  cancelBooking,
  createUser,
  getAllBookings,
  getAllFavorites,
  getPropertyVisitors,
  toFav,
  acceptVisit,
  rescheduleVisit,
  discardVisit
} from "../controllers/userCntrl.js";
import jwtCheck, { optionalJwtCheck } from "../config/auth0Config.js";
const router = express.Router();

// Routes with optional JWT authentication (will work with or without valid token)
router.post("/register", optionalJwtCheck, createUser);
router.post("/bookVisit/:id", optionalJwtCheck, bookVisit);
router.post("/allBookings", optionalJwtCheck, getAllBookings);
router.post("/removeBooking/:id", optionalJwtCheck, cancelBooking);
router.post("/propertyVisitors", optionalJwtCheck, getPropertyVisitors);
router.post("/accept-visit/:visitorEmail/:propertyId", optionalJwtCheck, acceptVisit);
router.post("/reschedule-visit/:visitorEmail/:propertyId", optionalJwtCheck, rescheduleVisit);
router.post("/discard-visit/:visitorEmail/:propertyId", optionalJwtCheck, discardVisit);

// Fallback routes without JWT authentication for development/testing
router.post("/register-no-auth", createUser);
router.post("/bookVisit-no-auth/:id", bookVisit);
router.post("/allBookings-no-auth", getAllBookings);
router.post("/removeBooking-no-auth/:id", cancelBooking);
router.post("/propertyVisitors-no-auth", getPropertyVisitors);
router.post("/accept-visit-no-auth/:visitorEmail/:propertyId", acceptVisit);
router.post("/reschedule-visit-no-auth/:visitorEmail/:propertyId", rescheduleVisit);
router.post("/discard-visit-no-auth/:visitorEmail/:propertyId", discardVisit);

// Routes that don't require authentication
router.post("/toFav/:rid", toFav);
router.post("/allFav", getAllFavorites);

// Test endpoint to verify server is working
router.get("/test", (req, res) => {
  res.status(200).send({ message: "Server is working" });
});

export { router as userRoute };
