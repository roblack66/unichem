import { createTransport } from "nodemailer";

export const sendEmail = async (to, subject, htmlContent) => {
    try {
        const transporter = createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // Use SSL/TLS
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS // Your 16-character App Password
            }
        });

        const mailOptions = {
            // This uses your specific email as the sender
            from: `"Unichem HR" <romeoasante66@gmail.com>`, 
            to: Array.isArray(to) ? to.join(',') : to,
            subject: subject,
            html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent successfully:", info.messageId);
        return info;
    } catch (error) {
        console.error("❌ Email sending failed:", error);
        throw error;
    }
};