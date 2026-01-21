import 'dotenv/config';
import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from 'url';
import startBirthdayCron from './utils/birthdayCron.js';
import { sessionConfig, setGlobalLocals } from './config/session.js';

// Import your routes
import employeeRoutes from './routes/employeeRoutes.js';
import authRoutes from './routes/authRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- 1. Database Connection ---
// It's better to connect and then start the server
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

// --- 2. View Engine Setup ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', 1);

// --- 3. Middleware ---
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(sessionConfig);
app.use(setGlobalLocals);

// --- 4. Static Files ---
app.use(express.static(path.join(__dirname, 'public')));
// Consolidate uploads to one path (Root 'uploads' folder)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 5. Routes ---
// Mount Auth first, then Employee routes
app.use('/auth', authRoutes);
app.use('/', employeeRoutes);

// --- 6. Automation ---
startBirthdayCron();

// --- 7. Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});