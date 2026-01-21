import { Router } from 'express';
import { upload } from '../middlewares/upload.js';
import * as employeeController from '../controllers/employee.js';
import { EmployeeModel } from '../models/employee.js';
import { protect, authorizeHR } from '../middlewares/auth.js'; // New Gatekeepers

const router = Router();

// --- PUBLIC / EMPLOYEE ROUTES (View Only) ---

// Home Page: Everyone can see who works at Unichem
router.get('/', employeeController.getActiveEmployees);

// Birthday Page: Everyone can see today's celebrations
router.get('/birthdays', employeeController.getBirthdayNotifications);


// --- PROTECTED HR ADMIN ROUTES (Requires Login) ---

// Form to add a new employee (Admin Only)
router.get('/add-employee', protect, authorizeHR, async (req, res) => {
    res.render('add-employee', { employees: [] }); 
});

// Archive View (Admin Only)
router.get('/archive', protect, authorizeHR, employeeController.getArchivedEmployees);

// Broadcast View (Admin Only)
router.get('/broadcast', protect, authorizeHR, async (req, res) => {
    try {
        const employees = await EmployeeModel.find({ status: 'Active' });
        res.render('broadcast', { employees });
    } catch (err) {
        res.render('broadcast', { employees: [] });
    }
});

// Edit View (Admin Only)
router.get('/employees/edit/:id', protect, authorizeHR, employeeController.getEditEmployee);


// --- ACTION ROUTES (Admin Only Actions) ---

// Handle Creating Employee
router.post('/employees', protect, authorizeHR, upload.single('resume'), employeeController.createEmployee);

// Handle Archiving
router.post('/employees/archive/:id', protect, authorizeHR, employeeController.archiveEmployee);

// Handle Broadcast sending
router.post('/broadcast/send', protect, authorizeHR, employeeController.sendBroadcast);

// Handle Manual Birthday Wish
router.post('/employees/send-wish/:id', protect, authorizeHR, employeeController.sendBirthdayWish);

// Handle Updating Employee
router.post('/employees/edit/:id', protect, authorizeHR, upload.single('resume'), employeeController.updateEmployee);

export default router;