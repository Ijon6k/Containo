import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
});

export const metadata: Metadata = {
  title: "Containo | Docker Assistant",
  description: "Minimalist Docker management tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${archivo.variable} h-full antialiased dark`}>
      <body className="min-h-full font-sans bg-[#0F172A] text-slate-200">
        {children}
      </body>
    </html>
  );
}
