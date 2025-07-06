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
