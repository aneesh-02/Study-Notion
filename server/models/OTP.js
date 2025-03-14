// Whenver someone comes up to sign up we redirect them to the OTP screen. 
// OTP is sent, user enters, submits - only then there is an entry in DB
// SO the OTP email goes before any entry in DB
// therefore OTP code has to run before the document is created. 
// 
// PRE and POST Hooks are used SCHEMA ke neeche MODEL ke upar. 
// Pre-save Hook (pre middleware) =  Runs before saving a document to the database.
// Post-save Hook (post middleware) = Runs after saving a document.
// Therfore the email sent has to be OTP Schema ke baad OTP Model ke pehle.
// Inside the PRE MIDDLEWARE

const mongoose = require("mongoose");
// Middleware: 
const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  // to check if its valid or expired
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 5, // The document will be automatically deleted after 5 minutes of its creation time
  },
});

// function to send emails
async function sendVerificationEmail(email,otp)
{
    try{
        const mailResponse = await mailSender(email, "Verification Email from StudyNotion" , otp); // call the mailSender function from util folder.
        console.log("Email sent successfully: ", mailResponse);
    }
    catch (error) {
      // Good practice to write custom msgs with errors so its easy to debug in future for us and others. 
      console.log("Error occured while sending emails:" , error);
      throw error;
  }
}

// pre middleware
OTPSchema.pre("save", async function(next){
  // right before the doc is attached to db, send this verification email with this data. 
  await sendVerificationEmail(this.email, this.otp);
  // and call the next middleware
  next();
})


module.exports = mongoose.model("OTP", OTPSchema);
