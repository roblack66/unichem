export const protect = (req, res, next) => {
    // Check if the user session exists
    if (!req.session || !req.session.user) {
        // If not logged in, redirect to login page
        return res.redirect('/auth/login');
    }
    next();
};

export const authorizeHR = (req, res, next) => {
    // Double check that the logged-in user has the 'admin' role
    if (req.session.user.role !== 'admin') {
        return res.status(403).send("Access Denied: You do not have HR Administrative privileges.");
    }
    next();
};