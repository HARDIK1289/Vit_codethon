import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import dbConnect from '@/lib/dbConnect';
import Transaction from '@/models/Transaction';
import FinancialState from '@/models/FinancialState';

export async function POST(req) {
  // 1. Security Check
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();
    const { amount, description, category, date } = await req.json();
    const userId = session.user.id;

    // 2. Validate Input
    if (!amount || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 3. Create the Transaction Record
    const newTransaction = await Transaction.create({
      userId,
      amount: Number(amount),
      description: description || "Simulated Purchase",
      category,
      type: 'debit',
      date: date ? new Date(date) : new Date(), // Allow simulating past dates if needed
      isRecurring: false
    });

    // 4. (Optional) We could update a running total in FinancialState here for performance,
    // but our Dashboard calculates it fresh every load, which is safer for data integrity.

    return NextResponse.json({ 
      success: true, 
      id: newTransaction._id,
      message: `Injected -₹${amount} (${category})`
    });

  } catch (error) {
    console.error("Simulation Error:", error);
    return NextResponse.json({ error: "Injection Failed" }, { status: 500 });
  }
}