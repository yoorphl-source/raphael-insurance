'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { submitChatLead } from '@/app/actions/submitChatLead';
import { normalizeName, normalizeDOB, normalizePhone, extractNumber } from '@/app/lib/normalizers';

// ── Types ─────────────────────────────────────────────────────

type Step =
  | 'name_input'
  | 'gender_buttons'
  | 'insurance_type'
  | 'housing_type'
  | 'housing_size'
  | 'housing_age'
  | 'housing_floor'
  | 'driver_usage'
  | 'driver_vehicle'
  | 'driver_plan'
  | 'dob_input'
  | 'phone_input'
  | 'done';

type Message = { id: number; from: 'bot' | 'user'; text: string };

type CollectedData = {
  name: string;
  gender: string;
  insuranceType: string;
  housingType: string;
  housingSize: string;
  housingAge: string;
  housingHighFloor: string;
  driverUsage: string;
  driverVehicle: string;
  driverPlan: string;
  dob: string;
  phone: string;
};

// ── Post-done FAQ ─────────────────────────────────────────────

const POST_FAQ = [
  {
    patterns: ['비용', '가격', '얼마', '무료', '유료', '상담비'],
    answer: '상담은 무료이고 가입 의무도 없어요.',
  },
  {
    patterns: ['가입', '의무', '필수', '꼭', '해야'],
    answer: '전혀요. 비교만 보셔도 괜찮습니다.',
  },
  {
    patterns: ['개인정보', '정보', '데이터', '보관', '안전'],
    answer: '상담 안내 목적 외에는 사용하지 않고 안전하게 보관해요.',
  },
];
const FAQ_FALLBACK = '그 부분은 배정된 상담사가 자세히 안내드릴 거예요. 곧 연락드릴게요!';

// ── Helpers ───────────────────────────────────────────────────

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

function matchFAQ(text: string): string | null {
  const lower = text.toLowerCase();
  for (const faq of POST_FAQ) {
    if (faq.patterns.some((p) => lower.includes(p))) return faq.answer;
  }
  return null;
}

function getProgress(step: Step): number {
  const map: Record<Step, number> = {
    name_input: 10,
    gender_buttons: 16,
    insurance_type: 22,
    housing_type: 32,
    housing_size: 42,
    housing_age: 52,
    housing_floor: 58,
    driver_usage: 32,
    driver_vehicle: 44,
    driver_plan: 56,
    dob_input: 70,
    phone_input: 85,
    done: 100,
  };
  return map[step] ?? 0;
}

const DOB_MSG =
  '정확한 보험료와 보장을 안내드리려면 생년월일이 필요해요. 보험은 나이에 따라 조건이 달라지거든요. (예: 1990-01-01)';

// ── Component ─────────────────────────────────────────────────

