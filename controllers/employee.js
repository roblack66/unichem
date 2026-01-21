import { EmployeeModel } from '../models/employee.js';
import { LogModel } from '../models/log.js'; // Ensure case-sensitivity matches your filename
import { employeeSchemaValidation, broadcastValidation } from '../utils/validators.js';
import { sendEmail } from '../utils/mail.js';

// --- HELPER FUNCTION FOR AGE ---
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
            errors: errorMessages, 
            formData: req.body,
            employees: [] 
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
        console.error("Database Error:", err);
        res.status(500).render('add-employee', { 
            errors: ['Database error: Likely a duplicate email.'], 
            formData: req.body,
            employees: []
        });
    }
};

// 2. GET Edit Form
export const getEditEmployee = async (req, res) => {
    try {
        const employee = await EmployeeModel.findById(req.params.id);
        if (!employee) return res.status(404).send("Employee not found");
        res.render('edit-employee', { employee });
    } catch (err) {
        res.status(500).send("Server Error");
    }
};

// 3. UPDATE Employee
export const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, email, dob, department, contact } = req.body;
        const age = calculateAge(dob);

        const updateData = { fullName, email, dob, age, department, contact };

        if (req.file) {
            updateData.resume = req.file.filename;
        }

        const updatedEmployee = await EmployeeModel.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        );

        if (!updatedEmployee) return res.status(404).send("Employee not found");
        res.redirect('/');
    } catch (err) {
        console.error("❌ Update Error:", err);
        res.status(500).send("Error updating employee: " + err.message);
    }
};

// 4. GET Dashboard
export const getActiveEmployees = async (req, res) => {
    try {
        const employees = await EmployeeModel.find({ status: 'Active' }).sort({ createdAt: -1 });
        res.render('index', { employees });
    } catch (err) {
        res.status(500).send("Error fetching employees");
    }
};

// 5. ARCHIVE Employee
export const archiveEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        await EmployeeModel.findByIdAndUpdate(id, { status: 'Archived' });
        res.redirect('/');
    } catch (err) {
        res.status(500).send("Error archiving employee");
    }
};

// 6. GET Archive
export const getArchivedEmployees = async (req, res) => {
    try {
        const archivedStaff = await EmployeeModel.find({ status: 'Archived' });
        res.render('archive', { archivedEmployees: archivedStaff, employees: [] });
    } catch (err) {
        res.status(500).send("Error fetching archive");
    }
};

// 7. SEND Manual Birthday Wish (Enhanced with URL feedback)
export const sendBirthdayWish = async (req, res) => {
    try {
        const employee = await EmployeeModel.findById(req.params.id);
        if (!employee) return res.status(404).send("Employee not found");

        const htmlContent = `
            <div style="font-family: 'Montserrat', sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
                <div style="background-color: #db2777; padding: 20px; text-align: center; color: white;">
                    <h1 style="margin: 0;">Happy Birthday! 🎂</h1>
                </div>
                <div style="padding: 30px; text-align: center; color: #334155;">
                    <p style="font-size: 18px;">Dear <strong>${employee.fullName}</strong>,</p>
                    <p>The HR Team at <strong>Unichem Ghana Group</strong> wishes you a wonderful birthday filled with joy and prosperity!</p>
                </div>
                <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8;">
                    This is an official celebration email from Unichem HR.
                </div>
            </div>`;

        await sendEmail(employee.email, `Happy Birthday, ${employee.fullName}!`, htmlContent);
        
        // Passing success=true to the URL so birthday.ejs can trigger the toast
        res.redirect('/birthdays?success=true');
    } catch (err) {
        console.error("Manual Send Error:", err);
        res.redirect('/birthdays?error=true');
    }
};

// 8. GET Birthday Page (Fixed to pass URL helper for toast logic)
export const getBirthdayNotifications = async (req, res) => {
    try {
        const today = new Date();
        const currentMonth = today.getMonth() + 1; 
        const currentDay = today.getDate();

        const birthdayCelebrants = await EmployeeModel.find({
            status: 'Active',
            $expr: {
                $and: [
                    { $eq: [{ $month: '$dob' }, currentMonth] },
                    { $eq: [{ $dayOfMonth: '$dob' }, currentDay] }
                ]
            }
        });

        const lastRun = await LogModel.findOne({ taskName: 'Birthday Automation' }).sort({ runAt: -1 });

        res.render('birthdays', { 
            employees: birthdayCelebrants, 
            lastRun: lastRun ? lastRun.runAt : null,
            title: "Today's Birthdays",
            url: req.url // Passing req.url so the EJS can check for ?success=true
        });
    } catch (err) {
        res.status(500).send("Error fetching birthdays");
    }
};

// 9. SEND Broadcast Email
export const sendBroadcast = async (req, res) => {
    const { error } = broadcastValidation.validate(req.body, { abortEarly: false });
    const activeStaff = await EmployeeModel.find({ status: 'Active' });

    if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        return res.status(400).render('broadcast', { 
            errors: errorMessages, 
            formData: req.body, 
            employees: activeStaff 
        });
    }

    try {
        const { subject, message, targetDepartment } = req.body;
        let query = { status: 'Active' };
        if (targetDepartment && targetDepartment !== 'All') query.department = targetDepartment;

        const targets = await EmployeeModel.find(query).select('email');
        const emailList = targets.map(emp => emp.email);

        if (emailList.length === 0) {
            return res.status(400).render('broadcast', { errors: ['No employees found.'], employees: activeStaff });
        }

        await sendEmail(emailList, `UNICHEM: ${subject}`, `<p>${message}</p>`);
        res.render('broadcast', { success: `Broadcast sent!`, employees: activeStaff });
    } catch (err) {
        res.status(500).render('broadcast', { errors: ['Failed to send.'], employees: activeStaff });
    }
};