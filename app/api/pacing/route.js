import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import dbConnect from '@/lib/dbConnect';
import FinancialState from '@/models/FinancialState';
import Transaction from '@/models/Transaction';

export async function GET(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const userId = session.user.id;

  // 1. Fetch State
  const state = await FinancialState.findOne({ userId });
  if (!state) return NextResponse.json({ error: "No data" }, { status: 404 });

  // 2. Time Calculations
  const now = new Date();
  
  // Start of Month (for calculating total remaining budget)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Start of TODAY (00:00:00) - To find what you spent just today
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 3. Fetch Transactions
  // We need two sets: All month (to know what's left) AND Today (to know specific daily burn)
  const allTxns = await Transaction.find({
    userId,
    date: { $gte: startOfMonth }
  });

  // Filter in memory to save a DB call
  const monthlySpent = allTxns.reduce((sum, t) => sum + t.amount, 0);
  const todayTxns = allTxns.filter(t => new Date(t.date) >= startOfToday);
  const todaySpent = todayTxns.reduce((sum, t) => sum + t.amount, 0);

  // 4. The Golden Math
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate(); // e.g., 15
  const remainingDays = daysInMonth - currentDay + 1;

  // How much money is actually left for the month?
  const totalRemaining = state.initialSpendableAmount - monthlySpent;

  // THE LIMIT: If you have 3000 left and 10 days, you can spend 300/day.
  // We add back 'todaySpent' to the numerator because the limit is for the *whole* day, 
  // including what you already spent.
  // Formula: (Remaining Balance + Spent Today) / Remaining Days
  const dailyLimit = remainingDays > 0 
    ? ((totalRemaining + todaySpent) / remainingDays) 
    : 0;

  return NextResponse.json({
    dailyLimit,
    todaySpent,
    remainingForToday: dailyLimit - todaySpent,
    todayTxns,
    status: todaySpent > dailyLimit ? 'OVERSPENT' : 'SAFE'
  });
}