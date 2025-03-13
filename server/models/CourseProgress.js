const mongoose = require("mongoose");

// Define the courseProgress schema
const courseProgress = new mongoose.Schema({
  // Reference to Course object .
  courseID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },

  //Array of vidoes. Video is a reference to subSection
  completedVideos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubSection",
    },
  ],
});

// Export the courseProgress model
module.exports = mongoose.model("courseProgress", courseProgress);
