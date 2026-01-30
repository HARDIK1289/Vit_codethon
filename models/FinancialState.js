import mongoose from 'mongoose';

const FinancialStateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  monthlyIncome: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  
  // Caching these totals makes the Dashboard load faster
  totalCommitments: { type: Number, default: 0 }, // Bills + EMIs + Subs
  totalGoalAllocations: { type: Number, default: 0 }, // Monthly goal contributions
  
  // The Golden Number: How much is actually safe to spend for the whole month
  initialSpendableAmount: { type: Number, default: 0 },
  
  lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.models.FinancialState || mongoose.model('FinancialState', FinancialStateSchema);