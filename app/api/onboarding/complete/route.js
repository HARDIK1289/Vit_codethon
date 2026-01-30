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

    // 1. Save Commitments (Bills/EMIs)
    let totalCommitments = 0;
    if (commitments && commitments.length > 0) {
      const commitmentDocs = commitments.map(c => {
        totalCommitments += Number(c.amount);
        return { ...c, userId };
      });
      await Commitment.deleteMany({ userId }); // Clear old drafts if any
      await Commitment.insertMany(commitmentDocs);
    }

    // 2. Save Goals & Calculate Allocations
    let totalGoalAllocations = 0;
    if (goals && goals.length > 0) {
      const goalDocs = goals.map(g => {
        // Simple logic: if target is 50k in 5 months, save 10k/month
        const monthlyContribution = Math.ceil(Number(g.targetAmount) / Number(g.months));
        totalGoalAllocations += monthlyContribution;
        return {
          name: g.name,
          targetAmount: g.targetAmount,
          deadline: new Date(new Date().setMonth(new Date().getMonth() + Number(g.months))),
          monthlyContribution,
          userId
        };
      });
      await Goal.deleteMany({ userId });
      await Goal.insertMany(goalDocs);
    }

    // 3. Initialize Central Financial State
    const monthlyIncome = Number(income);
    const initialSpendableAmount = monthlyIncome - totalCommitments - totalGoalAllocations;

    await FinancialState.findOneAndUpdate(
      { userId },
      {
        monthlyIncome,
        totalCommitments,
        totalGoalAllocations,
        initialSpendableAmount,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );

    // 4. Mark Onboarding as Complete
    await User.findByIdAndUpdate(userId, { isOnboardingComplete: true });

    return NextResponse.json({ success: true, initialSpendableAmount });

  } catch (error) {
    console.error("Onboarding Error:", error);
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
  }
}