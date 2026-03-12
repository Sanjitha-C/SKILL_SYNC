import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, trim: true, default: 'General' },
    interests: [{ type: String, trim: true }],
    domains: [{ type: String, trim: true }],
    registrationFee: { type: Number, min: 0, default: 0 },
    slots: { type: Number, min: 0, default: 0 },
    registrationLink: { type: String, trim: true },
    date: { type: Date, required: true },
    venue: { type: String, required: true, trim: true },
    posterUrl: { type: String },
    publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

export default mongoose.model('Event', eventSchema);
