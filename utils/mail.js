import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail', // or your provider
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Unichem HR Portal" <${process.env.EMAIL_USER}>`,
            bcc: to, // Use BCC so employees don't see each other's emails
            subject: subject,
            html: html
        });
        console.log("Email sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Mail Error:", error);
        throw error;
    }
};