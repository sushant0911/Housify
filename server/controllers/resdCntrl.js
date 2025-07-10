import asyncHandler from "express-async-handler";
import { prisma } from "../config/prismaConfig.js";

// function to create a new residency
// This function checks if the residency already exists in the database by address.
export const createResidency = asyncHandler(async (req, res) => {
  console.log("=== CREATE RESIDENCY ENDPOINT CALLED ===");
  console.log("Request body:", req.body);
  console.log("Request headers:", req.headers);
  
  const {
    title,
    description,
    price,
    address,
    country,
    city,
    facilities,
    image,
    userEmail,
  } = req.body.data;

  console.log("Extracted data:", {
    title,
    description,
    price,
    address,
    country,
    city,
    facilities,
    image,
    userEmail,
  });

  if (!userEmail) {
    console.log("userEmail is missing");
    return res.status(400).send({ message: "userEmail is required" });
  }

  try {
    console.log("Creating residency with userEmail:", userEmail);
    
    // Test database connection first
    await prisma.$connect();
    console.log("Database connected successfully");
    
    const residency = await prisma.residency.create({
      data: {
        title,
        description,
        price,
        address,
        country,
        city,
        facilities,
        image,
        owner: { connect: { email: userEmail } },
      },
    });

    console.log("Residency created successfully:", residency);
    res.status(200).send({ message: "Residency created successfully", residency });
  } catch (err) {
    console.error("Error creating residency:", err);
    console.error("Error details:", err);
    
    if (err.code === "P2002") {
      res.status(400).send({ message: "A residency with this address already exists" });
    } else {
      res.status(500).send({ message: "Error creating residency", error: err.message });
    }
  }
});

// function to get all the residencies in  descending order
export const getAllResidencies = asyncHandler(async (req, res) => {
  const residencies = await prisma.residency.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  res.send(residencies);
});

// function to get a specific  residency
export const getResidency = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const residency = await prisma.residency.findUnique({
      where: { id },
    });
    res.send(residency);
  } catch (err) {
    throw new Error(err.message);
  }
});

// function to get properties owned by a user
export const getOwnedProperties = asyncHandler(async (req, res) => {
  console.log("=== GET OWNED PROPERTIES ENDPOINT CALLED ===");
  console.log("Request body:", req.body);
  console.log("Request headers:", req.headers);
  
  const { email } = req.body;
  
  if (!email) {
    console.log("Email is missing");
    return res.status(400).json({ message: "Email is required" });
  }
  
  try {
    console.log("Looking for properties owned by:", email);
    
    // Test database connection first
    await prisma.$connect();
    console.log("Database connected successfully");
    
    const properties = await prisma.residency.findMany({
      where: { userEmail: email },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log("Found owned properties:", properties);
    res.status(200).json({ properties });
    
  } catch (err) {
    console.error("Error in getOwnedProperties:", err);
    console.error("Error details:", err);
    res.status(500).json({ message: "Error fetching owned properties", error: err.message });
  }
});

// function to update a residency
export const updateResidency = asyncHandler(async (req, res) => {
  console.log("=== UPDATE RESIDENCY ENDPOINT CALLED ===");
  console.log("Request body:", req.body);
  console.log("Request params:", req.params);
  console.log("Request headers:", req.headers);
  
  const { id } = req.params;
  const {
    title,
    description,
    price,
    address,
    country,
    city,
    facilities,
    image,
    userEmail,
  } = req.body.data;

  console.log("Extracted data:", {
    title,
    description,
    price,
    address,
    country,
    city,
    facilities,
    image,
    userEmail,
  });

  if (!userEmail) {
    console.log("userEmail is missing");
    return res.status(400).send({ message: "userEmail is required" });
  }

  try {
    console.log("Updating residency with id:", id);
    
    // Test database connection first
    await prisma.$connect();
    console.log("Database connected successfully");
    
    // First check if the residency exists and belongs to the user
    const existingResidency = await prisma.residency.findUnique({
      where: { id },
    });

    if (!existingResidency) {
      console.log("Residency not found");
      return res.status(404).send({ message: "Residency not found" });
    }

    if (existingResidency.userEmail !== userEmail) {
      console.log("User not authorized to update this residency");
      return res.status(403).send({ message: "You are not authorized to update this residency" });
    }

    const updatedResidency = await prisma.residency.update({
      where: { id },
      data: {
        title,
        description,
        price,
        address,
        country,
        city,
        facilities,
        image,
      },
    });

    console.log("Residency updated successfully:", updatedResidency);
    res.status(200).send({ message: "Residency updated successfully", residency: updatedResidency });
  } catch (err) {
    console.error("Error updating residency:", err);
    console.error("Error details:", err);
    
    if (err.code === "P2002") {
      res.status(400).send({ message: "A residency with this address already exists" });
    } else {
      res.status(500).send({ message: "Error updating residency", error: err.message });
    }
  }
});

// function to delete a residency
export const deleteResidency = asyncHandler(async (req, res) => {
  console.log("=== DELETE RESIDENCY ENDPOINT CALLED ===");
  console.log("Request body:", req.body);
  console.log("Request params:", req.params);
  console.log("Request headers:", req.headers);
  
  const { id } = req.params;
  const { userEmail } = req.body;

  if (!userEmail) {
    console.log("userEmail is missing");
    return res.status(400).send({ message: "userEmail is required" });
  }

  try {
    console.log("Deleting residency with id:", id);
    
    // Test database connection first
    await prisma.$connect();
    console.log("Database connected successfully");
    
    // First check if the residency exists and belongs to the user
    const existingResidency = await prisma.residency.findUnique({
      where: { id },
    });

    if (!existingResidency) {
      console.log("Residency not found");
      return res.status(404).send({ message: "Residency not found" });
    }

    if (existingResidency.userEmail !== userEmail) {
      console.log("User not authorized to delete this residency");
      return res.status(403).send({ message: "You are not authorized to delete this residency" });
    }

    await prisma.residency.delete({
      where: { id },
    });

    console.log("Residency deleted successfully");
    res.status(200).send({ message: "Residency deleted successfully" });
  } catch (err) {
    console.error("Error deleting residency:", err);
    console.error("Error details:", err);
    res.status(500).send({ message: "Error deleting residency", error: err.message });
  }
});
