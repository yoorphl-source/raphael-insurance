import Link from 'next/link';

// ── 강점 데이터 ──────────────────────────────────────────────
const STRENGTHS = [
  {
    title: '객관적 비교',
    desc: '특정 보험사에 치우치지 않고, 여러 상품을 같은 기준으로 비교해 드립니다.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6.75v6.75" />
      </svg>
    ),
  },
  {
    title: '여러 보험사',
    desc: '주요 생명·손해보험사 상품을 한 자리에서 살펴볼 수 있습니다.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
  },
  {
    title: '전문 상담사 연결',
    desc: '채팅으로 확인 후, 필요 시 전문 상담사와 직접 연결해 드립니다.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    title: '부담 없는 채팅 상담',
    desc: '가입을 권유하지 않습니다. 궁금한 것만 물어보셔도 됩니다.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
  },
];

// ── 리뷰 데이터 ──────────────────────────────────────────────
const REVIEWS = [
  { text: '[예시 후기 — 실제 후기로 교체 예정]', author: '[작성자]' },
  { text: '[예시 후기 — 실제 후기로 교체 예정]', author: '[작성자]' },
  { text: '[예시 후기 — 실제 후기로 교체 예정]', author: '[작성자]' },
  { text: '[예시 후기 — 실제 후기로 교체 예정]', author: '[작성자]' },
  { text: '[예시 후기 — 실제 후기로 교체 예정]', author: '[작성자]' },
  { text: '[예시 후기 — 실제 후기로 교체 예정]', author: '[작성자]' },
];

// ── 페이지 ───────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <span className="block text-base font-bold tracking-tight text-gray-900">
              [브랜드명]
            </span>
            <span className="text-xs text-gray-400">치우치지 않은 보험 비교, 채팅으로</span>
          </div>
          <Link
            href="/chat"
            className="rounded bg-[#1e3a5f] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#162d4a]"
          >
            채팅 상담 시작하기
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="border-b border-gray-100 bg-white px-6 py-16 sm:py-24">
        <div className="mx-auto flex max-w-5xl flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
          {/* 텍스트 */}
          <div className="flex-1">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#1e3a5f]">
              보험 비교 채팅 상담
            </p>
            <h1 className="max-w-lg text-3xl font-extrabold leading-tight tracking-tight text-gray-900 break-keep sm:text-4xl md:text-5xl">
              여러 보험사, 한쪽에 치우치지 않고 비교하세요
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-gray-500 break-keep">
              가입 압박 없이, 필요한 보장만 먼저 확인하세요. 전화 부담 없이 채팅으로 시작할 수 있어요.
            </p>
            <div className="mt-8">
              <Link
                href="/chat"
                className="inline-block rounded bg-[#1e3a5f] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#162d4a]"
              >
                채팅 상담 시작하기
              </Link>
            </div>
          </div>

          {/* 이미지 자리 */}
          <div className="w-full lg:w-[45%]">
            <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-400">[이미지 준비 중]</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 강점 ── */}
      <section className="border-b border-gray-100 bg-gray-50 px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-xl font-bold text-gray-900">이런 점이 다릅니다</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {STRENGTHS.map((s) => (
              <div key={s.title} className="flex gap-4">
                <div className="mt-0.5 shrink-0 text-[#1e3a5f]">{s.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 고객 리뷰 (마퀴) ── */}
      <section className="border-b border-gray-100 bg-white py-12 sm:py-16">
        <div className="mx-auto mb-8 max-w-5xl px-6">
          <h2 className="text-xl font-bold text-gray-900">고객 후기</h2>
        </div>

        <div className="overflow-hidden">
          <div
            className="marquee-track flex gap-4"
            aria-label="고객 후기 슬라이드"
          >
            {[...REVIEWS, ...REVIEWS].map((r, i) => (
              <div
                key={i}
                aria-hidden={i >= REVIEWS.length}
                className="w-72 shrink-0 rounded-xl border border-gray-200 bg-white p-5"
              >
                <p className="text-xs tracking-widest text-[#1e3a5f]">★★★★★</p>
                <p className="mt-3 text-sm leading-relaxed text-gray-700">{r.text}</p>
                <p className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-400">
                  {r.author}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA 배너 ── */}
      <section className="bg-[#1e3a5f] px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="max-w-lg text-2xl font-bold text-white break-keep sm:text-3xl">
            궁금한 것만, 채팅으로 가볍게 물어보세요
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-blue-200 break-keep">
            AI와 전문 상담사가 함께 여러 보험사를 비교해 정리해 드려요. 부담 없이, 궁금한 것부터 채팅으로 물어보세요.
          </p>
          <div className="mt-8">
            <Link
              href="/chat"
              className="inline-block rounded bg-white px-7 py-3 text-sm font-semibold text-[#1e3a5f] transition hover:bg-gray-100"
            >
              채팅 상담 시작하기
            </Link>
          </div>
        </div>
      </section>

      {/* ── 푸터 ── */}
      <footer className="bg-gray-900 px-6 py-10 text-sm text-gray-400">
        <div className="mx-auto max-w-5xl space-y-2">
          <p className="font-semibold text-white">[브랜드명]</p>
          <p>[법인 상호 · 사업자등록번호 · 등록 정보]</p>
          <p>광고 심의필 [심의필 번호]</p>
          <p>연락처 [전화번호] · [이메일]</p>
          <div className="mt-4 border-t border-gray-700 pt-4">
            <a href="#" className="underline underline-offset-2 hover:text-white">
              개인정보처리방침
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
