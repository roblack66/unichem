import nodemailer from 'nodemailer';

export const sendEmail = async (to, subject, htmlContent) => {
    // We use 'service' which is optimized for live cloud environments like Render
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, // Must be the 16-character App Password
        },
        // These settings prevent the ETIMEDOUT error by increasing the wait time
        connectionTimeout: 10000, 
        greetingTimeout: 10000,
        socketTimeout: 10000,
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
        // Detailed logging to see if it's still a connection issue or an auth issue
        console.error("❌ NODEMAILER LIVE ERROR:", err.code, err.command);
        throw err;
    }
};