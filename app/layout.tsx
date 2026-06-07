import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "[브랜드명] | 보험 비교 채팅 상담",
  description: "여러 생명·손해보험사 상품을 채팅으로 간편하게 비교하세요. 가입 압박 없이 궁금한 것만 먼저 확인할 수 있습니다.",
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
