import ConsultForm from './components/ConsultForm';
import { FAQItem } from './components/FAQItem';

const STEPS = [
  {
    num: '01',
    title: '신청',
    desc: '이름과 연락처만 남겨주세요.',
  },
  {
    num: '02',
    title: '연락',
    desc: '영업일 기준 24시간 이내에 연락드립니다.',
  },
  {
    num: '03',
    title: '보장 분석',
    desc: '현재 가입 내역과 필요 보장을 함께 살펴봅니다.',
  },
  {
    num: '04',
    title: '비교 제안',
    desc: '조건에 맞는 상품을 비교해 안내드립니다.',
  },
];

const SERVICES = [
  {
    title: '보장 내용 정리',
    desc: '가입한 보험의 보장 항목을 한눈에 확인할 수 있도록 정리해 드립니다.',
  },
  {
    title: '과잉 가입 점검',
    desc: '중복 보장이나 불필요한 항목을 찾아 보험료 부담을 줄일 수 있는지 살펴봅니다.',
  },
  {
    title: '상품 비교 안내',
    desc: '여러 보험사 상품을 나란히 비교해 조건과 보험료 차이를 안내드립니다.',
  },
  {
    title: '갱신·해지 상담',
    desc: '기존 보험의 유지, 변경, 해지 여부도 함께 검토해 드립니다.',
  },
];

const FAQS = [
  {
    q: '상담 비용이 있나요?',
    a: '없습니다. 상담부터 비교 안내까지 전 과정이 무료입니다.',
  },
  {
    q: '상담 후 가입을 권유하나요?',
    a: '가입 여부는 고객님이 결정하십니다. 분석 결과만 확인하고 끝내셔도 됩니다.',
  },
  {
    q: '어떤 보험사 상품을 다루나요?',
    a: '특정 보험사에 얽매이지 않고 여러 생명·손해보험사 상품을 비교해, 고객님께 꼭 맞는 보장을 제안해 드립니다. 취급 보험사 목록은 상담 시 자세히 안내해 드립니다.',
  },
  {
    q: '개인정보는 어떻게 처리되나요?',
    a: '수집한 개인정보는 상담 목적으로만 사용되며, 제3자에게 제공되지 않습니다. 상담 완료 후에는 관계 법령에 따라 처리됩니다.',
  },
  {
    q: '상담은 어떻게 진행되나요?',
    a: '[대면 / 비대면 상담 방식 안내]',
  },
];

export default function Home() {
  return (
    <>
      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold tracking-tight text-gray-900">KPARTNERS</span>
          </div>
          <a
            href="#consult-form"
            className="rounded bg-[#1e3a5f] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#162d4a]"
          >
            상담 신청
          </a>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="border-b border-gray-100 bg-white px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#1e3a5f]">
            보험 무료 상담
          </p>
          <h1 className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-gray-900 break-keep sm:text-4xl md:text-5xl">
            필요한 보장만 제대로,<br />보험 비교 상담
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-500 break-keep">
            현재 가입 보험의 보장 내용을 분석하고, 조건에 맞는 상품을 비교해 안내해 드립니다.
          </p>
          <div className="mt-8">
            <a
              href="#consult-form"
              className="inline-block rounded bg-[#1e3a5f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#162d4a]"
            >
              지금 무료 상담 신청하기
            </a>
          </div>
        </div>
      </section>

      {/* ── Process ── */}
      <section className="border-b border-gray-100 bg-white px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-xl font-bold text-gray-900">상담 진행 방식</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4">
            {STEPS.map((step) => (
              <div key={step.num}>
                <span className="block text-2xl font-extrabold text-[#1e3a5f] opacity-25">
                  {step.num}
                </span>
                <p className="mt-2 text-sm font-semibold text-gray-900">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section className="border-b border-gray-100 bg-gray-50 px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-xl font-bold text-gray-900">이런 도움을 드립니다</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {SERVICES.map((s) => (
              <div key={s.title} className="border-l-2 border-[#1e3a5f] pl-4">
                <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-b border-gray-100 bg-white px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-xl font-bold text-gray-900">자주 묻는 질문</h2>
          <div className="mt-6">
            {FAQS.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Form ── */}
      <ConsultForm />

      {/* ── Footer ── */}
      <footer className="bg-gray-900 px-6 py-10 text-sm text-gray-400">
        <div className="mx-auto max-w-5xl space-y-2">
          <p className="font-semibold text-white">KPARTNERS</p>
          <p>[법인 상호 · 사업자등록번호 · 등록 정보]</p>
          <p>광고 심의필 [심의필 번호]</p>
          <p>연락처 [전화번호] · [이메일]</p>
          <div className="mt-4 border-t border-gray-700 pt-4">
            <a href="#" className="hover:text-white underline underline-offset-2">
              개인정보처리방침
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
