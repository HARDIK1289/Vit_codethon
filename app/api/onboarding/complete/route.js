import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Commitment from '@/models/Commitment';
import Goal from '@/models/Goal';
import FinancialState from '@/models/FinancialState';

export async function POST(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();
    const { income, commitments, goals } = await req.json();
    const userId = session.user.id;

    console.log("Saving data for User:", userId); // Debug Log

    // 1. SAVE COMMITMENTS
    let totalCommitments = 0;
    if (commitments && commitments.length > 0) {
      await Commitment.deleteMany({ userId }); // Clear old
      const commitmentDocs = commitments.map(c => {
        totalCommitments += Number(c.amount);
        return {
          userId, // LINK TO USER
          name: c.name,
          amount: Number(c.amount),
          type: c.type
        };
      });
      await Commitment.insertMany(commitmentDocs);
    }

    // 2. SAVE GOALS
    let totalGoalAllocations = 0;
    if (goals && goals.length > 0) {
      await Goal.deleteMany({ userId }); // Clear old
      const goalDocs = goals.map(g => {
        const monthlyContribution = Math.ceil(Number(g.targetAmount) / Number(g.months));
        totalGoalAllocations += monthlyContribution;
        return {
          userId, // LINK TO USER
          name: g.name,
          targetAmount: Number(g.targetAmount),
          savedAmount: 0, // Start at 0
          deadline: new Date(new Date().setMonth(new Date().getMonth() + Number(g.months))),
          monthlyContribution
        };
      });
      await Goal.insertMany(goalDocs);
    }

    // 3. CREATE/UPDATE FINANCIAL STATE
    const monthlyIncome = Number(income);
    const initialSpendableAmount = monthlyIncome - totalCommitments - totalGoalAllocations;

    await FinancialState.findOneAndUpdate(
      { userId },
      {
        userId,
        monthlyIncome,
        totalCommitments,
        totalGoalAllocations,
        initialSpendableAmount,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );

    // 4. UPDATE USER STATUS
    await User.findByIdAndUpdate(userId, { isOnboardingComplete: true });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Save Error:", error);
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
  }
}