// models/Log.js
import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
    taskName: String, // e.g., "Birthday Automation"
    status: String,   // "Success" or "Failed"
    emailsSent: Number,
    runAt: { type: Date, default: Date.now }
});

export const LogModel = mongoose.model('Log', logSchema);