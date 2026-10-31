import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sketch2Flow | Visual workflow builder",
  description: "Design workflow diagrams before you build them.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
