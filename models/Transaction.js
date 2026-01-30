import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  category: { type: String, default: 'Uncategorized' },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  isRecurring: { type: Boolean, default: false }
});

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);