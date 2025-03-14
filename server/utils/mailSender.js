// Import the nodemailer package, which is used to send emails in Node.js.
const nodemailer = require("nodemailer");

// Define an asynchronous function `mailSender` to send emails.
const mailSender = async (email, title, body) => {
    try {
        // Create a transporter object using the SMTP configuration.
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST, // Mail server host (e.g., SMTP server)
            auth: {
                user: process.env.MAIL_USER, // SMTP authentication user (email sender)
                pass: process.env.MAIL_PASS, // SMTP authentication password
            }
        });

        // Send the email using the transporter.
        let info = await transporter.sendMail({
            from: 'StudyNotion || by Aneesh Sharma', // Sender name
            to: `${email}`, // Recipient email address 
            subject: `${title}`, // Email subject
            html: `${body}`, // Email content (in HTML format)
        });

        // Log email sending information (useful for debugging).
        console.log(info);

        // Return the response from nodemailer.
        return info;
    } 
    catch (error) {
        // Catch and log any errors that occur while sending the email.
        console.log(error.message);
    }
}

// Export the `mailSender` function so it can be used in other files.
// Use this function in OTP Model. 
module.exports = mailSender;
