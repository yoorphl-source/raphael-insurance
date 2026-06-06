import ConsultForm from './components/ConsultForm';

export default function Home() {
  return (
    <>
      <main className="bg-[#0f1e3c]">
        {/* Nav bar */}
        <header className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
          <span className="text-white font-bold text-lg tracking-tight">든든보험</span>
          <span className="text-slate-400 text-sm hidden sm:block">
            평일 09:00 – 18:00 · 1588-0000
          </span>
        </header>

        {/* Hero */}
        <section className="flex flex-col items-center justify-center text-center px-6 pt-20 pb-32 max-w-3xl mx-auto">
          {/* Badge */}
          <span className="inline-block mb-6 rounded-full bg-blue-500/20 px-4 py-1.5 text-sm font-medium text-blue-300 ring-1 ring-blue-400/40">
            전문 컨설턴트 1:1 상담
          </span>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight break-keep">
            복잡한 보험,<br />
            <span className="text-blue-400">전문가가 함께</span> 골라드립니다
          </h1>

          {/* Sub-headline */}
          <p className="mt-6 text-lg sm:text-xl text-slate-300 leading-relaxed break-keep max-w-xl">
            과잉 가입 없이, 꼭 필요한 보장만 — 무료 상담으로 딱 맞는 보험을 찾아보세요.
          </p>

          {/* CTA */}
          <a
            href="#consult-form"
            className="mt-10 inline-block rounded-full bg-blue-500 px-10 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-400 hover:shadow-blue-400/40 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
          >
            무료 상담 신청하기
          </a>

          {/* Trust signals */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
            <span>✓ 비용 없음 · 부담 없음</span>
            <span>✓ 24시간 내 연락</span>
            <span>✓ 금융감독원 등록 법인</span>
          </div>
        </section>

        {/* Decorative divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      </main>

      <ConsultForm />
    </>
  );
}
