import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import dbConnect from '@/lib/dbConnect';
import Transaction from '@/models/Transaction';
import FinancialState from '@/models/FinancialState';

export async function GET(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ insight: null, error: "API Key Missing" });

  try {
    await dbConnect();
    const userId = session.user.id;
    const state = await FinancialState.findOne({ userId });
    
    // Get last 50 transactions for better context
    const transactions = await Transaction.find({ userId }).sort({ date: -1 }).limit(50);

    if (transactions.length === 0) {
      return NextResponse.json({ 
        json: {
          score: 100,
          leak: "Ghost Town Detected.",
          leakDesc: "You haven't spent a single rupee yet. Either you are an ascetic monk or you forgot to use the Simulator.",
          roast: "I can't roast a blank sheet of paper. Go buy something stupid so I can judge you.",
          fix: "Start Tracking.",
          fixDesc: "Go to the Simulator page and add some realistic transactions to see the magic happen."
        }
      });
    }

    // Summarize
    const categorySummary = {};
    let totalSpent = 0;
    transactions.forEach(t => {
      totalSpent += t.amount;
      categorySummary[t.category] = (categorySummary[t.category] || 0) + t.amount;
    });
    const summaryString = Object.entries(categorySummary)
      .map(([cat, amount]) => `- ${cat}: ₹${amount}`)
      .join("\n");

    // CALL GROQ (JSON MODE)
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `
              You are a Savage Financial Analyst. 
              Analyze spending and return a RAW JSON Object.
              
              Fields required:
              1. "score": Number 0-100 (0 = broke, 100 = perfect).
              2. "leak": The main category wasting money (e.g. "Food Delivery").
              3. "leakDesc": A 2-3 sentence explanation of WHY this is bad. Be descriptive and math-based.
              4. "roast": A savage, witty, 2-sentence roast about their habits.
              5. "fix": A short 3-5 word title for the solution (e.g. "The 72-Hour Rule").
              6. "fixDesc": A 2-3 sentence actionable plan to fix the leak. Be specific.
            `
          },
          {
            role: "user",
            content: `Income: ${state?.monthlyIncome}, Spent: ${totalSpent}, Data: \n${summaryString}`
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);

    return NextResponse.json({ json: content });

  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: "AI Failed" });
  }
}