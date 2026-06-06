import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "보험 무료 상담 | 든든한 보험 파트너",
  description: "전문 보험 컨설턴트와 1:1 무료 상담으로 나에게 맞는 보험을 찾아보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} h-full antialiased scroll-smooth`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
