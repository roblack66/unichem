import { Schema, model } from 'mongoose';

export const employeeSchema = new Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    contact: {
        type: String,
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    age: {
        type: Number,
    },
    department: {
        type: String,
        required: true
    },
    resume: {
        type: String, // Path to the uploaded PDF
        required: false
    },
    status: {
        type: String,
        enum: ['Active', 'Archived'],
        default: 'Active'
    }
}, { 
    timestamps: true 
});

export const EmployeeModel = model('employee', employeeSchema);