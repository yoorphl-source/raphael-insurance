'use client'

import { useEffect, useRef, useState } from 'react'
import { submitLandingLead } from '@/app/actions/submitLandingLead'

/* ════════════════════════════════════════════════════════════
   타입
   ════════════════════════════════════════════════════════════ */
type Review = { quote: string; by: string }
type Faq = { q: string; a: string }

export type LandingPageProps = {
  /** A/B·주제 식별용. Supabase leads.source 에 저장됩니다. */
  source: string
  label?: string
  headline?: string        // 줄바꿈은 \n
  sub?: string
  ctaText?: string
  reviews?: Review[]
  partners?: string[]
  faqs?: Faq[]
  phone?: string
  /** 히어로 우측 이미지 경로 (public 폴더 기준, 예: '/hero.jpg') */
  heroImage?: string
}

/* ════════════════════════════════════════════════════════════
   기본 콘텐츠 (보장분석 기준)
   ════════════════════════════════════════════════════════════ */
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

/* 2×2 보장 항목 — 클릭 시 경각심 팝업.
   ※ 게시 전 통계 수치는 최신 출처(국가암등록통계·통계청 사망원인통계 등)로 검증하고,
     과장·불안감 조성 표현이 없는지 광고 심의 기준에 맞춰 검토하세요. */
const CONCERNS = [
  {
    key: 'silson', icon: '🩺', label: '실손보험',
    teaser: '건강보험이 안 되는 비급여, 그대로 본인 부담',
    title: '실손의료비, 제대로 알고 계신가요?',
    stat: '비급여 진료비는 건강보험 보장 대상이 아닙니다',
    body: 'MRI·도수치료·비급여 약제 등 건강보험이 보장하지 않는 의료비를 실손보험이 보완합니다. 다만 가입 세대(1~4세대)에 따라 자기부담률과 보장범위가 크게 다르고, 중복 가입해도 보험금은 비례 분담돼 두 건을 내도 더 받지 못할 수 있습니다.',
    point: '내 실손이 몇 세대인지, 불필요한 중복 가입은 없는지 확인이 필요합니다.',
  },
  {
    key: 'cancer', icon: '🦠', label: '암',
    teaser: '국내 사망원인 1위, 길고 비싼 치료',
    title: '암, 통계로 보면 남의 일이 아닙니다',
    stat: '기대수명까지 생존 시 약 3명 중 1명이 암을 경험 (국가암등록통계)',
    body: '암은 국내 사망원인 1위이며, 진단 이후 수술·항암·표적치료가 길게 이어져 비급여 치료비 부담이 큽니다. 치료 기간 동안 소득 공백이 함께 오는 경우도 많습니다.',
    point: '진단비 한도, 소액암·유사암 보장 여부를 확인하세요.',
  },
  {
    key: 'brain', icon: '🫀', label: '뇌·심장',
    teaser: '예고 없이 찾아오는 응급 질환',
    title: '뇌·심장 질환은 예고 없이 찾아옵니다',
    stat: '심장질환·뇌혈관질환은 국내 주요 사망원인입니다 (통계청 사망원인통계)',
    body: '뇌졸중·뇌출혈, 급성심근경색은 갑작스럽게 발생해 응급치료·수술·재활로 이어지는 경우가 많습니다. 후유장해가 남으면 장기간 소득 단절이 동반될 수 있습니다.',
    point: '뇌혈관·심장질환 진단비와 수술비 보장 범위를 확인하세요.',
  },
  {
    key: 'surgery', icon: '🔬', label: '수술비',
    teaser: '나이 들수록 잦아지는 입원·수술',
    title: '수술, 평생 한 번도 안 할 수 있을까요?',
    stat: '입원·수술 빈도는 연령이 높아질수록 증가합니다',
    body: '질병·상해로 인한 수술은 누구에게나 발생할 수 있고, 비급여 항목이 많아 부담이 큽니다. 수술비 특약은 수술 시 정액으로 지급돼 부담을 덜어줍니다.',
    point: '수술비 특약 유무와 1~5종 수술 분류별 보장을 확인하세요.',
  },
] as const

const INTERESTS = ['실손', '암', '간병', '기타']

