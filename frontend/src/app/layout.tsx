import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sketch2Flow | Visual workflow builder",
  description: "Design workflow diagrams before you build them.",
};

const themeScript = `(function(){try{var theme=localStorage.getItem("sketch2flow:theme")==="light"?"light":"dark";document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme;if(theme==="dark")document.documentElement.classList.add("dark");}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>{children}</body>
    </html>
  );
}
