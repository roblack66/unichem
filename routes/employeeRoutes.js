import { Router } from 'express';
import { upload } from '../middlewares/upload.js';
import * as employeeController from '../controllers/employee.js';
import { EmployeeModel } from '../models/employee.js';
import { protect, authorizeHR } from '../middlewares/auth.js'; 

const router = Router();

// --- PUBLIC / EMPLOYEE ROUTES (View Only) ---
router.get('/', employeeController.getActiveEmployees);
router.get('/birthdays', employeeController.getBirthdayNotifications);

// --- PROTECTED HR ADMIN ROUTES (Requires Login) ---
router.get('/add-employee', protect, authorizeHR, async (req, res) => {
    res.render('add-employee', { employees: [], errors: [], formData: {} }); 
});

router.get('/archive', protect, authorizeHR, employeeController.getArchivedEmployees);

router.get('/broadcast', protect, authorizeHR, async (req, res) => {
    try {
        const employees = await EmployeeModel.find({ status: 'Active' });
        res.render('broadcast', { employees, errors: [], success: null });
    } catch (err) {
        res.render('broadcast', { employees: [], errors: [], success: null });
    }
});

router.get('/employees/edit/:id', protect, authorizeHR, employeeController.getEditEmployee);

// --- ACTION ROUTES (Admin Only Actions) ---
router.post('/employees', protect, authorizeHR, upload.single('resume'), employeeController.createEmployee);

// Handle Archiving
router.post('/employees/archive/:id', protect, authorizeHR, employeeController.archiveEmployee);

// NEW: Handle Unarchiving (Resume Status)
router.post('/employees/unarchive/:id', protect, authorizeHR, employeeController.unarchiveEmployee);

router.post('/broadcast/send', protect, authorizeHR, employeeController.sendBroadcast);
router.post('/employees/send-wish/:id', protect, authorizeHR, employeeController.sendBirthdayWish);
router.post('/employees/edit/:id', protect, authorizeHR, upload.single('resume'), employeeController.updateEmployee);

export default router;