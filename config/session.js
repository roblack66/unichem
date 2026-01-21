import session from 'express-session';
import MongoStore from 'connect-mongo';
import dotenv from 'dotenv';

dotenv.config();

export const sessionConfig = session({
    secret: process.env.SESSION_SECRET || 'unichem_ghana_secret_key',
    resave: false,
    saveUninitialized: false,
    proxy: true, // Required for live hosting
    store: MongoStore.create({ 
        mongoUrl: process.env.MONGO_URI,
        ttl: 24 * 60 * 60 
    }),
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24, 
        httpOnly: true,
        secure: false, // Set to false to prevent live "Secure-only" cookie blocks
        sameSite: 'lax' 
    }
});

export const setGlobalLocals = (req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
};