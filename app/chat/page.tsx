'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { submitChatLead } from '@/app/actions/submitChatLead';

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
    patterns: ['비용', '가격', '보험료', '얼마'],
    answer: '[FAQ 답변 placeholder — 보험료 관련 안내]',
  },
  {
    patterns: ['언제', '연락', '기다'],
    answer: '[FAQ 답변 placeholder — 연락 시기 관련 안내]',
  },
  {
    patterns: ['취소', '철회', '변경'],
    answer: '[FAQ 답변 placeholder — 취소·변경 관련 안내]',
  },
  {
    patterns: ['개인정보', '정보', '데이터', '보관'],
    answer: '[FAQ 답변 placeholder — 개인정보 관련 안내]',
  },
];
const FAQ_FALLBACK = '자세한 내용은 배정된 상담사가 연락드려 안내드려요.';

// ── Helpers ───────────────────────────────────────────────────

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

function formatDOB(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 4) return d;
  if (d.length <= 6) return `${d.slice(0, 4)}-${d.slice(4)}`;
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}`;
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
    const t1 = setTimeout(() => setIntroPhase('fading'), 1500);
    const t2 = setTimeout(() => {
      setIntroPhase('gone');
      const msg = '안녕하세요, AI 도우미 라파엘이에요. 전문 상담사를 연결해 드리기 전에, 어떤 보장이 필요하신지 먼저 파악하려고 몇 가지만 여쭤볼게요. 오래 안 걸려요! 먼저 뭐라고 불러드리면 좋을까요?';
      const dur = Math.min(600 + msg.length * 10, 1800);
      setIsTyping(true);
      const t3 = setTimeout(() => {
        setIsTyping(false);
        setMessages([{ id: ++msgId.current, from: 'bot', text: msg }]);
        setStep('name_input');
      }, dur);
      timers.current.push(t3);
    }, 2100);
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
    const name = textInput.trim();
    if (!name) return;
    setTextInput('');
    userSay(name);
    setData((d) => ({ ...d, name }));
    sendBotSequence([`반갑습니다, ${name}님! 성별을 선택해주세요.`], 'gender_buttons');
  }

  function handleGender(gender: string) {
    userSay(gender);
    setData((d) => ({ ...d, gender }));
    sendBotSequence([`${data.name}님, 어떤 보험이 궁금하세요?`], 'insurance_type');
  }

  function handleInsuranceType(type: string) {
    userSay(type);
    setData((d) => ({ ...d, insuranceType: type }));

    const intros: Record<string, string[]> = {
      '주택': [
        '[주택보험 설명 placeholder]',
        '도와드리기 위해 몇 가지 여쭤볼게요. 아파트와 일반 주택 중 어디에 거주하세요?',
      ],
      '운전자': [
        '[운전자보험 설명 placeholder]',
        '도와드리기 위해 몇 가지 여쭤볼게요. 자가용이신가요, 영업용 차량이신가요?',
      ],
      '암·질병(종합)': [
        '[암·질병 종합보험 설명 placeholder]',
        '정확한 견적 산출을 위해 생년월일이 필요해요. 8자리로 입력해주세요. (예: 19900101)',
      ],
      '자동차': [
        '[자동차보험 설명 placeholder]',
        '정확한 견적 산출을 위해 생년월일이 필요해요. 8자리로 입력해주세요. (예: 19900101)',
      ],
    };
    const nextMap: Record<string, Step> = {
      '주택': 'housing_type',
      '운전자': 'driver_usage',
      '암·질병(종합)': 'dob_input',
      '자동차': 'dob_input',
    };
    sendBotSequence(intros[type] ?? [], nextMap[type] ?? 'dob_input');
  }

  function handleHousingType(type: string) {
    userSay(type);
    setData((d) => ({ ...d, housingType: type }));
    sendBotSequence(['거주하시는 평수를 알려주세요. (예: 25)'], 'housing_size');
  }

  function handleHousingSize() {
    const size = textInput.trim();
    if (!size) return;
    setTextInput('');
    userSay(`${size}평`);
    setData((d) => ({ ...d, housingSize: size }));
    sendBotSequence(['건물 준공 연도를 알려주세요. (예: 2010)'], 'housing_age');
  }

  function handleHousingAge() {
    const age = textInput.trim();
    if (!age) return;
    setTextInput('');
    userSay(`${age}년`);
    setData((d) => ({ ...d, housingAge: age }));

    if (data.housingType === '아파트') {
      sendBotSequence(['단지 내 16층 이상 건물이 있나요?'], 'housing_floor');
    } else {
      sendBotSequence([
        '정확한 견적 산출을 위해 생년월일이 필요해요. 8자리로 입력해주세요. (예: 19900101)',
      ], 'dob_input');
    }
  }

  function handleHousingFloor(answer: string) {
    userSay(answer);
    setData((d) => ({ ...d, housingHighFloor: answer }));
    sendBotSequence([
      '정확한 견적 산출을 위해 생년월일이 필요해요. 8자리로 입력해주세요. (예: 19900101)',
    ], 'dob_input');
  }

  function handleDriverUsage(usage: string) {
    userSay(usage);
    setData((d) => ({ ...d, driverUsage: usage }));
    sendBotSequence(['차종을 선택해주세요.'], 'driver_vehicle');
  }

  function handleDriverVehicle(vehicle: string) {
    userSay(vehicle);
    setData((d) => ({ ...d, driverVehicle: vehicle }));
    const plans =
      data.driverUsage === '자가용'
        ? '[1만원 기본형 플랜 설명 placeholder] / [2만원 상해보장형 플랜 설명 placeholder]'
        : '[2만원 기본형 플랜 설명 placeholder] / [3만원 상해보장형 플랜 설명 placeholder]';
    sendBotSequence([`플랜을 선택해주세요.\n${plans}`], 'driver_plan');
  }

  function handleDriverPlan(plan: string) {
    userSay(plan);
    setData((d) => ({ ...d, driverPlan: plan }));
    sendBotSequence([
      '정확한 견적 산출을 위해 생년월일이 필요해요. 8자리로 입력해주세요. (예: 19900101)',
    ], 'dob_input');
  }

  function handleDOB() {
    const dob = textInput.trim();
    if (dob.replace(/\D/g, '').length < 8) return;
    setTextInput('');
    userSay(dob);
    setData((d) => ({ ...d, dob }));
    sendBotSequence([
      '견적을 보내드리려면 연락처가 필요해요.',
      '안전하게 보관되며, 상담 외 목적으로 사용되지 않습니다. 휴대폰 번호를 입력해주세요.',
    ], 'phone_input');
  }

  const PHONE_RE = /^010-\d{4}-\d{4}$/;

  function handlePhone() {
    const phone = textInput.trim();
    if (!PHONE_RE.test(phone)) return;
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
      '확인 후 보험사 견적 정리해 연락드릴게요. 감사합니다!',
      '추가로 궁금한 점이 있으시면 언제든 말씀해주세요.',
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
              <span className="text-blue-300">'라파엘 보험 도우미'</span>가<br />
              배정되었습니다
            </p>
            <p className="mt-5 text-xs text-blue-300">
              ※ 이 도우미는 AI 자동 응답 시스템입니다
            </p>
          </div>
        </div>
      )}

      {/* ── Nav ── */}
      <header className="shrink-0 border-b border-gray-200 bg-white px-6 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link href="/" className="text-sm text-gray-500 transition hover:text-gray-900">
            ← 홈으로
          </Link>
          <span className="text-sm font-semibold text-gray-900">라파엘 보험 도우미</span>
          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">AI 도우미</span>
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
      <main className="flex-1 overflow-y-auto px-4 py-5">
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
        <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-4">
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
                {['주택', '암·질병(종합)', '운전자', '자동차'].map((t) => (
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
                <input autoFocus type="number" min="1" value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="평수 입력 (예: 25)"
                  className="flex-1 rounded border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]" />
                <button type="submit" disabled={!textInput.trim()}
                  className="rounded bg-[#1e3a5f] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#162d4a] disabled:opacity-40">
                  전송
                </button>
              </form>
            )}

            {step === 'housing_age' && (
              <form onSubmit={(e) => { e.preventDefault(); handleHousingAge(); }} className="flex gap-2">
                <input autoFocus type="number" min="1900" max={new Date().getFullYear()} value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="준공 연도 (예: 2010)"
                  className="flex-1 rounded border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]" />
                <button type="submit" disabled={!textInput.trim()}
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
                {['승용', '승합', '화물', '기타'].map((v) => (
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
                  onChange={(e) => setTextInput(formatDOB(e.target.value))}
                  placeholder="생년월일 (예: 1990-01-01)"
                  className="flex-1 rounded border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]" />
                <button type="submit" disabled={textInput.replace(/\D/g, '').length < 8}
                  className="rounded bg-[#1e3a5f] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#162d4a] disabled:opacity-40">
                  전송
                </button>
              </form>
            )}

            {step === 'phone_input' && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 justify-center text-xs text-gray-400">
                  <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  안전하게 보관되며, 상담 외 목적으로 사용되지 않습니다
                </div>
                <form onSubmit={(e) => { e.preventDefault(); handlePhone(); }} className="flex gap-2">
                  <input autoFocus type="tel" inputMode="numeric" value={textInput}
                    onChange={(e) => setTextInput(formatPhone(e.target.value))}
                    placeholder="010-0000-0000"
                    className="flex-1 rounded border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]" />
                  <button type="submit" disabled={!PHONE_RE.test(textInput)}
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
