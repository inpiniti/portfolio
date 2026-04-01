import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "포트폴리오 | 정영균",
  description: "프론트엔드 개발자 정영균의 포트폴리오 사이트입니다.",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "포트폴리오 | 정영균",
    description: "프론트엔드 개발자 정영균의 포트폴리오 사이트입니다.",
    url: "https://inpiniti-portfolio.vercel.app",
    siteName: "정영균 포트폴리오",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
