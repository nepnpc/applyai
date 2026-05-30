import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";

const inter = Inter({ subsets: ["latin"], weight: ["300","400","500","600","700","800","900"] });

export const metadata: Metadata = {
  title: "ApplyAI — Job Engine",
  description: "Personal internship hunting system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body style={{ display: "flex", minHeight: "100vh", background: "#fff", color: "#090909" }}>
        <Sidebar />
        <main style={{ flex: 1, marginLeft: 220, minHeight: "100vh", background: "#fafafa" }}>
          <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px" }}>
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
