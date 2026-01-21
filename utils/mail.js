import nodemailer from 'nodemailer';

export const sendEmail = async (to, subject, htmlContent) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: 465, // Use 465 for SSL (More stable for live servers)
        secure: true, 
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"Unichem HR" <${process.env.EMAIL_USER}>`,
        to: Array.isArray(to) ? to.join(',') : to,
        subject: subject,
        html: htmlContent,
    };

    return transporter.sendMail(mailOptions);
};