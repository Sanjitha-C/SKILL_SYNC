import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    comment: { type: String, trim: true }
  },
  { timestamps: true }
);

feedbackSchema.index({ student: 1, event: 1 }, { unique: true });

export default mongoose.model('Feedback', feedbackSchema);
