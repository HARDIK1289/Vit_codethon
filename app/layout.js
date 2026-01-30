import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ClearSpend | Pace Your Life",
  description: "Behavior-aware financial decision engine for GenZ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#050505] text-white antialiased`}>
        {/* Subtle background glow for that premium feel */}
        <div className="fixed -z-10 h-full w-full overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-purple-900/20 blur-[120px]" />
          <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-blue-900/20 blur-[120px]" />
        </div>
        {children}
      </body>
    </html>
  );
}