'use client';

import { useState, useEffect, useRef } from 'react';

const QA = [
  {
    id: 'cost',
    q: '상담 비용이 있나요?',
    a: '[준법 검토 후 교체 예정 — 비용 관련 안내]',
  },
  {
    id: 'products',
    q: '어떤 보험을 다루나요?',
    a: '[준법 검토 후 교체 예정 — 취급 보험 안내]',
  },
  {
    id: 'privacy',
    q: '개인정보는 안전한가요?',
    a: '[준법 검토 후 교체 예정 — 개인정보 처리 안내]',
  },
  {
    id: 'process',
    q: '상담은 어떻게 진행되나요?',
    a: '[준법 검토 후 교체 예정 — 상담 절차 안내]',
  },
] as const;

type QAId = (typeof QA)[number]['id'];
type Message = { from: 'bot' | 'user'; text: string };

const GREETING = '안녕하세요. 아래에서 궁금한 항목을 선택해주세요.';

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ from: 'bot', text: GREETING }]);
  const [answered, setAnswered] = useState<Set<QAId>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleQuestion(item: (typeof QA)[number]) {
    setAnswered((prev) => new Set([...prev, item.id]));
    setMessages((prev) => [...prev, { from: 'user', text: item.q }]);
    setTimeout(() => {
      setMessages((prev) => [...prev, { from: 'bot', text: item.a }]);
    }, 350);
  }

  function handleCTA() {
    setOpen(false);
    document.getElementById('consult-form')?.scrollIntoView({ behavior: 'smooth' });
  }

  const remaining = QA.filter((item) => !answered.has(item.id));

  return (
    <>
      {/* ── Chat window ── */}
      {open && (
        <div className="fixed bottom-20 right-4 z-50 flex w-80 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl sm:right-6 sm:w-88 max-h-[520px]">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between bg-[#1e3a5f] px-4 py-3">
            <span className="text-sm font-semibold text-white">KPARTNERS 상담 안내</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="닫기"
              className="text-white/60 transition hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <p
                  className={`max-w-[78%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                    msg.from === 'user'
                      ? 'bg-[#1e3a5f] text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.text}
                </p>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Buttons */}
          <div className="shrink-0 border-t border-gray-100 bg-gray-50 p-3 space-y-2">
            {remaining.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {remaining.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleQuestion(item)}
                    className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 transition hover:border-[#1e3a5f] hover:text-[#1e3a5f]"
                  >
                    {item.q}
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={handleCTA}
              className="w-full rounded bg-[#1e3a5f] py-2.5 text-sm font-semibold text-white transition hover:bg-[#162d4a]"
            >
              상담 신청하기 →
            </button>
          </div>
        </div>
      )}

      {/* ── Bubble button ── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? '채팅 닫기' : '채팅 열기'}
        className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#1e3a5f] shadow-lg transition hover:bg-[#162d4a] sm:right-6"
      >
        {open ? (
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
        )}
      </button>
    </>
  );
}
