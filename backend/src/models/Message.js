import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    targetRole: { type: String, enum: ['student', 'admin', 'all'], default: 'student' },
    targetMenu: {
      type: String,
      enum: ['profile', 'institution', 'opportunities', 'progress', 'attendance', 'reports', 'messages'],
      default: 'messages'
    },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

export default mongoose.model('Message', messageSchema);
