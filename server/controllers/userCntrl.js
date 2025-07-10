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
    
    const user = await prisma.user.findUnique({
      where: { email },
      select: { bookedVisits: true },
    });
    
    console.log("Found user bookings:", user);
    
    if (!user || !user.bookedVisits) {
      console.log("User not found or no bookings, returning empty bookings");
      return res.status(200).send({ bookedVisits: [] });
    }
    
    // Get full property details for each booking
    const bookingsWithDetails = [];
    
    for (const booking of user.bookedVisits) {
      try {
        const property = await prisma.residency.findUnique({
          where: { id: booking.id },
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            address: true,
            city: true,
            country: true,
            image: true,
            facilities: true,
            userEmail: true
          }
        });
        
        if (property) {
          bookingsWithDetails.push({
            id: booking.id,
            date: booking.date,
            time: booking.time || "Not specified",
            status: booking.status || "pending",
            property: property
          });
        } else {
          console.log(`Property with id ${booking.id} not found`);
          // Still include the booking even if property is not found
          bookingsWithDetails.push({
            id: booking.id,
            date: booking.date,
            time: booking.time || "Not specified",
            status: booking.status || "pending",
            property: null
          });
        }
      } catch (propertyError) {
        console.error(`Error fetching property ${booking.id}:`, propertyError);
        // Include booking even if property fetch fails
        bookingsWithDetails.push({
          id: booking.id,
          date: booking.date,
          time: booking.time || "Not specified",
          status: booking.status || "pending",
          property: null
        });
      }
    }
    
    console.log("Returning bookings with details:", bookingsWithDetails);
    res.status(200).send({ bookedVisits: bookingsWithDetails });
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
      return res.status(404).json({ message: "Booking not found" });
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
      return res.status(200).json({ message: "Booking cancelled successfully" });
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

// function to get all visitors for properties owned by a user
export const getPropertyVisitors = asyncHandler(async (req, res) => {
  console.log("=== GET PROPERTY VISITORS ENDPOINT CALLED ===");
  console.log("Request body:", req.body);
  console.log("Request headers:", req.headers);
  
  const { email } = req.body;
  
  if (!email) {
    console.log("Email is missing");
    return res.status(400).json({ message: "Email is required" });
  }
  
  try {
    console.log("Looking for visitors for properties owned by:", email);
    
    // Test database connection first
    await prisma.$connect();
    console.log("Database connected successfully");
    
    // First, get all properties owned by this user
    const ownedProperties = await prisma.residency.findMany({
      where: { userEmail: email },
      select: { id: true, title: true, address: true, city: true, country: true }
    });
    
    console.log("Found owned properties:", ownedProperties);
    
    if (!ownedProperties || ownedProperties.length === 0) {
      console.log("No properties found for this user");
      return res.status(200).json({ visitors: [] });
    }
    
    // Get all users who have booked visits to any of these properties
    const allUsers = await prisma.user.findMany({
      select: { 
        email: true, 
        name: true, 
        image: true, 
        bookedVisits: true 
      }
    });
    
    console.log("Found all users with bookings");
    
    // Filter users who have booked visits to the owner's properties
    const visitors = [];
    
    allUsers.forEach(user => {
      if (user.bookedVisits && Array.isArray(user.bookedVisits)) {
        user.bookedVisits.forEach(booking => {
          const property = ownedProperties.find(prop => prop.id === booking.id);
          if (property) {
            visitors.push({
              visitorEmail: user.email,
              visitorName: user.name,
              visitorImage: user.image,
              propertyId: booking.id,
              propertyTitle: property.title,
              propertyAddress: property.address,
              propertyCity: property.city,
              propertyCountry: property.country,
              visitDate: booking.date
            });
          }
        });
      }
    });
    
    console.log("Found visitors:", visitors);
    res.status(200).json({ visitors });
    
  } catch (err) {
    console.error("Error in getPropertyVisitors:", err);
    console.error("Error details:", err);
    res.status(500).json({ message: "Error fetching property visitors", error: err.message });
  }
});

// function to accept a property visit
export const acceptVisit = asyncHandler(async (req, res) => {
  console.log("=== ACCEPT VISIT ENDPOINT CALLED ===");
  console.log("Request body:", req.body);
  console.log("Request params:", req.params);
  
  const { propertyOwnerEmail } = req.body;
  const { visitorEmail, propertyId } = req.params;
  
  if (!propertyOwnerEmail || !visitorEmail || !propertyId) {
    console.log("Missing required fields:", { propertyOwnerEmail, visitorEmail, propertyId });
    return res.status(400).json({ message: "Property owner email, visitor email, and property ID are required" });
  }
  
  try {
    console.log("Looking for visitor with email:", visitorEmail);
    
    // Test database connection first
    await prisma.$connect();
    console.log("Database connected successfully");
    
    // Find the visitor's booking
    const visitor = await prisma.user.findUnique({
      where: { email: visitorEmail },
      select: { bookedVisits: true },
    });
    
    if (!visitor) {
      console.log("Visitor not found");
      return res.status(404).json({ message: "Visitor not found" });
    }
    
    // Find the specific booking for this property
    const bookingIndex = visitor.bookedVisits.findIndex(visit => visit.id === propertyId);
    
    if (bookingIndex === -1) {
      console.log("Booking not found for this property");
      return res.status(404).json({ message: "Booking not found for this property" });
    }
    
    // Update the booking status to confirmed
    visitor.bookedVisits[bookingIndex].status = "confirmed";
    
    await prisma.user.update({
      where: { email: visitorEmail },
      data: {
        bookedVisits: visitor.bookedVisits,
      },
    });
    
    console.log("Visit accepted successfully");
    res.status(200).json({ 
      message: "Visit accepted successfully",
      booking: visitor.bookedVisits[bookingIndex]
    });
  } catch (err) {
    console.error("Error in acceptVisit:", err);
    console.error("Error details:", err);
    res.status(500).json({ message: "Error accepting visit", error: err.message });
  }
});

