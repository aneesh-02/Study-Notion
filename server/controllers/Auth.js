const bcrypt = require("bcryptjs");
const User = require("../models/User");
const OTP = require("../models/OTP");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const Profile = require("../models/Profile");
require("dotenv").config();

// 2]  Signup Controller for Registering USers
exports.signup = async (req, res) => {
  try {
    // 1)data fetch from request ki body
    // Destructure fields from the request body
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;
    // 2) validate krlo
    // Check if All Details are there or not
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).send({
        success: false,
        message: "All Fields are required",
      });
    }
    // 3) password match krlo
    // Check if password and confirm password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and Confirm Password do not match. Please try again.",
      });
    }

    //4)  Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please sign in to continue.",
      });
    }

    // 5) Find the most recent OTP for the email (stored in db)
    const recentOtp = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    // we just needed the most recent so
    //  .sort({ createdAt: -1 }) Sorts the OTPs by their createdAt timestamp in descending order (-1 means newest first).
    // .limit(1) Ensures that only the most recent OTP is retrieved.
    console.log(recentOtp);
    // 6) validate OTP
    if (recentOtp.length === 0) {
      // OTP not found for the email
      return res.status(400).json({
        success: false,
        message: "The OTP is not valid",
      });
    } else if (otp !== recentOtp.otp) {
      // Invalid OTP
      return res.status(400).json({
        success: false,
        message: "The OTP is not valid",
      });
    }

    //7) If all good till now
    //  - Hash the password using bcrypt package.
    const hashedPassword = await bcrypt.hash(password, 10);

    // let approved = "";
    // approved === "Instructor" ? (approved = false) : (approved = true);

    // 8 a) Create the Additional Profile (w null values) (and save in DB) For User for additionalDetails: profileDetails._id,
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    // 8) create an entry in db
    //  - Create the user
    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType: accountType,
      approved: approved,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
      // we'll use dicebear api for dps with Initials.
    });

    // 9) return resposne.
    return res.status(200).json({
      success: true,
      user,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again.",
    });
  }
};

// 3] Login controller for authenticating users
exports.login = async (req, res) => {
  try {
    // 1) Get email and password from request body
    const { email, password } = req.body;

    // 2) Validate data - Check if email or password is missing
    if (!email || !password) {
      // Return 400 Bad Request status code with error message
      return res.status(400).json({
        success: false,
        message: `Please Fill up All the Required Fields`,
      });
    }

    // 3) Find user with provided email and populate profile details
    const user = await User.findOne({ email }).populate("additionalDetails");

    // 4) If user not found with provided email
    if (!user) {
      // Return 401 Unauthorized status code with error message
      return res.status(401).json({
        success: false,
        message: `User is not Registered with Us Please SignUp to Continue`,
      });
    }

    // 5) Generate JWT token after password matching
    if (await bcrypt.compare(password, user.password)) {
        //create payload
      const payload = {
        email: user.email,
        id: user._id,
        role: user.role,
      };
      // create token 
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });
      // Save token to user document in database
      user.token = token;
      user.password = undefined;

      // 6) Set cookie for token and return success response
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // cookies expire after 3 days
        httpOnly: true,
      };
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: `User Login Success`,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: `Password is incorrect`,
      });
    }
  } catch (error) {
    console.error(error);
    // Return 500 Internal Server Error status code with error message
    return res.status(500).json({
      success: false,
      message: `Login Failure Please Try Again`,
    });
  }
};

// 1]  Send OTP controller For Email Verification
exports.sendotp = async (req, res) => {
  try {
    const { email } = req.body; // 1) fetch email from the request ki body

    // 2)   Check if user is already present
    // Find user with provided email
    // to be used in case of signup
    const checkUserPresent = await User.findOne({ email });

    // 3) If user aready exists and found with provided email - then return a response
    if (checkUserPresent) {
      // Return 401 Unauthorized status code with error message
      return res.status(401).json({
        success: false,
        message: `User is Already Registered`,
      });
    }

    // 4) generate otp - call this method generate with length 6 and these other conditions:
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("OTP generated:", otp);

    //5) check if the otp is unique or not
    const result = await OTP.findOne({ otp: otp });
    console.log("Result is Generate OTP Func");
    console.log("Result", result);
    //If result is null, it means the OTP is unique.
    // If result is not null, it means the OTP already exists, so a new one should be generated.

    // 6) until I'm getting a response in result I will keep generating an otp.
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      console.log("NEW OTP generated:", otp);
      // check again; keep checking.
      const result = await OTP.findOne({ otp: otp });
    }
    // Could use a better library that always generate a unique otp instead of this burte force.

    // 7) Now enter this otp in DB with email and otp - Create a Payload
    // We dont need to add createDate as a parameter bcz it defaults to Date.now - written in OTP.js
    const otpPayload = { email, otp };
    // create an entry in DB
    const otpBody = await OTP.create(otpPayload);
    console.log("OTP Body", otpBody);
    // return resposne
    res.status(200).json({
      success: true,
      message: `OTP Sent Successfully`,
      otp,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 4] Controller for Changing Password
exports.changePassword = async (req, res) => {
  try {
    //1) Get user data from req.user
    const userDetails = await User.findById(req.user.id);

    //2) Get old password, new password, and confirm new password from req.body
    const { oldPassword, newPassword } = req.body;

    //3) Validate old password
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    );
    if (!isPasswordMatch) {
      // If old password does not match, return a 401 (Unauthorized) error
      return res
        .status(401)
        .json({ success: false, message: "The password is incorrect" });
    }

    // 4) Update password
    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    );

    // 5) Send notification email
    try {
      const emailResponse = await mailSender(
        updatedUserDetails.email,
        "Password for your account has been updated",
        passwordUpdated(
          updatedUserDetails.email,
          `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
        )
      );
      console.log("Email sent successfully:", emailResponse.response);
    } catch (error) {
      // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while sending email:", error);
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
        error: error.message,
      });
    }

    //6) Return success response
    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
    console.error("Error occurred while updating password:", error);
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
      error: error.message,
    });
  }
};
