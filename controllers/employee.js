import { EmployeeModel } from '../models/employee.js';
import { LogModel } from '../models/log.js';
import { employeeSchemaValidation, broadcastValidation } from '../utils/validators.js';
import { sendEmail } from '../utils/mail.js';

const calculateAge = (birthDate) => {
    const today = new Date();
    const dob = new Date(birthDate);
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
};

// 1. CREATE Employee
export const createEmployee = async (req, res) => {
    const { error } = employeeSchemaValidation.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        return res.status(400).render('add-employee', { 
            errors: errorMessages, formData: req.body, employees: [] 
        });
    }
    try {
        const age = calculateAge(req.body.dob);
        const newEmployee = new EmployeeModel({
            ...req.body,
            age: age,
            resume: req.file ? req.file.filename : null 
        });
        await newEmployee.save();
        res.redirect('/'); 
    } catch (err) {
        res.status(500).render('add-employee', { errors: ['Database error.'], formData: req.body, employees: [] });
    }
};

// 2. GET Dashboard (Active)
export const getActiveEmployees = async (req, res) => {
    try {
        const employees = await EmployeeModel.find({ status: 'Active' }).sort({ createdAt: -1 });
        res.render('index', { employees });
    } catch (err) {
        res.status(500).send("Error fetching employees");
    }
};

// 3. ARCHIVE Action
export const archiveEmployee = async (req, res) => {
    try {
        await EmployeeModel.findByIdAndUpdate(req.params.id, { status: 'Archived' });
        res.redirect('/');
    } catch (err) {
        res.status(500).send("Error archiving");
    }
};

// 4. UNARCHIVE (Resume) Action
export const unarchiveEmployee = async (req, res) => {
    try {
        await EmployeeModel.findByIdAndUpdate(req.params.id, { status: 'Active' });
        res.redirect('/archive');
    } catch (err) {
        res.status(500).send("Error restoring employee");
    }
};

// 5. GET Archive Page
export const getArchivedEmployees = async (req, res) => {
    try {
        const archivedStaff = await EmployeeModel.find({ status: 'Archived' });
        res.render('archive', { archivedEmployees: archivedStaff, employees: [] });
    } catch (err) {
        res.status(500).send("Error fetching archive");
    }
};

// 6. EDIT & UPDATE
export const getEditEmployee = async (req, res) => {
    try {
        const employee = await EmployeeModel.findById(req.params.id);
        res.render('edit-employee', { employee });
    } catch (err) { res.status(500).send("Server Error"); }
};

export const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const age = calculateAge(req.body.dob);
        const updateData = { ...req.body, age };
        if (req.file) updateData.resume = req.file.filename;

        await EmployeeModel.findByIdAndUpdate(id, updateData, { new: true });
        res.redirect('/');
    } catch (err) { res.status(500).send("Error updating"); }
};

// 7. BIRTHDAY LOGIC (Fully Restored)
export const sendBirthdayWish = async (req, res) => {
    try {
        const employee = await EmployeeModel.findById(req.params.id);
        const htmlContent = `<div style="padding:20px;"><h1>Happy Birthday ${employee.fullName}!</h1></div>`;
        await sendEmail(employee.email, `Happy Birthday, ${employee.fullName}!`, htmlContent);
        res.redirect('/birthdays?success=true');
    } catch (err) { res.redirect('/birthdays?error=true'); }
};

export const getBirthdayNotifications = async (req, res) => {
    try {
        const today = new Date();
        const celebrants = await EmployeeModel.find({
            status: 'Active',
            $expr: { $and: [
                { $eq: [{ $month: '$dob' }, today.getMonth() + 1] },
                { $eq: [{ $dayOfMonth: '$dob' }, today.getDate()] }
            ]}
        });
        const lastRun = await LogModel.findOne({ taskName: 'Birthday Automation' }).sort({ runAt: -1 });
        res.render('birthdays', { employees: celebrants, lastRun: lastRun?.runAt, url: req.url });
    } catch (err) { res.status(500).send("Error"); }
};

// 8. BROADCAST (Fully Restored)
export const sendBroadcast = async (req, res) => {
    const { error } = broadcastValidation.validate(req.body);
    const activeStaff = await EmployeeModel.find({ status: 'Active' });
    if (error) return res.status(400).render('broadcast', { errors: error.details.map(d => d.message), formData: req.body, employees: activeStaff });

    try {
        const targets = await EmployeeModel.find({ status: 'Active' }).select('email');
        await sendEmail(targets.map(e => e.email), `UNICHEM: ${req.body.subject}`, `<p>${req.body.message}</p>`);
        res.render('broadcast', { success: `Broadcast sent!`, employees: activeStaff });
    } catch (err) { res.status(500).render('broadcast', { errors: ['Failed.'], employees: activeStaff }); }
};