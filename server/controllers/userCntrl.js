import asyncHandler from "express-async-handler";

import { prisma } from "../config/prismaConfig.js";

// function to create a new user
// This function checks if the user already exists in the database by email.
export const createUser = asyncHandler(async (req, res) => {
  console.log("=== CREATE USER ENDPOINT CALLED ===");
  console.log("Request body:", req.body);
  console.log("Request headers:", req.headers);

  let { email } = req.body;
  
  if (!email) {
    console.log("Email is missing from request body");
    return res.status(400).send({ message: "Email is required" });
  }

  console.log("Attempting to create user with email:", email);

  try {
    // Test database connection first
    await prisma.$connect();
    console.log("Database connected successfully");
    
    const userExists = await prisma.user.findUnique({ where: { email: email } });
    console.log("User exists check result:", userExists);
    
    if (!userExists) {
      const userData = { 
        email: email,
        name: req.body.name || null,
        image: req.body.image || null
      };
      console.log("Creating user with data:", userData);
      
      const user = await prisma.user.create({ data: userData });
      console.log("User created successfully:", user);
      res.status(200).send({
        message: "User registered successfully",
        user: user,
      });
    } else {
      console.log("User already exists:", userExists);
      res.status(200).send({ message: "User already registered" });
    }
  } catch (error) {
    console.error("=== ERROR CREATING USER ===");
    console.error("Error details:", error);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    res.status(500).send({ message: "Error creating user", error: error.message });
  }
});

// function to book a visit to residency
export const bookVisit = asyncHandler(async (req, res) => {
  console.log("=== BOOK VISIT ENDPOINT CALLED ===");
  console.log("Request body:", req.body);
  console.log("Request params:", req.params);
  console.log("Request headers:", req.headers);
  
  const { email, date } = req.body;
  const { id } = req.params;

  if (!email || !date || !id) {
    console.log("Missing required fields:", { email, date, id });
    return res.status(400).json({ message: "Email, date, and id are required" });
  }

  try {
    console.log("Looking for user with email:", email);
    
    // Test database connection first
    await prisma.$connect();
    console.log("Database connected successfully");
    
    const alreadyBooked = await prisma.user.findUnique({
      where: { email },
      select: { bookedVisits: true },
    });

    console.log("Found user bookings:", alreadyBooked);

    if (!alreadyBooked) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already booked
    const isAlreadyBooked = alreadyBooked.bookedVisits && 
                           alreadyBooked.bookedVisits.some((visit) => visit.id === id);
    
    if (isAlreadyBooked) {
      console.log("Residency already booked by user");
      return res.status(400).json({ message: "This residency is already booked by you" });
    }

    console.log("Booking the visit...");
    const updatedUser = await prisma.user.update({
      where: { email: email },
      data: {
        bookedVisits: { push: { id, date } },
      },
    });
    
    console.log("Visit booked successfully");
    console.log("Updated user bookings:", updatedUser.bookedVisits);
    
    res.status(200).json({ 
      message: "Your visit is booked successfully",
      booking: { id, date }
    });
  } catch (err) {
    console.error("Error in bookVisit:", err);
    console.error("Error details:", err);
    res.status(500).json({ message: "Error booking visit", error: err.message });
  }
});

// funtion to get all bookings of a user
export const getAllBookings = asyncHandler(async (req, res) => {
  console.log("=== GET ALL BOOKINGS ENDPOINT CALLED ===");
  console.log("Request body:", req.body);
  console.log("Request headers:", req.headers);
  
  const { email } = req.body;
  
  if (!email) {
    console.log("Email is missing");
    return res.status(400).send({ message: "Email is required" });
  }
  
  try {
    console.log("Looking for bookings for email:", email);
    
    // Test database connection first
    await prisma.$connect();
    console.log("Database connected successfully");
    
    const bookings = await prisma.user.findUnique({
      where: { email },
      select: { bookedVisits: true },
    });
    
    console.log("Found bookings:", bookings);
    
    if (!bookings) {
      console.log("User not found, returning empty bookings");
      return res.status(200).send({ bookedVisits: [] });
    }
    
    console.log("Returning bookings:", bookings.bookedVisits);
    res.status(200).send({ bookedVisits: bookings.bookedVisits || [] });
  } catch (err) {
    console.error("Error in getAllBookings:", err);
    console.error("Error details:", err);
    res.status(500).send({ message: "Error fetching bookings", error: err.message });
  }
});

