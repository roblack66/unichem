export const sendEmail = async (to, subject, htmlContent) => {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'api-key': process.env.BREVO_API_KEY,
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            sender: { 
                name: "Unichem HR", 
                email: process.env.EMAIL_USER // Your verified email in Brevo
            },
            to: Array.isArray(to) ? to.map(email => ({ email })) : [{ email: to }],
            subject: subject,
            htmlContent: htmlContent
        })
    });

    if (!response.ok) {
        const error = await response.json();
        console.error("❌ BREVO API ERROR:", error);
        throw new Error('Failed to send email via API');
    }

    console.log("✅ Email sent via API successfully");
    return await response.json();
};