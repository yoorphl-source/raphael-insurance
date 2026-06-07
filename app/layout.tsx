import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "[브랜드명] | 보험 비교 채팅 상담",
  description: "[메타 설명 — 준법 검토 후 교체 예정]",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="h-full scroll-smooth">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-full font-sans antialiased">{children}</body>
    </html>
  );
}
