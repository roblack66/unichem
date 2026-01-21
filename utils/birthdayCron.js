import cron from 'node-cron';
import { EmployeeModel } from '../models/employee.js'; 
import { sendEmail } from './mail.js';
import { LogModel } from '../models/log.js'; // Import the new Log model

const startBirthdayCron = () => {
    // Runs at 08:00 AM daily
    cron.schedule('0 8 * * *', async () => {
        console.log('--- Daily Birthday Check Started ---');
        let emailsSentCount = 0;
        
        try {
            const today = new Date();
            const currentMonth = today.getMonth() + 1;
            const currentDay = today.getDate();

            const celebrants = await EmployeeModel.find({
                status: 'Active',
                $expr: {
                    $and: [
                        { $eq: [{ $month: '$dob' }, currentMonth] },
                        { $eq: [{ $dayOfMonth: '$dob' }, currentDay] }
                    ]
                }
            });

            if (celebrants.length > 0) {
                for (const emp of celebrants) {
                    const htmlContent = `
                        <div style="font-family: 'Montserrat', sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                            <div style="background-color: #db2777; padding: 20px; text-align: center;">
                                <h1 style="color: white; margin: 0;">Happy Birthday! 🎂</h1>
                            </div>
                            <div style="padding: 30px; text-align: center; color: #334155;">
                                <p style="font-size: 18px;">Dear <strong>${emp.fullName}</strong>,</p>
                                <p>On behalf of the <strong>Unichem Ghana Group</strong>, we wish you a wonderful birthday filled with joy, health, and prosperity!</p>
                                <p style="margin-top: 20px; font-size: 24px;">🎈 🎁 🎊</p>
                            </div>
                        </div>
                    `;

                    await sendEmail(emp.email, `Happy Birthday, ${emp.fullName}!`, htmlContent);
                    emailsSentCount++;
                }
            }

            // --- THE LOGGING PART ---
            // Create a record in the DB to prove the automation ran
            await LogModel.create({
                taskName: 'Birthday Automation',
                status: 'Success',
                emailsSent: emailsSentCount,
                runAt: new Date()
            });

            console.log(`✅ Cron Finished: ${emailsSentCount} emails sent and logged.`);

        } catch (err) {
            console.error('❌ CRON ERROR:', err);
            // Log the failure too
            await LogModel.create({
                taskName: 'Birthday Automation',
                status: 'Failed',
                error: err.message,
                runAt: new Date()
            });
        }
    });
};

export default startBirthdayCron;