import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 80 },
  description: { type: String, required: true, trim: true, minlength: 5 },
  fileUrl: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, default: 0, required: true },
    rating: { type: Number, default: 0, required: true },
  },
  comments: [
    { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Comment" },
  ],
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
});

// This is a pre-save hook that runs before the video is saved to the database
// videoSchema.pre('save', async function() {
//     this.hashtags = this.hashtags[0]
//     .split(",")
//     .map((word) => word.startsWith("#") ? word : `#${word}`);
// });

videoSchema.static("formatHashtags", function (hashtags) {
  return hashtags
    .split(",")
    .map((word) => (word.startsWith("#") ? word : `#${word}`))
    .filter((word) => word.length > 0)
    .map((word) => word.trim());
});

const videoModel = mongoose.model("Video", videoSchema);
export default videoModel;
