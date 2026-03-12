import mongoose from 'mongoose';

const eventSummarySchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    title: { type: String, trim: true },
    summary: { type: String, required: true, trim: true },
    imageUrls: [{ type: String }],
    publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

export default mongoose.model('EventSummary', eventSummarySchema);