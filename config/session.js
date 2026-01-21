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
    proxy: true, // ADD THIS: Vital for live hosting (Render/Railway/etc)
    store: MongoStore.create({ 
        mongoUrl: process.env.MONGO_URI,
        ttl: 24 * 60 * 60 
    }),
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        // If your live link is NOT https, change 'isProduction' to false temporarily
        secure: isProduction, 
        sameSite: isProduction ? 'none' : 'lax'
    }
});

// Middleware to set global variables for EJS
export const setGlobalLocals = (req, res, next) => {
    // This allows all .ejs files to access 'user' without passing it manually
    res.locals.user = req.session.user || null;
    next();
};