import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/features/auth/components/auth-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = { title: "BookMyMovie", description: "Discover movies and plan your next cinema visit." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
 return <html lang="en" className={poppins.variable}><body className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased"><AuthProvider><Navbar />{children}<Footer /></AuthProvider></body></html>;
}
