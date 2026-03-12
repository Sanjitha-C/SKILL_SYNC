import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    present: { type: Boolean, default: false },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

attendanceSchema.index({ student: 1, event: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
