'use client';

import { useState, useTransition } from 'react';
import { submitLead } from '@/app/actions/submitLead';

const INSURANCE_OPTIONS = ['실손', '종신', '암', '자동차', '기타'] as const;

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

const PHONE_RE = /^010-\d{4}-\d{4}$/;

export default function ConsultForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [insurance, setInsurance] = useState('');
  const [inquiry, setInquiry] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);

  const [submitResult, setSubmitResult] = useState<'success' | 'error' | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isPending, startTransition] = useTransition();

  const phoneValid = PHONE_RE.test(phone);
  const canSubmit = name.trim() !== '' && phoneValid && agreed && !isPending;

  function handlePhoneChange(value: string) {
    setPhone(formatPhone(value));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    startTransition(async () => {
      const result = await submitLead({
        name: name.trim(),
        phone,
        product: insurance,
        message: inquiry.trim(),
        consent: agreed,
      });

      if (result.ok) {
        setSubmitResult('success');
      } else {
        setErrorMsg(result.error);
        setSubmitResult('error');
      }
    });
  }

  // ── Success state ──────────────────────────────────────────
  if (submitResult === 'success') {
    return (
      <section className="bg-[#0a1628] px-6 py-20">
        <div className="mx-auto max-w-lg text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/20 text-4xl">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-white">신청이 접수되었습니다</h2>
          <p className="mt-3 text-slate-400">
            영업일 기준 24시간 이내에 담당 컨설턴트가 연락드리겠습니다.
          </p>
        </div>
      </section>
    );
  }

  // ── Form ───────────────────────────────────────────────────
  return (
    <section id="consult-form" className="bg-[#0a1628] px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-lg">
        {/* Section header */}
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">무료 상담 신청</h2>
          <p className="mt-2 text-slate-400">
            아래 정보를 입력하시면 전문가가 빠르게 연락드립니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* 이름 */}
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-300">
              이름 <span className="text-blue-400">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              required
              className="w-full rounded-lg bg-white/5 px-4 py-3 text-white placeholder-slate-500 ring-1 ring-white/10 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 휴대폰 번호 */}
          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-slate-300">
              휴대폰 번호 <span className="text-blue-400">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              onBlur={() => setPhoneTouched(true)}
              placeholder="010-0000-0000"
              required
              className={`w-full rounded-lg bg-white/5 px-4 py-3 text-white placeholder-slate-500 ring-1 transition focus:outline-none focus:ring-2 ${
                phoneTouched && !phoneValid
                  ? 'ring-red-500 focus:ring-red-500'
                  : 'ring-white/10 focus:ring-blue-500'
              }`}
            />
            {phoneTouched && !phoneValid && (
              <p className="mt-1.5 text-xs text-red-400">010-0000-0000 형식으로 입력해주세요.</p>
            )}
          </div>

          {/* 관심 보험 */}
          <div>
            <label htmlFor="insurance" className="mb-1.5 block text-sm font-medium text-slate-300">
              관심 보험
            </label>
            <select
              id="insurance"
              value={insurance}
              onChange={(e) => setInsurance(e.target.value)}
              className="w-full rounded-lg bg-[#0f1e3c] px-4 py-3 text-white ring-1 ring-white/10 transition focus:outline-none focus:ring-2 focus:ring-blue-500 [&>option]:bg-[#0f1e3c]"
            >
              <option value="">선택 안 함</option>
              {INSURANCE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}보험
                </option>
              ))}
            </select>
          </div>

          {/* 문의 내용 */}
          <div>
            <label htmlFor="inquiry" className="mb-1.5 block text-sm font-medium text-slate-300">
              문의 내용{' '}
              <span className="text-xs font-normal text-slate-500">(선택)</span>
            </label>
            <textarea
              id="inquiry"
              value={inquiry}
              onChange={(e) => setInquiry(e.target.value)}
              rows={4}
              placeholder="궁금한 점이나 현재 상황을 자유롭게 적어주세요."
              className="w-full resize-none rounded-lg bg-white/5 px-4 py-3 text-white placeholder-slate-500 ring-1 ring-white/10 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 개인정보 동의 */}
          <div className="rounded-lg bg-white/5 p-4 ring-1 ring-white/10">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-blue-500"
              />
              <span className="text-sm text-slate-300">
                <span className="font-semibold text-white">[필수]</span> 개인정보 수집·이용에 동의합니다.
              </span>
              <button
                type="button"
                onClick={() => setPolicyOpen((v) => !v)}
                aria-expanded={policyOpen}
                className="ml-auto shrink-0 text-xs text-blue-400 underline underline-offset-2 hover:text-blue-300"
              >
                {policyOpen ? '접기' : '내용 보기'}
              </button>
            </label>
            {policyOpen && (
              <div className="mt-3 rounded-md bg-white/5 p-3 text-xs leading-relaxed text-slate-400">
                [준법 검토 후 교체 예정]
              </div>
            )}
          </div>

          {/* 서버 오류 메시지 */}
          {submitResult === 'error' && (
            <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400 ring-1 ring-red-500/30">
              {errorMsg}
            </p>
          )}

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-full py-4 text-base font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 disabled:cursor-not-allowed disabled:opacity-40 enabled:bg-blue-500 enabled:text-white enabled:shadow-lg enabled:shadow-blue-500/30 enabled:hover:bg-blue-400 enabled:active:scale-95"
          >
            {isPending ? '처리 중…' : '신청하기'}
          </button>
        </form>
      </div>
    </section>
  );
}
