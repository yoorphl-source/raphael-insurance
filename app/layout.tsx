import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KPARTNERS | 보험 무료 상담",
  description:
    "현재 가입 보험의 보장 내용을 분석하고, 조건에 맞는 상품을 비교해 안내해 드립니다.",
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
