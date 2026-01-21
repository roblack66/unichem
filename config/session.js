import session from 'express-session';
import MongoStore from 'connect-mongo';
import dotenv from 'dotenv';

dotenv.config();

// Determine if we are in production mode
const isProduction = process.env.NODE_ENV === 'production';

export const sessionConfig = session({
    secret: process.env.SESSION_SECRET || 'unichem_ghana_secret_key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        mongoUrl: process.env.MONGO_URI,
        ttl: 24 * 60 * 60 // Sessions expire in 1 day in the DB
    }),
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        httpOnly: true, // Prevents client-side JS from reading the cookie
        secure: isProduction, // ONLY true if using HTTPS (Production)
        sameSite: isProduction ? 'none' : 'lax' // Required for cross-site cookies in some hosting environments
    }
});

// Middleware to set global variables for EJS
export const setGlobalLocals = (req, res, next) => {
    // This allows all .ejs files to access 'user' without passing it manually
    res.locals.user = req.session.user || null;
    next();
};