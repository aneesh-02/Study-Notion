// Import the Mongoose library
const mongoose = require("mongoose");

// Define the user schema using the Mongoose Schema constructor
const userSchema = new mongoose.Schema({
  // Define the name field with type String, required, and trimmed
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  // Define the email field with type String, required, and trimmed
  email: {
    type: String,
    required: true,
    trim: true,
  },

  // Define the password field with type String and required
  password: {
    type: String,
    required: true,
  },
  // Define the role field with type String and enum values of "Admin", "Student", or "Visitor" bcz the account can be of these types.
  accountType: {
    type: String,
    enum: ["Admin", "Student", "Instructor"],
    required: true,
  },

  //Refereing Profile model
  additionalDetails: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Profile",
  },
  //Refering courses model and as an array bcz there could be multiple courses.
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],

  // type string bcz it's a url
  image: {
    type: String,
    required: true,
  },
  //Refering courses progress and as an array bcz there could be multiple courses.
  courseProgress: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courseProgress",
    },
  ],
});

// Export the Mongoose model for the user schema, using the name "user"
module.exports = mongoose.model("user", userSchema);
