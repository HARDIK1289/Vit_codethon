import mongoose from 'mongoose';

const CommitmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true }, // e.g., "Netflix", "Rent"
  amount: { type: Number, required: true },
  type: { 
    type: String, 
    enum: ['bill', 'emi', 'subscription'], 
    required: true 
  },
  // For EMIs
  endDate: { type: Date }, 
  remainingMonths: { type: Number },
  // For Bills/Subs
  dueDay: { type: Number }, // 1-31
});

export default mongoose.models.Commitment || mongoose.model('Commitment', CommitmentSchema);