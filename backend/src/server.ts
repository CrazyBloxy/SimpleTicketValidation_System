import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import authRoutes from './routes/auth'; 
import tapRoutes from './routes/tap';
import logsRoutes from './routes/logs';
import adminRoutes from './routes/admin';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Passtap Backend is running!' });
});

app.use('/api/auth', authRoutes);
app.use('/api', tapRoutes);
app.use('/api', logsRoutes);
app.use('/api', adminRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});