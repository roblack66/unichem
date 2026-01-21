import multer from 'multer';
import path from 'path';

// 1. Set Storage Engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/'); // Ensure this folder exists!
    },
    filename: (req, file, cb) => {
        // Create a unique filename: FullName-Timestamp.pdf
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// 2. Check File Type (Validation)
const fileFilter = (req, file, cb) => {
    const filetypes = /pdf|docx|doc/; // Accepting common resume formats
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only PDF or Word documents are allowed!'), false);
    }
};

// 3. Initialize Upload
export const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit: 5MB
    fileFilter: fileFilter
});