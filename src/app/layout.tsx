import type { Metadata } from "next";
import { Josefin_Sans } from "next/font/google";
import "./globals.css";

// Police du site snapdesk.co
const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["300", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-josefin",
});

export const metadata: Metadata = {
  title: "Snapdesk | Espaces de bureaux",
  description: "Découvrez nos espaces de bureaux premium",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={josefin.variable}>
      <body>{children}</body>
    </html>
  );
}
