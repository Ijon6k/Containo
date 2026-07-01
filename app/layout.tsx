import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
});

export const metadata: Metadata = {
  title: "Containo — Simple Docker Manager",
  description: "A simple and easy-to-use dashboard for beginners to manage Docker containers.",
  icons: {
    icon: "/logo/containologo.webp",
    shortcut: "/logo/containologo.webp",
    apple: "/logo/containologo.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${archivo.variable} h-full antialiased dark`}>
      <body className="min-h-full font-sans">
        <ThemeProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
