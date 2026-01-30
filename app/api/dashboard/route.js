import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import dbConnect from '@/lib/dbConnect';
import FinancialState from '@/models/FinancialState';
import Goal from '@/models/Goal';
import Transaction from '@/models/Transaction';

export async function GET(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const userId = session.user.id;

  // 1. Fetch State
  const state = await FinancialState.findOne({ userId });
  
  // CRITICAL: If no state found, user hasn't onboarded. Return 404.
  if (!state) {
    return NextResponse.json({ error: "Setup incomplete" }, { status: 404 });
  }

  // 2. Calculate Transactions
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const transactions = await Transaction.find({
    userId,
    date: { $gte: firstDay }
  });

  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

  // 3. Math
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const today = now.getDate();
  const remainingDays = daysInMonth - today + 1;
  const currentSpendable = state.initialSpendableAmount - totalSpent;
  const dailySafeSpend = remainingDays > 0 ? (currentSpendable / remainingDays) : 0;

  // 4. Fetch Goals
  const goals = await Goal.find({ userId });

  return NextResponse.json({
    budget: {
      income: state.monthlyIncome,
      committed: state.totalCommitments + state.totalGoalAllocations,
      initialSpendable: state.initialSpendableAmount,
    },
    status: {
      totalSpent,
      remainingSpendable: currentSpendable,
      dailySafeSpend,
      daysLeft: remainingDays
    },
    goals
  });
}