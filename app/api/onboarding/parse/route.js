import { NextResponse } from 'next/server';
import { auth } from "@/auth";

/* -------------------------------------------------------------------------- */
/* CRITICAL FIX                                 */
/* -------------------------------------------------------------------------- */
// We must mock browser APIs before 'pdf-parse' loads, or it crashes Next.js
if (!global.DOMMatrix) {
  global.DOMMatrix = class DOMMatrix {
    constructor() {
      this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
    }
    toString() { return "matrix(1, 0, 0, 1, 0, 0)"; }
    translate() { return this; }
    scale() { return this; }
  };
}
// Suppress canvas warnings since we only need text, not image rendering
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('Cannot load "@napi-rs/canvas"')) return;
  originalConsoleWarn(...args);
};
/* -------------------------------------------------------------------------- */

// Now it is safe to require the library
const pdf = require('pdf-parse');

export async function POST(req) {
  // 1. Secure the endpoint
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 2. Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Extract Text
    const data = await pdf(buffer);
    const text = data.text;

    // 4. INTELLIGENCE: Basic Keyword Analysis
    const suggestedIncome = 50000; // Default fallback
    const detectedCommitments = [];

    const lowerText = text.toLowerCase();

    // Simple keyword search logic for the MVP
    if (lowerText.includes("netflix")) {
        detectedCommitments.push({ name: "Netflix", amount: 649, type: "subscription" });
    }
    if (lowerText.includes("spotify")) {
        detectedCommitments.push({ name: "Spotify", amount: 119, type: "subscription" });
    }
    if (lowerText.includes("rent") || lowerText.includes("housing")) {
        detectedCommitments.push({ name: "Rent/Housing", amount: 15000, type: "bill" });
    }

    // Return the extracted intelligence
    return NextResponse.json({ 
      success: true,
      data: {
        textSnippet: text.substring(0, 200),
        suggestedIncome,
        detectedCommitments
      }
    });

  } catch (error) {
    console.error("PDF Parse Error:", error);
    return NextResponse.json({ error: "Failed to parse PDF. Please try manual entry." }, { status: 500 });
  }
}