export default function LandingPage({
  source,
  label = '무료 보장분석 서비스',
  headline = '내 보험, 제대로\n비교하고 계신가요?',
  sub = '여러 보험사 상품을 한 번에 비교·분석해\n지금 가장 합리적인 선택을 찾아드립니다.',
  ctaText = '무료 분석 신청하기',
  reviews = DEFAULT_REVIEWS,
  partners = DEFAULT_PARTNERS,
  faqs = DEFAULT_FAQS,
  phone = '010-0000-0000',
  heroImage,
}: LandingPageProps) {

  /* ── 스크롤 반응형 헤더 ── */
  const [scrolled, setScrolled] = useState(false)
  const [hideHeader, setHideHeader] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      const form = document.getElementById('form-anchor')
      if (form) setHideHeader(form.getBoundingClientRect().top <= 72)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  /* ── 경각심 팝업 ── */
  const [openKey, setOpenKey] = useState<string | null>(null)
  const [closing, setClosing] = useState(false)
  const concern = CONCERNS.find((c) => c.key === openKey)

  function closePopup(cb?: () => void) {
    setClosing(true)
    setTimeout(() => {
      setOpenKey(null)
      setClosing(false)
      cb?.()
    }, 180)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closePopup() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  useEffect(() => {
    if (openKey) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`
    } else {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [openKey])

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
    }, 3000)
    return () => clearInterval(timer)
  }, [reviews.length])

  /* ── 상담 폼 ── */
  const [name, setName] = useState('')
  const [ph, setPh] = useState('')
  const [birth, setBirth] = useState('')
  const [picked, setPicked] = useState<string[]>([])
  const [msg, setMsg] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  const togglePick = (v: string) =>
    setPicked((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]))

  async function handleSubmit() {
    if (!name.trim() || !ph.trim()) { alert('이름과 연락처를 입력해 주세요.'); return }
    if (!agreed) { alert('개인정보 수집·이용에 동의해 주세요.'); return }
    setStatus('sending')
    const result = await submitLandingLead({
      name,
      phone: ph,
      birth: birth || null,
      interests: picked.join(',') || null,
      message: msg || null,
      source,
    })
    if (!result.ok) { console.error(result.error); setStatus('error') }
    else setStatus('done')
  }

  const partnersLoop = [...partners, ...partners]

  return (
    <div className="font-sans text-[15px] leading-relaxed antialiased text-neutral-900">
      <style>{`
        @keyframes kp-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes kp-fade-in{from{opacity:0}to{opacity:1}}
        @keyframes kp-fade-out{from{opacity:1}to{opacity:0}}
        @keyframes kp-scale-in{from{opacity:0;transform:scale(0.95) translateY(6px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes kp-scale-out{from{opacity:1;transform:scale(1) translateY(0)}to{opacity:0;transform:scale(0.95) translateY(6px)}}
      `}</style>

      {/* ════ 스크롤 반응형 고정 헤더 ════ */}
      <header
        className={[
          'fixed inset-x-0 top-0 z-30 grid grid-cols-[1fr_auto_1fr] items-center px-5 py-3.5 transition-all duration-300',
          hideHeader ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100',
          scrolled ? 'bg-white border-b border-neutral-200 shadow-sm' : 'bg-[#15294A]',
        ].join(' ')}
      >
        <span className={`justify-self-center col-start-2 text-[18px] font-bold tracking-wide ${scrolled ? 'text-[#1B3357]' : 'text-white'}`}>
          KPARTNERS
        </span>
        <button
          onClick={() => scrollTo('form-anchor')}
          className={[
            'justify-self-end col-start-3 rounded px-3.5 py-2 text-[11px] font-semibold transition-colors',
            scrolled ? 'bg-[#1B3357] text-white' : 'border border-white/40 text-white',
          ].join(' ')}
        >
          보험비교/분석
        </button>
      </header>

      {/* ════ 1. 히어로 (텍스트 + 우측 이미지) ════ */}
      <section className="bg-[#15294A] px-6 pb-14 pt-[5.5rem]">
        <div className="mx-auto flex max-w-5xl flex-col gap-9 md:flex-row md:items-center">
          <div className="md:flex-1">
            <p className="mb-4 text-[12px] font-semibold tracking-[0.08em] text-[#9DB4D4]">{label}</p>
            <h1 className="mb-4 whitespace-pre-line text-[29px] font-bold leading-[1.38] -tracking-[0.025em] text-white md:text-[34px]">
              {headline}
            </h1>
            <p className="mb-7 whitespace-pre-line text-[14px] leading-[1.85] text-white/70 md:text-[15px]">{sub}</p>
            <button onClick={() => scrollTo('form-anchor')} className="rounded bg-white px-7 py-3.5 text-[15px] font-bold text-[#15294A]">
              {ctaText}
            </button>
            <div className="mt-6 flex flex-wrap gap-4">
              {['상담료 무료', '가입 강요 없음', '1:1 전담 상담'].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-[12px] text-white/75">
                  <span className="text-[#7FA8D8]">✓</span>{t}
                </span>
              ))}
            </div>
          </div>

          {/* 우측 이미지 */}
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

      {/* ════ 2. 보장 점검 버튼 (2×2) → 경각심 팝업 ════ */}
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
              className="relative flex min-h-[132px] flex-col rounded-xl border border-neutral-200 bg-white p-5 text-left transition-colors hover:border-[#1B3357]"
            >
              <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#15294A] text-[20px]">{c.icon}</span>
              <span className="mb-1 text-[16px] font-bold">{c.label}</span>
              <span className="text-[11.5px] leading-[1.5] text-neutral-500">{c.teaser}</span>
              <span className="absolute bottom-3 right-3.5 text-[15px] font-bold text-[#1B3357]">→</span>
            </button>
          ))}
        </div>
        </div>
      </section>

      {/* ════ 3. 고객 후기 (자동 슬라이드) ════ */}
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
          className="relative flex gap-3 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {reviews.map((r, i) => (
            <div key={i} className="shrink-0 basis-[82%] rounded border border-l-[3px] border-neutral-200 border-l-[#1B3357] bg-white px-5 pb-4 pt-5 md:basis-[48%]" style={{ scrollSnapAlign: 'start' }}>
              <span className="mb-3.5 block text-[30px] font-bold leading-[0.5] text-[#1B3357] opacity-25">&ldquo;</span>
              <p className="mb-4 text-[14px] leading-[1.78]">{r.quote}</p>
              <p className="border-t border-neutral-200 pt-2.5 text-[12px] text-neutral-500">{r.by}</p>
            </div>
          ))}
        </div>
        <div className="mt-1 flex justify-center gap-1.5">
          {reviews.map((_, i) => (
            <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === active ? 'bg-[#1B3357]' : 'bg-neutral-300'}`} />
          ))}
        </div>
        </div>
      </section>

      {/* ════ 4. 제휴 보험사 (자동 마키, 칸 확대) ════ */}
      <section className="bg-neutral-50 px-6 py-12">
        <div className="mx-auto max-w-5xl">
        <h2 className="mb-2 text-[21px] font-bold -tracking-[0.015em]">제휴 보험사</h2>
        <div className="mb-4 h-[3px] w-[34px] bg-[#1B3357]" />
        <p className="mb-6 text-[13px] text-neutral-500">여러 보험사 상품을 비교해 안내해 드립니다.</p>
        </div>
        <div className="overflow-hidden">
          <div className="flex w-max gap-6" style={{ animation: 'kp-marquee 45s linear infinite' }}>
            {partnersLoop.map((src, i) => (
              <div key={i} className="flex h-[72px] w-[140px] shrink-0 items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="보험사 로고" className="max-h-full max-w-full object-contain" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ 5. FAQ ════ */}
      <section className="bg-white px-6 py-12">
        <div className="mx-auto max-w-5xl">
        <h2 className="mb-2 text-[21px] font-bold -tracking-[0.015em]">자주 묻는 질문</h2>
        <div className="mb-4 h-[3px] w-[34px] bg-[#1B3357]" />
        {faqs.map((f, i) => (
          <details key={i} open={i === 0} className="group border-b border-neutral-200">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2.5 py-[1.15rem] text-[15px] font-semibold [&::-webkit-details-marker]:hidden">
              {f.q}
              <span className="shrink-0 text-[18px] text-[#1B3357] transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="pb-[1.15rem] text-[13px] leading-[1.8] text-neutral-500">{f.a}</p>
          </details>
        ))}
        </div>
      </section>

      {/* ════ 6. 상담 요청 ════ */}
      <section id="form-anchor" className="bg-neutral-50 px-6 py-12">
        <div className="mx-auto max-w-lg">
        <h2 className="mb-2 text-[21px] font-bold -tracking-[0.015em]">상담 요청</h2>
        <div className="mb-4 h-[3px] w-[34px] bg-[#1B3357]" />
        <p className="mb-6 text-[13px] text-neutral-500">신청 후 1영업일 이내 연락드립니다.</p>

        {status === 'done' ? (
          <div className="rounded border border-neutral-300 bg-white p-8 text-center">
            <p className="mb-2 text-[17px] font-bold text-[#15294A]">신청이 완료되었습니다</p>
            <p className="text-[13px] leading-relaxed text-neutral-500">1영업일 이내에 연락드리겠습니다. 감사합니다.</p>
          </div>
        ) : (
          <div className="rounded border border-neutral-300 bg-white p-6">
            <label className="mb-1.5 block text-[13px] font-semibold">이름<span className="ml-1 text-[11px] font-normal text-red-600">필수</span></label>
            <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="홍길동" className="w-full rounded border border-neutral-300 px-3.5 py-3 text-[14px]" />

            <label className="mb-1.5 mt-[1.15rem] block text-[13px] font-semibold">연락처<span className="ml-1 text-[11px] font-normal text-red-600">필수</span></label>
            <input value={ph} onChange={(e) => setPh(e.target.value)} type="tel" placeholder="010-0000-0000" className="w-full rounded border border-neutral-300 px-3.5 py-3 text-[14px]" />

            <label className="mb-1.5 mt-[1.15rem] block text-[13px] font-semibold">생년월일<span className="ml-1 text-[11px] font-normal text-neutral-400">선택</span></label>
            <input value={birth} onChange={(e) => setBirth(e.target.value)} type="text" placeholder="예: 1990-01-01" className="w-full rounded border border-neutral-300 px-3.5 py-3 text-[14px]" />

            <label className="mb-1.5 mt-[1.15rem] block text-[13px] font-semibold">관심 보장<span className="ml-1 text-[11px] font-normal text-neutral-400">선택 · 복수 가능</span></label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((v) => {
                const on = picked.includes(v)
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => togglePick(v)}
                    className={[
                      'rounded-full border px-4 py-2 text-[13px] font-medium transition-colors',
                      on ? 'border-[#15294A] bg-[#15294A] text-white' : 'border-neutral-300 bg-white text-neutral-600',
                    ].join(' ')}
                  >
                    {v}
                  </button>
                )
              })}
            </div>

            <label className="mb-1.5 mt-[1.15rem] block text-[13px] font-semibold">문의 내용<span className="ml-1 text-[11px] font-normal text-neutral-400">선택</span></label>
            <input value={msg} onChange={(e) => setMsg(e.target.value)} type="text" placeholder="예: 실손보험 중복 여부 확인하고 싶어요" className="w-full rounded border border-neutral-300 px-3.5 py-3 text-[14px]" />

            <div className="my-[1.15rem] rounded bg-neutral-50 p-3.5">
              <p className="mb-2.5 text-[11px] leading-[1.75] text-neutral-500">
                [필수] 개인정보 수집·이용 동의<br />
                수집 항목: 이름, 연락처, 생년월일, 관심 보장 | 목적: 보험 상담 연락 | 보유 기간: 상담 종료 후 즉시 파기
              </p>
              <label className="flex items-start gap-2 text-[12px]">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[#15294A]" />
                위 내용을 확인하였으며 개인정보 수집·이용에 동의합니다.
              </label>
            </div>

            {status === 'error' && <p className="mb-2 text-[12px] text-red-600">전송에 실패했습니다. 잠시 후 다시 시도해 주세요.</p>}

            <button onClick={handleSubmit} disabled={status === 'sending'} className="mt-1 w-full rounded bg-[#15294A] py-[15px] text-[15px] font-bold text-white disabled:opacity-60">
              {status === 'sending' ? '전송 중…' : '무료 상담 신청하기'}
            </button>
          </div>
        )}
        </div>
      </section>

      {/* ════ 푸터 (매트 블랙) ════ */}
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

      {/* ════ 경각심 팝업 (배경 블러) ════ */}
      {concern && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-5 backdrop-blur-md"
          style={{
            background: 'rgba(10,18,35,0.45)',
            animation: `${closing ? 'kp-fade-out' : 'kp-fade-in'} 0.18s ease both`,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) closePopup() }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-h-[85vh] w-full max-w-md overflow-auto rounded-2xl bg-white p-6"
            style={{ animation: `${closing ? 'kp-scale-out' : 'kp-scale-in'} 0.18s ease both` }}
          >
            <button onClick={() => closePopup()} aria-label="닫기" className="absolute right-3.5 top-3.5 text-[19px] leading-none text-neutral-400">✕</button>
            <span className="mb-3.5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#15294A] text-[23px]">{concern.icon}</span>
            <h3 className="mb-3 text-[18px] font-bold leading-[1.4] -tracking-[0.01em]">{concern.title}</h3>
            <p className="mb-3.5 rounded-md bg-[#EDF1F7] px-3 py-2.5 text-[12.5px] font-semibold leading-[1.5] text-[#15294A]">{concern.stat}</p>
            <p className="mb-3.5 text-[13px] leading-[1.75] text-neutral-500">{concern.body}</p>
            <p className="mb-5 border-l-[3px] border-[#1B3357] py-0.5 pl-3 text-[12.5px] leading-[1.65]">
              <b className="font-bold text-[#15294A]">점검 포인트 </b>{concern.point}
            </p>
            <button
              onClick={() => closePopup(() => setTimeout(() => scrollTo('form-anchor'), 80))}
              className="w-full rounded-lg bg-[#15294A] py-3.5 text-[14px] font-bold text-white"
            >
              내 보장 무료로 점검받기 →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