export default function ChatPage() {
  type IntroPhase = 'visible' | 'fading' | 'gone';
  const [introPhase, setIntroPhase] = useState<IntroPhase>('visible');

  const [step, setStep] = useState<Step>('name_input');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [data, setData] = useState<CollectedData>({
    name: '', gender: '', insuranceType: '',
    housingType: '', housingSize: '', housingAge: '', housingHighFloor: '',
    driverUsage: '', driverVehicle: '', driverPlan: '',
    dob: '', phone: '',
  });

  const bottomRef = useRef<HTMLDivElement>(null);
  const msgId = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Intro → first bot message
  useEffect(() => {
    const t1 = setTimeout(() => setIntroPhase('fading'), 700);
    const t2 = setTimeout(() => {
      setIntroPhase('gone');
      const msg = '안녕하세요, 보험 상담을 도와드리는 AI 도우미 라파엘이에요. 딱 맞는 보장을 찾아드리려고 몇 가지만 여쭤볼게요, 오래 안 걸려요. 먼저 뭐라고 불러드리면 좋을까요?';
      const dur = Math.min(600 + msg.length * 10, 1800);
      setIsTyping(true);
      const t3 = setTimeout(() => {
        setIsTyping(false);
        setMessages([{ id: ++msgId.current, from: 'bot', text: msg }]);
        setStep('name_input');
      }, dur);
      timers.current.push(t3);
    }, 1200);
    timers.current.push(t1, t2);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Bot message queue helper ───────────────────────────────

  function sendBotSequence(msgs: string[], nextStep?: Step) {
    let delay = 0;
    msgs.forEach((msg, i) => {
      const dur = Math.min(600 + msg.length * 10, 1800);
      const t1 = setTimeout(() => setIsTyping(true), delay);
      const t2 = setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [...prev, { id: ++msgId.current, from: 'bot', text: msg }]);
        if (i === msgs.length - 1 && nextStep) setStep(nextStep);
      }, delay + dur);
      timers.current.push(t1, t2);
      delay += dur + 250;
    });
  }

  function userSay(text: string) {
    setMessages((prev) => [...prev, { id: ++msgId.current, from: 'user', text }]);
  }

  // ── Step handlers ─────────────────────────────────────────

  function handleName() {
    if (!textInput.trim()) return;
    setTextInput('');
    const name = normalizeName(textInput.trim());
    userSay(name);
    setData((d) => ({ ...d, name }));
    sendBotSequence(['성별도 알려주시겠어요?'], 'gender_buttons');
  }

  function handleGender(gender: string) {
    userSay(gender);
    setData((d) => ({ ...d, gender }));
    sendBotSequence([`반가워요, ${data.name}님! 어떤 보험이 궁금하신가요? 편하게 골라주세요.`], 'insurance_type');
  }

  function handleInsuranceType(type: string) {
    userSay(type);
    setData((d) => ({ ...d, insuranceType: type }));

    const intros: Record<string, string[]> = {
      '주택': [
        '주택보험은 화재·누수처럼 예상치 못한 사고로부터 집과 가재도구의 손해를 보장하는 보험이에요. 주거 형태와 건물 조건에 따라 달라져서 몇 가지만 여쭤볼게요.',
        '어떤 형태의 주거지인가요?',
      ],
      '운전자': [
        '운전자보험은 자동차보험으로 채워지지 않는 운전 중 사고의 부담을 보완하는 보험이에요. 차량 용도와 종류에 따라 달라져서 몇 가지 확인할게요.',
        '차량 용도가 어떻게 되나요?',
      ],
      '암·질병': [
        '암·질병보험은 암 진단이나 입원·수술 등 큰 비용이 드는 상황에 대비하는 보장이에요. 나이와 조건에 따라 달라지니 생년월일을 먼저 여쭤볼게요.',
        DOB_MSG,
      ],
      '자동차': [
        '자동차보험은 운전 중 사고로 인한 피해를 보장하는, 운전자에게 기본이 되는 보험이에요. 조건에 맞는 비교를 위해 몇 가지 여쭤볼게요.',
        DOB_MSG,
      ],
    };
    const nextMap: Record<string, Step> = {
      '주택': 'housing_type',
      '운전자': 'driver_usage',
      '암·질병': 'dob_input',
      '자동차': 'dob_input',
    };
    sendBotSequence(intros[type] ?? [], nextMap[type] ?? 'dob_input');
  }

  function handleHousingType(type: string) {
    userSay(type);
    setData((d) => ({ ...d, housingType: type }));
    sendBotSequence(['전용 면적은 대략 어느 정도인가요? (예: 25평)'], 'housing_size');
  }

  function handleHousingSize() {
    const num = extractNumber(textInput.trim());
    if (num === null) return;
    setTextInput('');
    const size = String(num);
    userSay(`${size}평`);
    setData((d) => ({ ...d, housingSize: size }));
    sendBotSequence(['건물 연식은 어떻게 되나요? (예: 2010)'], 'housing_age');
  }

  function handleHousingAge() {
    const num = extractNumber(textInput.trim());
    if (num === null) return;
    setTextInput('');
    const age = String(num);
    userSay(`${age}년`);
    setData((d) => ({ ...d, housingAge: age }));

    if (data.housingType === '아파트') {
      sendBotSequence(['단지 안에 16층 이상 건물이 있나요?'], 'housing_floor');
    } else {
      sendBotSequence([DOB_MSG], 'dob_input');
    }
  }

  function handleHousingFloor(answer: string) {
    userSay(answer);
    setData((d) => ({ ...d, housingHighFloor: answer }));
    sendBotSequence([DOB_MSG], 'dob_input');
  }

  function handleDriverUsage(usage: string) {
    userSay(usage);
    setData((d) => ({ ...d, driverUsage: usage }));
    sendBotSequence(['차종을 골라주세요.'], 'driver_vehicle');
  }

  function handleDriverVehicle(vehicle: string) {
    userSay(vehicle);
    setData((d) => ({ ...d, driverVehicle: vehicle }));
    sendBotSequence([
      '보장 범위에 따라 플랜을 고르실 수 있어요. 어떤 쪽이 좋으세요?\n[플랜 설명 — 실제 상품 기준 입력 예정]',
    ], 'driver_plan');
  }

  function handleDriverPlan(plan: string) {
    userSay(plan);
    setData((d) => ({ ...d, driverPlan: plan }));
    sendBotSequence([DOB_MSG], 'dob_input');
  }

  function handleDOB() {
    const dob = normalizeDOB(textInput.trim());
    if (!dob) {
      setTextInput('');
      sendBotSequence(['생년월일을 다시 입력해 주시겠어요?']);
      return;
    }
    setTextInput('');
    userSay(dob);
    setData((d) => ({ ...d, dob }));
    sendBotSequence([
      '거의 끝났어요! 준비된 견적을 보내드릴 연락처를 남겨주세요. 상담 안내 외 용도로는 쓰이지 않고 안전하게 보관돼요.',
    ], 'phone_input');
  }

  function handlePhone() {
    const phone = normalizePhone(textInput.trim());
    if (!phone) return;
    setTextInput('');
    userSay(phone);
    setData((d) => ({ ...d, phone }));

    // Build detail object from sub-answers
    const detail: Record<string, string> = {};
    if (data.insuranceType === '주택') {
      if (data.housingType)      detail.housing_type       = data.housingType;
      if (data.housingSize)      detail.housing_size       = data.housingSize;
      if (data.housingAge)       detail.housing_age        = data.housingAge;
      if (data.housingHighFloor) detail.housing_high_floor = data.housingHighFloor;
    } else if (data.insuranceType === '운전자') {
      if (data.driverUsage)   detail.driver_usage   = data.driverUsage;
      if (data.driverVehicle) detail.driver_vehicle = data.driverVehicle;
      if (data.driverPlan)    detail.driver_plan    = data.driverPlan;
    }

    // Fire-and-forget: failure is silent to the user
    void submitChatLead({
      name: data.name,
      phone,                       // use local var — state update is async
      gender: data.gender,
      insuranceType: data.insuranceType,
      detail,
      birthdate: data.dob,
    });

    sendBotSequence([
      `감사합니다, ${data.name}님! 입력해주신 내용으로 여러 보험사 조건을 확인한 뒤, 담당 상담사가 정리해서 연락드릴게요. 잠시만 기다려 주세요.`,
      '추가로 궁금하신 점이 있으시면 편하게 물어보세요.',
    ], 'done');
  }

  function handlePostDone() {
    const text = textInput.trim();
    if (!text) return;
    setTextInput('');
    userSay(text);
    sendBotSequence([matchFAQ(text) ?? FAQ_FALLBACK]);
  }

  // ── Driver plan labels ────────────────────────────────────

  const driverPlans =
    data.driverUsage === '자가용'
      ? ['1만원 기본형', '2만원 상해보장형']
      : ['2만원 기본형', '3만원 상해보장형'];

  const progress = getProgress(step);

  // ── Render ────────────────────────────────────────────────

  return (
    <div className="flex h-dvh flex-col bg-gray-50 font-sans">

      {/* ── 진입 오버레이 ── */}
      {introPhase !== 'gone' && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-[#1e3a5f] px-8 text-center transition-opacity duration-500 ${
            introPhase === 'fading' ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-300">
              AI 도우미 배정됨
            </p>
            <p className="text-xl font-bold leading-snug text-white sm:text-2xl">
              전문 AI 도우미<br />
              <span className="text-blue-300">'라파엘'</span>이<br />
              배정되었습니다
            </p>
            <p className="mt-5 text-xs text-blue-300">
              ※ 이 도우미는 AI 자동 응답 시스템입니다
            </p>
          </div>
        </div>
      )}

      {/* ── Nav ── */}
      <header className="shrink-0 border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-2">
          <Link href="/" className="shrink-0 text-sm text-gray-500 transition hover:text-gray-900">
            ← 홈으로
          </Link>
          <span className="min-w-0 truncate text-center text-sm font-semibold text-gray-900">라파엘 보험 도우미</span>
          <span className="shrink-0 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">AI 도우미</span>
        </div>
      </header>

      {/* ── Progress bar ── */}
      <div className="shrink-0 h-1 bg-gray-200">
        <div
          className="h-1 bg-[#1e3a5f] transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── Messages ── */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 sm:px-4 sm:py-5">
        <div className="mx-auto max-w-2xl space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <p
                className={`max-w-[78%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.from === 'user'
                    ? 'rounded-br-sm bg-[#1e3a5f] text-white'
                    : 'rounded-bl-sm bg-white text-gray-800 shadow-sm ring-1 ring-gray-100'
                }`}
              >
                {msg.text}
              </p>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100">
                {[0, 160, 320].map((d) => (
                  <span
                    key={d}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                    style={{ animationDelay: `${d}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* ── Input area ── */}
      {introPhase === 'gone' && (
        <div className="shrink-0 border-t border-gray-200 bg-white px-3 py-3 sm:px-4 sm:py-4">
          <div
            className={`mx-auto max-w-2xl space-y-2 transition-opacity duration-200 ${
              isTyping ? 'pointer-events-none opacity-40' : ''
            }`}
          >
            {step === 'name_input' && (
              <form onSubmit={(e) => { e.preventDefault(); handleName(); }} className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="이름을 입력해주세요"
                  className="flex-1 rounded border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]"
                />
                <button
                  type="submit"
                  disabled={!textInput.trim()}
                  className="rounded bg-[#1e3a5f] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#162d4a] disabled:opacity-40"
                >
                  전송
                </button>
              </form>
            )}

            {step === 'gender_buttons' && (
              <div className="flex gap-2">
                {['남성', '여성'].map((g) => (
                  <button key={g} onClick={() => handleGender(g)}
                    className="flex-1 rounded border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition hover:border-[#1e3a5f] hover:text-[#1e3a5f]">
                    {g}
                  </button>
                ))}
              </div>
            )}

            {step === 'insurance_type' && (
              <div className="grid grid-cols-2 gap-2">
                {['주택', '암·질병', '운전자', '자동차'].map((t) => (
                  <button key={t} onClick={() => handleInsuranceType(t)}
                    className="rounded border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition hover:border-[#1e3a5f] hover:text-[#1e3a5f]">
                    {t}
                  </button>
                ))}
              </div>
            )}

            {step === 'housing_type' && (
              <div className="flex gap-2">
                {['아파트', '주택'].map((t) => (
                  <button key={t} onClick={() => handleHousingType(t)}
                    className="flex-1 rounded border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition hover:border-[#1e3a5f] hover:text-[#1e3a5f]">
                    {t}
                  </button>
                ))}
              </div>
            )}

            {step === 'housing_size' && (
              <form onSubmit={(e) => { e.preventDefault(); handleHousingSize(); }} className="flex gap-2">
                <input autoFocus type="text" inputMode="numeric" value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="예: 25, 30평, 25평형"
                  className="flex-1 rounded border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]" />
                <button type="submit" disabled={extractNumber(textInput) === null}
                  className="rounded bg-[#1e3a5f] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#162d4a] disabled:opacity-40">
                  전송
                </button>
              </form>
            )}

            {step === 'housing_age' && (
              <form onSubmit={(e) => { e.preventDefault(); handleHousingAge(); }} className="flex gap-2">
                <input autoFocus type="text" inputMode="numeric" value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="예: 2010, 2015년식"
                  className="flex-1 rounded border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]" />
                <button type="submit" disabled={extractNumber(textInput) === null}
                  className="rounded bg-[#1e3a5f] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#162d4a] disabled:opacity-40">
                  전송
                </button>
              </form>
            )}

            {step === 'housing_floor' && (
              <div className="flex gap-2">
                {['예', '아니오'].map((a) => (
                  <button key={a} onClick={() => handleHousingFloor(a)}
                    className="flex-1 rounded border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition hover:border-[#1e3a5f] hover:text-[#1e3a5f]">
                    {a}
                  </button>
                ))}
              </div>
            )}

            {step === 'driver_usage' && (
              <div className="flex gap-2">
                {['자가용', '영업용'].map((u) => (
                  <button key={u} onClick={() => handleDriverUsage(u)}
                    className="flex-1 rounded border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition hover:border-[#1e3a5f] hover:text-[#1e3a5f]">
                    {u}
                  </button>
                ))}
              </div>
            )}

            {step === 'driver_vehicle' && (
              <div className="grid grid-cols-2 gap-2">
                {['승용차', '승합차', '화물차', '기타'].map((v) => (
                  <button key={v} onClick={() => handleDriverVehicle(v)}
                    className="rounded border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition hover:border-[#1e3a5f] hover:text-[#1e3a5f]">
                    {v}
                  </button>
                ))}
              </div>
            )}

            {step === 'driver_plan' && (
              <div className="flex flex-col gap-2">
                {driverPlans.map((plan) => (
                  <button key={plan} onClick={() => handleDriverPlan(plan)}
                    className="rounded border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition hover:border-[#1e3a5f] hover:text-[#1e3a5f]">
                    {plan}
                  </button>
                ))}
              </div>
            )}

            {step === 'dob_input' && (
              <form onSubmit={(e) => { e.preventDefault(); handleDOB(); }} className="flex gap-2">
                <input autoFocus type="text" inputMode="numeric" value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="예: 19900101, 1990-01-01, 1990년 1월 1일"
                  className="flex-1 rounded border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]" />
                <button type="submit" disabled={normalizeDOB(textInput) === null}
                  className="rounded bg-[#1e3a5f] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#162d4a] disabled:opacity-40">
                  전송
                </button>
              </form>
            )}

            {step === 'phone_input' && (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 text-xs text-gray-400">
                  <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  <span>안전하게 보관되며, 상담 외 목적으로 사용되지 않습니다</span>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); handlePhone(); }} className="flex gap-2">
                  <input autoFocus type="tel" inputMode="numeric" value={textInput}
                    onChange={(e) => setTextInput(formatPhone(e.target.value))}
                    placeholder="010-0000-0000"
                    className="flex-1 rounded border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]" />
                  <button type="submit" disabled={normalizePhone(textInput) === null}
                    className="rounded bg-[#1e3a5f] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#162d4a] disabled:opacity-40">
                    전송
                  </button>
                </form>
              </div>
            )}

            {step === 'done' && (
              <form onSubmit={(e) => { e.preventDefault(); handlePostDone(); }} className="flex gap-2">
                <input type="text" value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="추가로 궁금한 점을 입력해주세요"
                  className="flex-1 rounded border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]" />
                <button type="submit" disabled={!textInput.trim()}
                  className="rounded bg-[#1e3a5f] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#162d4a] disabled:opacity-40">
                  전송
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
