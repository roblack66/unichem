import { UserModel } from '../models/users.js';
import bcrypt from 'bcryptjs';

// --- 1. GET LOGIN PAGE ---
export const getLoginPage = (req, res) => {
    // If user is already logged in, don't show login page, send to home
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('login', { error: null });
};

// --- 2. LOGIN LOGIC ---
export const login = async (req, res) => {
    const { username, password } = req.body;

    // DEBUG: Check if data is actually reaching the controller
    console.log("Login attempt for:", username);

    try {
        // Find user by username
        const user = await UserModel.findOne({ username });
        
        if (!user) {
            console.log("❌ User not found in database");
            return res.render('login', { error: 'Invalid username or password' });
        }

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            console.log("❌ Password mismatch for user:", username);
            return res.render('login', { error: 'Invalid username or password' });
        }

        // Save user info to session
        req.session.user = {
            id: user._id,
            username: user.username,
            role: user.role
        };

        // Explicitly save session before redirecting to ensure data is written to DB
        req.session.save((err) => {
            if (err) {
                console.error("Session save error:", err);
                return res.status(500).send("Internal Server Error");
            }
            console.log("✅ Login successful, session saved.");
            res.redirect('/');
        });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).send("Server Error");
    }
};

// --- 3. LOGOUT LOGIC ---
export const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) console.log("Logout error:", err);
        res.clearCookie('connect.sid'); // Clears the session cookie from browser
        res.redirect('/auth/login');
    });
};

// --- 4. TEMPORARY SIGNUP (FOR SEEDING) ---
export const signup = async (req, res) => {
    const { username, password, role } = req.body;
    try {
        // 1. Delete existing user to clear old double-hashed data
        await UserModel.deleteOne({ username });

        // 2. Hash the password manually here
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Save the HASHED password to the database
        const newUser = new UserModel({ 
            username, 
            password: hashedPassword, 
            role: role || 'admin' 
        });

        await newUser.save();
        res.status(201).json({ message: "User created! Controller handled the hashing." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};