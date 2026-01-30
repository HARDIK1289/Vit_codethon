import mongoose from 'mongoose';

const GoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true }, // e.g., "MacBook Pro"
  targetAmount: { type: Number, required: true },
  savedAmount: { type: Number, default: 0 },
  deadline: { type: Date, required: true },
  monthlyContribution: { type: Number, required: true }, // Calculated by engine
});

export default mongoose.models.Goal || mongoose.model('Goal', GoalSchema);