// function to reschedule a property visit
export const rescheduleVisit = asyncHandler(async (req, res) => {
  console.log("=== RESCHEDULE VISIT ENDPOINT CALLED ===");
  console.log("Request body:", req.body);
  console.log("Request params:", req.params);
  
  const { propertyOwnerEmail, newDate, newTime } = req.body;
  const { visitorEmail, propertyId } = req.params;
  
  if (!propertyOwnerEmail || !visitorEmail || !propertyId || !newDate) {
    console.log("Missing required fields:", { propertyOwnerEmail, visitorEmail, propertyId, newDate });
    return res.status(400).json({ message: "Property owner email, visitor email, property ID, and new date are required" });
  }
  
  try {
    console.log("Looking for visitor with email:", visitorEmail);
    
    // Test database connection first
    await prisma.$connect();
    console.log("Database connected successfully");
    
    // Find the visitor's booking
    const visitor = await prisma.user.findUnique({
      where: { email: visitorEmail },
      select: { bookedVisits: true },
    });
    
    if (!visitor) {
      console.log("Visitor not found");
      return res.status(404).json({ message: "Visitor not found" });
    }
    
    // Find the specific booking for this property
    const bookingIndex = visitor.bookedVisits.findIndex(visit => visit.id === propertyId);
    
    if (bookingIndex === -1) {
      console.log("Booking not found for this property");
      return res.status(404).json({ message: "Booking not found for this property" });
    }
    
    // Update the booking with new date and time
    visitor.bookedVisits[bookingIndex].date = newDate;
    if (newTime) {
      visitor.bookedVisits[bookingIndex].time = newTime;
    }
    visitor.bookedVisits[bookingIndex].status = "rescheduled";
    
    await prisma.user.update({
      where: { email: visitorEmail },
      data: {
        bookedVisits: visitor.bookedVisits,
      },
    });
    
    console.log("Visit rescheduled successfully");
    res.status(200).json({ 
      message: "Visit rescheduled successfully",
      booking: visitor.bookedVisits[bookingIndex]
    });
  } catch (err) {
    console.error("Error in rescheduleVisit:", err);
    console.error("Error details:", err);
    res.status(500).json({ message: "Error rescheduling visit", error: err.message });
  }
});

// function to discard a property visit
export const discardVisit = asyncHandler(async (req, res) => {
  console.log("=== DISCARD VISIT ENDPOINT CALLED ===");
  console.log("Request body:", req.body);
  console.log("Request params:", req.params);
  
  const { propertyOwnerEmail } = req.body;
  const { visitorEmail, propertyId } = req.params;
  
  if (!propertyOwnerEmail || !visitorEmail || !propertyId) {
    console.log("Missing required fields:", { propertyOwnerEmail, visitorEmail, propertyId });
    return res.status(400).json({ message: "Property owner email, visitor email, and property ID are required" });
  }
  
  try {
    console.log("Looking for visitor with email:", visitorEmail);
    
    // Test database connection first
    await prisma.$connect();
    console.log("Database connected successfully");
    
    // Find the visitor's booking
    const visitor = await prisma.user.findUnique({
      where: { email: visitorEmail },
      select: { bookedVisits: true },
    });
    
    if (!visitor) {
      console.log("Visitor not found");
      return res.status(404).json({ message: "Visitor not found" });
    }
    
    // Find the specific booking for this property
    const bookingIndex = visitor.bookedVisits.findIndex(visit => visit.id === propertyId);
    
    if (bookingIndex === -1) {
      console.log("Booking not found for this property");
      return res.status(404).json({ message: "Booking not found for this property" });
    }
    
    // Remove the booking from the visitor's bookedVisits array
    visitor.bookedVisits.splice(bookingIndex, 1);
    
    await prisma.user.update({
      where: { email: visitorEmail },
      data: {
        bookedVisits: visitor.bookedVisits,
      },
    });
    
    console.log("Visit discarded successfully");
    res.status(200).json({ 
      message: "Visit discarded successfully"
    });
  } catch (err) {
    console.error("Error in discardVisit:", err);
    console.error("Error details:", err);
    res.status(500).json({ message: "Error discarding visit", error: err.message });
  }
});
