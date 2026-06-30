import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(cors({
    origin: CORS_ORIGIN,
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/api/status', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

app.listen(PORT, () => {
    console.log(`🚀 SiteChat Server running on port ${PORT}`);
});