// function to cancel the booking
export const cancelBooking = asyncHandler(async (req, res) => {
  console.log("=== CANCEL BOOKING ENDPOINT CALLED ===");
  console.log("Request body:", req.body);
  console.log("Request params:", req.params);
  
  const { email } = req.body;
  const { id } = req.params;
  
  if (!email || !id) {
    console.log("Missing required fields:", { email, id });
    return res.status(400).json({ message: "Email and id are required" });
  }
  
  try {
    console.log("Looking for user with email:", email);
    const user = await prisma.user.findUnique({
      where: { email: email },
      select: { bookedVisits: true },
    });

    console.log("Found user bookings:", user);

    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    const index = user.bookedVisits.findIndex((visit) => visit.id === id);
    console.log("Booking index:", index);

    if (index === -1) {
      console.log("Booking not found");
      res.status(404).json({ message: "Booking not found" });
    } else {
      console.log("Removing booking...");
      user.bookedVisits.splice(index, 1);
      await prisma.user.update({
        where: { email },
        data: {
          bookedVisits: user.bookedVisits,
        },
      });

      console.log("Booking cancelled successfully");
      res.send("Booking cancelled successfully");
    }
  } catch (err) {
    console.error("Error in cancelBooking:", err);
    throw new Error(err.message);
  }
});

// function to add a resd in favourite list of a user
export const toFav = asyncHandler(async (req, res) => {
  console.log("=== TO FAV ENDPOINT CALLED ===");
  console.log("Request body:", req.body);
  console.log("Request params:", req.params);
  
  const { email } = req.body;
  const { rid } = req.params;

  if (!email || !rid) {
    console.log("Missing email or rid");
    return res.status(400).send({ message: "Email and rid are required" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    console.log("Found user:", user);
    console.log("Current favorites:", user?.favResidenciesID);

    if (!user) {
      console.log("User not found");
      return res.status(404).send({ message: "User not found" });
    }

    if (user.favResidenciesID.includes(rid)) {
      console.log("Removing from favorites");
      const updateUser = await prisma.user.update({
        where: { email },
        data: {
          favResidenciesID: {
            set: user.favResidenciesID.filter((id) => id !== rid),
          },
        },
      });

      console.log("Updated user after removal:", updateUser);
      res.send({ message: "Removed from favorites", user: updateUser });
    } else {
      console.log("Adding to favorites");
      const updateUser = await prisma.user.update({
        where: { email },
        data: {
          favResidenciesID: {
            push: rid,
          },
        },
      });
      
      console.log("Updated user after addition:", updateUser);
      res.send({ message: "Updated favorites", user: updateUser });
    }
  } catch (err) {
    console.error("Error in toFav:", err);
    throw new Error(err.message);
  }
 });

// function to get all favorites
export const getAllFavorites = asyncHandler(async (req, res) => {
  console.log("=== GET ALL FAVORITES ENDPOINT CALLED ===");
  console.log("Request body:", req.body);
  
  const { email } = req.body;
  
  if (!email) {
    console.log("Email is missing");
    return res.status(400).send({ message: "Email is required" });
  }

  try {
    const favResd = await prisma.user.findUnique({
      where: { email },
      select: { favResidenciesID: true },
    });
    
    console.log("Found favorites:", favResd);
    res.status(200).send(favResd);
  } catch (err) {
    console.error("Error in getAllFavorites:", err);
    throw new Error(err.message);
  }
});
