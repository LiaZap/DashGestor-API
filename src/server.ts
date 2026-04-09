import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { metaRouter } from './routes/meta';
import { googleRouter } from './routes/google';
import { dashboardRouter } from './routes/dashboard';
import { authMiddleware } from './middleware/auth';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes
app.use('/api/auth', authRouter);

// Protected routes
app.use('/api/meta', authMiddleware, metaRouter);
app.use('/api/google', authMiddleware, googleRouter);
app.use('/api/dashboard', authMiddleware, dashboardRouter);

app.listen(PORT, () => {
  console.log(`🚀 GestorDash API running on port ${PORT}`);
});
