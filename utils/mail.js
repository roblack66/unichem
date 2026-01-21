import nodemailer from 'nodemailer';

export const sendEmail = async (to, subject, htmlContent) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Must be false for port 587
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        // Force the connection to wait longer and ignore certificate issues
        connectionTimeout: 20000, 
        greetingTimeout: 20000,
        tls: {
            rejectUnauthorized: false,
            minVersion: 'TLSv1.2'
        }
    });

    const mailOptions = {
        from: `"Unichem HR" <${process.env.EMAIL_USER}>`,
        to: Array.isArray(to) ? to.join(',') : to,
        subject: subject,
        html: htmlContent,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent successfully");
        return info;
    } catch (err) {
        console.error("❌ FINAL SMTP ERROR:", err.code, err.message);
        throw err;
    }
};