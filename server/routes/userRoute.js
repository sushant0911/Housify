import express from "express";
import {
  bookVisit,
  cancelBooking,
  createUser,
  getAllBookings,
  getAllFavorites,
  toFav,
} from "../controllers/userCntrl.js";
import jwtCheck from "../config/auth0Config.js";
const router = express.Router();

router.post("/register", jwtCheck, createUser);
router.post("/register-test", createUser); // Temporary endpoint for testing without JWT
router.post("/register-no-auth", createUser); // Endpoint without JWT for fallback
router.post("/bookVisit/:id", jwtCheck, bookVisit);
router.post("/bookVisit-no-auth/:id", bookVisit); // Temporary endpoint for testing
router.post("/allBookings", jwtCheck, getAllBookings);
router.post("/allBookings-no-auth", getAllBookings); // Temporary endpoint for testing

// Test endpoint to verify server is working
router.get("/test", (req, res) => {
  res.status(200).send({ message: "Server is working" });
});
router.post("/removeBooking/:id", jwtCheck, cancelBooking);
router.post("/toFav/:rid", toFav); // Temporarily removed JWT check for debugging
router.post("/allFav/", getAllFavorites); // Temporarily removed JWT check for debugging
export { router as userRoute };
