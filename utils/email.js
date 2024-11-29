const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Email templates
const templates = {
    newEstimate: (estimate) => ({
        subject: 'New Estimate Request - Mo City Gutters',
        text: `
New estimate request received:

Name: ${estimate.name}
Email: ${estimate.email}
Phone: ${estimate.phone}
Address: ${estimate.address}

Project Details:
- Linear Feet: ${estimate.linearFeet}
- Stories: ${estimate.stories}
- Gutter Type: ${estimate.gutterType}
- Gutter Guard: ${estimate.gutterGuard ? 'Yes' : 'No'}
- Estimated Cost: $${estimate.estimatedCost.toFixed(2)}

View full details in the admin dashboard.
`,
        html: `
<h2>New Estimate Request</h2>
<p>A new estimate request has been received from the website.</p>

<h3>Customer Information</h3>
<ul>
    <li><strong>Name:</strong> ${estimate.name}</li>
    <li><strong>Email:</strong> ${estimate.email}</li>
    <li><strong>Phone:</strong> ${estimate.phone}</li>
    <li><strong>Address:</strong> ${estimate.address}</li>
</ul>

<h3>Project Details</h3>
<ul>
    <li><strong>Linear Feet:</strong> ${estimate.linearFeet}</li>
    <li><strong>Stories:</strong> ${estimate.stories}</li>
    <li><strong>Gutter Type:</strong> ${estimate.gutterType}</li>
    <li><strong>Gutter Guard:</strong> ${estimate.gutterGuard ? 'Yes' : 'No'}</li>
    <li><strong>Estimated Cost:</strong> $${estimate.estimatedCost.toFixed(2)}</li>
</ul>

<p><a href="${process.env.ADMIN_URL}/estimates">View full details in the admin dashboard</a></p>
`
    }),

    newContact: (contact) => ({
        subject: 'New Contact Form Submission - Mo City Gutters',
        text: `
New contact form submission received:

Name: ${contact.name}
Email: ${contact.email}
Phone: ${contact.phone || 'Not provided'}

Message:
${contact.message}

View all messages in the admin dashboard.
`,
        html: `
<h2>New Contact Form Submission</h2>
<p>A new message has been received from the website contact form.</p>

<h3>Contact Information</h3>
<ul>
    <li><strong>Name:</strong> ${contact.name}</li>
    <li><strong>Email:</strong> ${contact.email}</li>
    <li><strong>Phone:</strong> ${contact.phone || 'Not provided'}</li>
</ul>

<h3>Message</h3>
<p>${contact.message}</p>

<p><a href="${process.env.ADMIN_URL}/contacts">View all messages in the admin dashboard</a></p>
`
    })
};

// Send email function
async function sendEmail(template, data) {
    try {
        const emailContent = templates[template](data);
        
        const mailOptions = {
            from: process.env.SMTP_FROM,
            to: process.env.ADMIN_EMAIL,
            subject: emailContent.subject,
            text: emailContent.text,
            html: emailContent.html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

module.exports = {
    sendEmail
};
