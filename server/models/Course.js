const mongoose = require("mongoose");

// Define the Courses schema
const coursesSchema = new mongoose.Schema({
  courseName: {
    type: String,
    trim: true,
  },
  courseDescription: { type: String },
  // ref to user
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },
  whatYouWillLearn: {
    type: String,
  },
  // array of ref to sections
  courseContent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
    },
  ],
  // could be more than one reviews.
  ratingAndReviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RatingAndReview",
    },
  ],
  price: {
    type: Number,
  },
  thumbnail: {
    type: String,
  },
  tag: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tag",
  },
  studentsEnrolled: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
  ],
});

// Export the Courses model
module.exports = mongoose.model("Course", coursesSchema);
