'use client'

import { useEffect, useRef, useState } from 'react'
import { submitLandingLead } from '@/app/actions/submitLandingLead'

type Review = { quote: string; by: string }
type Faq = { q: string; a: string }

export type LandingPageProps = {
  source: string
  label?: string
  headline?: string
  sub?: string
  ctaText?: string
  reviews?: Review[]
  partners?: string[]
  faqs?: Faq[]
  phone?: string
  heroImage?: string
}

/* ── SVG 아이콘 (이모지 대체 — 모든 기기 렌더링 보장) ── */
function ConcernIcon({ id }: { id: string }) {
  const cls = 'h-5 w-5 stroke-white'
  const base = { fill: 'none', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (id) {
    case 'silson':
      return (
        <svg viewBox="0 0 20 20" className={cls} {...base}>
          <rect x="1.5" y="1.5" width="17" height="17" rx="4" />
          <path d="M10 6v8M6 10h8" />
        </svg>
      )
    case 'cancer':
      return (
        <svg viewBox="0 0 20 20" className={cls} {...base}>
          <path d="M10 1.5 2 5v5.5c0 4.25 3.25 8.25 8 9.5 4.75-1.25 8-5.25 8-9.5V5Z" />
          <path d="m7 10 2 2 4-4" />
        </svg>
      )
    case 'brain':
      return (
        <svg viewBox="0 0 20 20" className={cls} {...base}>
          <path d="M17.3 4.7a4 4 0 0 0-5.66 0L10 6.34 8.36 4.7a4 4 0 0 0-5.66 5.66L10 18l7.3-7.3a4 4 0 0 0 0-5.66v0Z" />
        </svg>
      )
    case 'surgery':
      return (
        <svg viewBox="0 0 20 20" className={cls} {...base}>
          <polyline points="1,10 4.5,10 6.5,5 8.5,15 10.5,7.5 12.5,12.5 14.5,10 19,10" />
        </svg>
      )
    default:
      return null
  }
}

const DEFAULT_REVIEWS: Review[] = [
  { quote: '중복으로 내던 실손보험을 정리해 매달 4만 원을 아꼈습니다. 부담 주지 않고 차근차근 설명해 주셔서 좋았어요.', by: '김○○ · 30대 직장인' },
  { quote: '보장이 빠진 부분을 짚어주셔서 안심하고 보완했습니다. 가입 강요가 전혀 없어 신뢰가 갔습니다.', by: '이○○ · 40대 자영업' },
  { quote: '자녀 보험을 알아보다 상담받았는데, 필요한 것만 추려주셔서 결정이 쉬웠습니다.', by: '박○○ · 30대 학부모' },
]

const DEFAULT_PARTNERS = [
  '/logos/logo01.png', '/logos/logo02.png', '/logos/logo03.png', '/logos/logo04.png',
  '/logos/logo05.png', '/logos/logo06.png', '/logos/logo07.png', '/logos/logo08.png',
  '/logos/logo09.png', '/logos/logo10.png', '/logos/logo11.png', '/logos/logo12.png',
  '/logos/logo13.png', '/logos/logo14.png', '/logos/logo15.png', '/logos/logo16.png',
  '/logos/logo17.png', '/logos/logo18.png', '/logos/logo19.png', '/logos/logo20.png',
]

const DEFAULT_FAQS: Faq[] = [
  { q: '상담은 정말 무료인가요?', a: '네, 상담료는 전혀 없습니다. 보장분석과 비교 안내까지 모두 무료로 진행되며, 가입 여부는 전적으로 고객님이 결정하십니다.' },
  { q: '꼭 보험에 가입해야 하나요?', a: '아니요. 분석 결과만 받아보셔도 됩니다. 불필요한 가입 권유는 하지 않습니다.' },
  { q: '상담은 얼마나 걸리나요?', a: '전화 상담 기준 10~15분 정도 소요됩니다. 현재 가입 내역을 함께 확인하면 더 정확한 안내가 가능합니다.' },
  { q: '개인정보는 안전하게 관리되나요?', a: '수집한 정보는 상담 연락 목적으로만 사용하며 제3자에게 제공하지 않습니다. 상담 종료 후 즉시 파기합니다.' },
]

/* ※ 게시 전 통계 수치는 최신 출처(국가암등록통계·통계청 사망원인통계 등)로 검증 필요 */
const CONCERNS = [
  {
    key: 'silson', label: '실손보험',
    teaser: '건강보험이 안 되는 비급여, 그대로 본인 부담',
    title: '실손의료비, 제대로 알고 계신가요?',
    stat: '비급여 진료비는 건강보험 보장 대상이 아닙니다',
    body: 'MRI·도수치료·비급여 약제 등 건강보험이 보장하지 않는 의료비를 실손보험이 보완합니다. 다만 가입 세대(1~4세대)에 따라 자기부담률과 보장범위가 크게 다르고, 중복 가입해도 보험금은 비례 분담돼 두 건을 내도 더 받지 못할 수 있습니다.',
    point: '내 실손이 몇 세대인지, 불필요한 중복 가입은 없는지 확인이 필요합니다.',
  },
  {
    key: 'cancer', label: '암',
    teaser: '국내 사망원인 1위, 길고 비싼 치료',
    title: '암, 통계로 보면 남의 일이 아닙니다',
    stat: '기대수명까지 생존 시 약 3명 중 1명이 암을 경험 (국가암등록통계)',
    body: '암은 국내 사망원인 1위이며, 진단 이후 수술·항암·표적치료가 길게 이어져 비급여 치료비 부담이 큽니다. 치료 기간 동안 소득 공백이 함께 오는 경우도 많습니다.',
    point: '진단비 한도, 소액암·유사암 보장 여부를 확인하세요.',
  },
  {
    key: 'brain', label: '뇌·심장',
    teaser: '예고 없이 찾아오는 응급 질환',
    title: '뇌·심장 질환은 예고 없이 찾아옵니다',
    stat: '심장질환·뇌혈관질환은 국내 주요 사망원인입니다 (통계청 사망원인통계)',
    body: '뇌졸중·뇌출혈, 급성심근경색은 갑작스럽게 발생해 응급치료·수술·재활로 이어지는 경우가 많습니다. 후유장해가 남으면 장기간 소득 단절이 동반될 수 있습니다.',
    point: '뇌혈관·심장질환 진단비와 수술비 보장 범위를 확인하세요.',
  },
  {
    key: 'surgery', label: '수술비',
    teaser: '나이 들수록 잦아지는 입원·수술',
    title: '수술, 평생 한 번도 안 할 수 있을까요?',
    stat: '입원·수술 빈도는 연령이 높아질수록 증가합니다',
    body: '질병·상해로 인한 수술은 누구에게나 발생할 수 있고, 비급여 항목이 많아 부담이 큽니다. 수술비 특약은 수술 시 정액으로 지급돼 부담을 덜어줍니다.',
    point: '수술비 특약 유무와 1~5종 수술 분류별 보장을 확인하세요.',
  },
] as const

export default function LandingPage({
  source,
  label = '무료 보장분석 서비스',
  headline = '내 보험, 제대로\n비교하고 계신가요?',
  sub = '여러 보험사 상품을 한 번에 비교·분석해\n지금 가장 합리적인 선택을 찾아드립니다.',
  ctaText = '무료 비교/분석 신청하기',
  reviews = DEFAULT_REVIEWS,
  partners = DEFAULT_PARTNERS,
  faqs = DEFAULT_FAQS,
  phone = '010-0000-0000',
  heroImage,
}: LandingPageProps) {

  /* ── 스크롤 반응형 헤더 ── */
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ── 경각심 팝업 ── */
  const [openKey, setOpenKey] = useState<string | null>(null)
  const [closing, setClosing] = useState(false)
  const concern = CONCERNS.find((c) => c.key === openKey)
  function closePopup() {
    setClosing(true)
    setTimeout(() => { setOpenKey(null); setClosing(false) }, 200)
  }

  /* ── 상담 신청 모달 ── */
  const [formOpen, setFormOpen] = useState(false)
  const [formClosing, setFormClosing] = useState(false)
  function openFormModal() { setFormOpen(true) }
  function closeFormModal() {
    setFormClosing(true)
    setTimeout(() => { setFormOpen(false); setFormClosing(false) }, 280)
  }

  /* ── ESC 키 / 스크롤 잠금 ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { if (formOpen) closeFormModal(); else if (openKey) closePopup() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [formOpen, openKey])

  useEffect(() => {
    const locked = !!(openKey || formOpen)
    const sw = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = locked ? 'hidden' : ''
    document.body.style.paddingRight = locked ? `${sw}px` : ''
    return () => { document.body.style.overflow = ''; document.body.style.paddingRight = '' }
  }, [openKey, formOpen])

  /* ── 후기 자동 슬라이드 ── */
  const trackRef = useRef<HTMLDivElement>(null)
  const idxRef = useRef(0)
  const pausedRef = useRef(false)
  const [active, setActive] = useState(0)
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const timer = setInterval(() => {
      if (pausedRef.current) return
      const cards = el.children
      if (!cards.length) return
      idxRef.current = (idxRef.current + 1) % cards.length
      el.scrollTo({ left: (cards[idxRef.current] as HTMLElement).offsetLeft, behavior: 'smooth' })
      setActive(idxRef.current)
    }, 3200)
    return () => clearInterval(timer)
  }, [reviews.length])

  /* ── FAQ 아코디언 ── */
  const [openFaq, setOpenFaq] = useState(0)

  /* ── 상담 폼 ── */
  const [name, setName] = useState('')
  const [ph, setPh] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  async function handleSubmit() {
    if (!name.trim() || !ph.trim()) { alert('이름과 연락처를 입력해 주세요.'); return }
    if (!agreed) { alert('개인정보 수집·이용에 동의해 주세요.'); return }
    setStatus('sending')
    const result = await submitLandingLead({ name, phone: ph, birth: null, interests: null, message: null, source })
    if (!result.ok) { console.error(result.error); setStatus('error') }
    else setStatus('done')
  }

  const partnersLoop = [...partners, ...partners]

  return (
    <div className="font-sans text-[15px] leading-relaxed antialiased text-neutral-900 pb-[76px]">
      <style>{`
        @keyframes kp-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes kp-fade-in{from{opacity:0}to{opacity:1}}
        @keyframes kp-fade-out{from{opacity:1}to{opacity:0}}
        @keyframes kp-scale-in{from{opacity:0;transform:scale(0.94) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes kp-scale-out{from{opacity:1;transform:scale(1) translateY(0)}to{opacity:0;transform:scale(0.94) translateY(8px)}}
        @keyframes kp-sheet-in{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes kp-sheet-out{from{transform:translateY(0)}to{transform:translateY(100%)}}
        @keyframes kp-check{0%{stroke-dashoffset:40}100%{stroke-dashoffset:0}}
        @keyframes kp-pop{0%{transform:scale(0.9);opacity:0}60%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
      `}</style>

      {/* ════ 헤더 ════ */}
      <header className={[
        'fixed inset-x-0 top-0 z-30 flex items-center justify-center px-5 py-2 transition-all duration-300',
        scrolled ? 'bg-white border-b border-neutral-200' : 'bg-[#15294A]',
      ].join(' ')}>
        <span className={`text-[18px] font-bold tracking-wide ${scrolled ? 'text-[#1B3357]' : 'text-white'}`}>
          KPARTNERS
        </span>
      </header>

      {/* ════ 1. 히어로 ════ */}
      <section className="bg-[#15294A] px-6 pb-14 pt-[5.5rem]">
        <div className="mx-auto flex max-w-5xl flex-col gap-9 md:flex-row md:items-center">
          <div className="md:flex-1">
            <p className="mb-4 text-[12px] font-semibold tracking-[0.08em] text-[#9DB4D4]">{label}</p>
            <h1 className="mb-4 whitespace-pre-line text-[29px] font-bold leading-[1.38] -tracking-[0.025em] text-white md:text-[34px]">
              {headline}
            </h1>
            <p className="mb-7 whitespace-pre-line text-[14px] leading-[1.85] text-white/70 md:text-[15px]">{sub}</p>
            <div className="flex flex-wrap gap-5">
              {['상담료 무료', '1대1 맞춤 상담', '1영업일 이내 연락'].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-[12px] text-white/80">
                  <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="7" fill="rgba(127,168,216,0.3)" />
                    <polyline points="4,7 6,9 10,5" stroke="#7FA8D8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="md:flex-1">
            {heroImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={heroImage} alt="KPARTNERS 보험 상담" className="h-56 w-full rounded-xl object-cover md:h-72" />
            ) : (
              <div className="flex h-56 w-full items-center justify-center rounded-xl bg-white/10 text-[12px] text-white/45 md:h-72">
                히어로 이미지 영역
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ════ 2. 보장 점검 카드 ════ */}
      <section className="bg-neutral-50 px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-[21px] font-bold -tracking-[0.015em]">지금 내 보장, 충분할까요?</h2>
          <div className="mb-4 h-[3px] w-[34px] bg-[#1B3357]" />
          <p className="mb-6 text-[13px] text-neutral-500">가장 걱정되는 항목을 눌러 확인해 보세요.</p>
          <div className="grid grid-cols-2 gap-3">
            {CONCERNS.map((c) => (
              <button
                key={c.key}
                onClick={() => setOpenKey(c.key)}
                className="group relative flex min-h-[136px] flex-col rounded-xl border border-neutral-200 bg-white p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#1B3357] hover:shadow-[0_6px_20px_rgba(21,41,74,0.12)]"
              >
                <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#15294A] transition-transform duration-200 group-hover:scale-110">
                  <ConcernIcon id={c.key} />
                </span>
                <span className="mb-1 text-[15px] font-bold">{c.label}</span>
                <span className="text-[11.5px] leading-[1.5] text-neutral-500">{c.teaser}</span>
                <span className="absolute bottom-3 right-3.5 text-[13px] font-bold text-[#1B3357] transition-transform duration-200 group-hover:translate-x-0.5">→</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ════ 3. 고객 후기 ════ */}
      <section className="bg-white px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-[21px] font-bold -tracking-[0.015em]">고객 후기</h2>
          <div className="mb-4 h-[3px] w-[34px] bg-[#1B3357]" />
          <p className="mb-6 text-[13px] text-neutral-500">실제 상담을 받으신 분들의 이야기입니다.</p>
          <div
            ref={trackRef}
            onMouseEnter={() => (pausedRef.current = true)}
            onMouseLeave={() => (pausedRef.current = false)}
            onTouchStart={() => (pausedRef.current = true)}
            className="flex gap-3 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {reviews.map((r, i) => (
              <div
                key={i}
                className="shrink-0 basis-[82%] rounded-xl border border-neutral-100 bg-white px-5 pb-4 pt-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] md:basis-[48%]"
                style={{ scrollSnapAlign: 'start' }}
              >
                <svg className="mb-3 h-6 w-6 opacity-20" viewBox="0 0 24 24" fill="#1B3357">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="mb-4 text-[14px] leading-[1.78]">{r.quote}</p>
                <p className="border-t border-neutral-100 pt-2.5 text-[12px] text-neutral-400">{r.by}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-center gap-1.5">
            {reviews.map((_, i) => (
              <span
                key={i}
                className={`rounded-full transition-all duration-300 ${i === active ? 'w-5 h-1.5 bg-[#1B3357]' : 'w-1.5 h-1.5 bg-neutral-300'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ════ 4. 제휴 보험사 ════ */}
      <section className="bg-neutral-50 px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-[21px] font-bold -tracking-[0.015em]">제휴 보험사</h2>
          <div className="mb-4 h-[3px] w-[34px] bg-[#1B3357]" />
          <p className="mb-6 text-[13px] text-neutral-500">여러 보험사 상품을 비교해 안내해 드립니다.</p>
        </div>
        {/* 마키 — 좌우 페이드 마스크 */}
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-neutral-50 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-neutral-50 to-transparent" />
          <div className="flex w-max gap-6" style={{ animation: 'kp-marquee 65s linear infinite' }}>
            {partnersLoop.map((src, i) => (
              <div key={i} className="flex h-[72px] w-[140px] shrink-0 items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="보험사 로고" className="max-h-full max-w-full object-contain" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ 5. FAQ — 스무스 아코디언 ════ */}
      <section className="bg-white px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-[21px] font-bold -tracking-[0.015em]">자주 묻는 질문</h2>
          <div className="mb-4 h-[3px] w-[34px] bg-[#1B3357]" />
          {faqs.map((f, i) => (
            <div key={i} className="border-b border-neutral-200">
              <button
                onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                className="flex w-full items-center justify-between gap-2.5 py-[1.15rem] text-left text-[15px] font-semibold"
              >
                <span>{f.q}</span>
                <span
                  className="shrink-0 text-[20px] font-light text-[#1B3357] transition-transform duration-300"
                  style={{ transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)' }}
                >
                  +
                </span>
              </button>
              <div
                className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
                style={{ maxHeight: openFaq === i ? '320px' : '0px' }}
              >
                <p className="pb-[1.15rem] text-[13px] leading-[1.85] text-neutral-500">{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════ 푸터 ════ */}
      <footer className="bg-[#111114] px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-2.5 text-[14px] font-bold tracking-[0.04em] text-white">KPARTNERS</div>
          <p className="text-[11px] leading-[1.9] text-neutral-500">
            상호: 케이파트너스 | 대표: 장현 | 소속: MICASSET<br />
            사업자등록번호: 000-00-00000<br />
            보험광고 심의필: 제2026-0000호 (생명보험협회 / 손해보험협회)<br />
            준법감시인 확인필 제2026-0000호<br /><br />
            본 페이지는 보험 모집인의 광고 자료이며, 수집된 개인정보는 상담 연락 외의 목적으로 사용·제공되지 않습니다.
          </p>
        </div>
      </footer>

      {/* ════ 플로팅 CTA ════ */}
      {!formOpen && (
        <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-5">
          <button
            onClick={openFormModal}
            className="w-full max-w-sm rounded-full bg-[#15294A] py-4 text-[15px] font-bold text-white shadow-[0_6px_24px_rgba(21,41,74,0.45)] transition-transform duration-150 active:scale-[0.97]"
          >
            {status === 'done' ? '✓ 신청 완료' : ctaText}
          </button>
        </div>
      )}

      {/* ════ 상담 신청 모달 (바텀 시트) ════ */}
      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{
            background: 'rgba(8,15,30,0.65)',
            backdropFilter: 'blur(6px)',
            animation: `${formClosing ? 'kp-fade-out' : 'kp-fade-in'} 0.26s ease both`,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) closeFormModal() }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-t-[28px] bg-white"
            style={{ animation: `${formClosing ? 'kp-sheet-out' : 'kp-sheet-in'} 0.3s cubic-bezier(0.32,0.72,0,1) both` }}
          >
            {/* 상단 그라데이션 액센트 */}
            <div className="h-1 w-full bg-gradient-to-r from-[#15294A] via-[#3A6EA5] to-[#7FA8D8]" />

            {/* 드래그 핸들 */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-neutral-200" />
            </div>

            {/* 헤더 */}
            <div className="flex items-start justify-between px-6 pt-3 pb-5">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.08em] text-[#7FA8D8]">KPARTNERS</p>
                <h2 className="mt-0.5 text-[20px] font-bold -tracking-[0.02em] text-[#15294A]">무료 보장분석 신청</h2>
                <p className="mt-1 text-[13px] text-neutral-400">이름과 연락처만 남겨주시면 1영업일 이내 연락드립니다.</p>
              </div>
              <button
                onClick={closeFormModal}
                aria-label="닫기"
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 transition-colors hover:bg-neutral-200"
              >
                <svg viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="none" stroke="#666" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M1 1l12 12M13 1 1 13" />
                </svg>
              </button>
            </div>

            <div className="px-6 pb-8">
              {status === 'done' ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <div style={{ animation: 'kp-pop 0.4s ease both' }}>
                    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className="mb-4">
                      <circle cx="28" cy="28" r="28" fill="#EDF4FF" />
                      <polyline
                        points="17,29 24,36 39,21"
                        fill="none" stroke="#15294A" strokeWidth="2.8"
                        strokeLinecap="round" strokeLinejoin="round"
                        strokeDasharray="40" strokeDashoffset="0"
                        style={{ animation: 'kp-check 0.4s 0.15s ease both' }}
                      />
                    </svg>
                  </div>
                  <p className="text-[18px] font-bold text-[#15294A]">신청이 완료됐습니다</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-400">1영업일 이내 연락드리겠습니다.</p>
                  <button
                    onClick={closeFormModal}
                    className="mt-6 w-full rounded-full bg-neutral-100 py-3.5 text-[14px] font-semibold text-neutral-600 transition-colors hover:bg-neutral-200"
                  >
                    닫기
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-3.5">
                    <div>
                      <label className="mb-1.5 block text-[12px] font-semibold text-neutral-500">
                        이름 <span className="text-red-400">*</span>
                      </label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        type="text"
                        placeholder="홍길동"
                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-[15px] outline-none transition-colors focus:border-[#15294A] focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[12px] font-semibold text-neutral-500">
                        연락처 <span className="text-red-400">*</span>
                      </label>
                      <input
                        value={ph}
                        onChange={(e) => setPh(e.target.value)}
                        type="tel"
                        placeholder="010-0000-0000"
                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-[15px] outline-none transition-colors focus:border-[#15294A] focus:bg-white"
                      />
                    </div>
                  </div>

                  <label className="mt-3.5 flex cursor-pointer items-start gap-2.5 rounded-xl bg-neutral-50 px-4 py-3.5 text-[11.5px] leading-[1.7] text-neutral-500">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[#15294A]"
                    />
                    <span>
                      <b className="font-semibold text-neutral-700">[필수]</b> 개인정보 수집·이용 동의 —
                      수집 항목: 이름, 연락처 | 목적: 보험 상담 연락 | 보유: 상담 종료 후 즉시 파기
                    </span>
                  </label>

                  {status === 'error' && (
                    <p className="mt-3 text-[12px] text-red-500">전송에 실패했습니다. 잠시 후 다시 시도해 주세요.</p>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={status === 'sending'}
                    className="mt-4 w-full rounded-full bg-[#15294A] py-4 text-[15px] font-bold text-white shadow-[0_4px_16px_rgba(21,41,74,0.3)] transition-all duration-150 active:scale-[0.98] disabled:opacity-60"
                  >
                    {status === 'sending' ? '전송 중…' : '무료 상담 신청하기'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════ 경각심 팝업 ════ */}
      {concern && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-5"
          style={{
            background: 'rgba(8,15,30,0.55)',
            backdropFilter: 'blur(8px)',
            animation: `${closing ? 'kp-fade-out' : 'kp-fade-in'} 0.2s ease both`,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) closePopup() }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-h-[85vh] w-full max-w-md overflow-auto rounded-2xl bg-white"
            style={{ animation: `${closing ? 'kp-scale-out' : 'kp-scale-in'} 0.2s ease both` }}
          >
            {/* 상단 컬러 바 */}
            <div className="h-1 w-full rounded-t-2xl bg-gradient-to-r from-[#15294A] via-[#3A6EA5] to-[#7FA8D8]" />

            <div className="p-6">
              {/* 닫기 버튼 */}
              <button
                onClick={() => closePopup()}
                aria-label="닫기"
                className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 transition-colors hover:bg-neutral-200"
              >
                <svg viewBox="0 0 14 14" className="h-3 w-3" fill="none" stroke="#666" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M1 1l12 12M13 1 1 13" />
                </svg>
              </button>

              {/* 아이콘 */}
              <span
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#15294A]"
                style={{ animation: 'kp-pop 0.35s ease both' }}
              >
                <ConcernIcon id={concern.key} />
              </span>

              <h3 className="mb-3 text-[18px] font-bold leading-[1.4] -tracking-[0.01em]">{concern.title}</h3>
              <p className="mb-3.5 rounded-lg bg-[#EDF1F7] px-3.5 py-2.5 text-[12.5px] font-semibold leading-[1.55] text-[#15294A]">
                {concern.stat}
              </p>
              <p className="mb-4 text-[13px] leading-[1.8] text-neutral-500">{concern.body}</p>
              <div className="rounded-lg border-l-[3px] border-[#1B3357] bg-neutral-50 py-2.5 pl-3.5 pr-3 text-[12.5px] leading-[1.65]">
                <b className="font-semibold text-[#15294A]">점검 포인트 </b>
                <span className="text-neutral-600">{concern.point}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
