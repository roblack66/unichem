import nodemailer from 'nodemailer';

export const sendEmail = async (to, subject, htmlContent) => {
    // 1. Create the transporter with specific production settings
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        // IMPORTANT: These settings bypass common live server firewalls
        pool: true, 
        maxConnections: 1,
        tls: {
            rejectUnauthorized: false
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
        console.log("✅ Email sent successfully:", info.messageId);
        return info;
    } catch (err) {
        // This will print the EXACT reason it's failing in your Render/Railway Logs
        console.error("❌ NODEMAILER LIVE ERROR:", err);
        throw err; 
    }
};