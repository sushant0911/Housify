import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { userRoute } from './routes/userRoute.js';
import { residencyRoute } from './routes/residencyRoute.js';
import { prisma } from './config/prismaConfig.js';

dotenv.config()

const app = express();

const PORT = process.env.PORT || 8000;

app.use(express.json())
app.use(cookieParser())
app.use(cors())

// Test database connection
app.get('/api/test', async (req, res) => {
  try {
    await prisma.$connect();
    res.json({ message: 'Database connected successfully' });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
});

app.listen(PORT, ()=> {
    console.log(`Server is running on port ${PORT}`);
    console.log('Environment variables:');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
});

app.use('/api/user', userRoute)
app.use("/api/residency", residencyRoute)