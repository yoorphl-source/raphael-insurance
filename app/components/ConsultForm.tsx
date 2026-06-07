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
  const [method, setMethod] = useState<'전화' | '채팅'>('전화');
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
        method,
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

  // ── Success ───────────────────────────────────────────────
  if (submitResult === 'success') {
    return (
      <section id="consult-form" className="border-b border-gray-100 bg-gray-50 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-lg text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#1e3a5f]/10">
            <svg className="h-5 w-5 text-[#1e3a5f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">신청이 접수되었습니다</h2>
          <p className="mt-2 text-sm text-gray-500">
            영업일 기준 24시간 이내에 담당 컨설턴트가 연락드리겠습니다.
          </p>
        </div>
      </section>
    );
  }

  // ── Form ─────────────────────────────────────────────────
  return (
    <section id="consult-form" className="border-b border-gray-100 bg-gray-50 px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-lg">
        <h2 className="mb-8 text-xl font-bold text-gray-900">무료 상담 신청</h2>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* 이름 */}
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
              이름 <span className="text-[#1e3a5f]">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              required
              className="w-full rounded border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]"
            />
          </div>

          {/* 휴대폰 */}
          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-gray-700">
              휴대폰 번호 <span className="text-[#1e3a5f]">*</span>
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
              className={`w-full rounded border bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:outline-none focus:ring-1 ${
                phoneTouched && !phoneValid
                  ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                  : 'border-gray-300 focus:border-[#1e3a5f] focus:ring-[#1e3a5f]'
              }`}
            />
            {phoneTouched && !phoneValid && (
              <p className="mt-1.5 text-xs text-red-500">010-0000-0000 형식으로 입력해주세요.</p>
            )}
          </div>

          {/* 관심 보험 */}
          <div>
            <label htmlFor="insurance" className="mb-1.5 block text-sm font-medium text-gray-700">
              관심 보험
            </label>
            <select
              id="insurance"
              value={insurance}
              onChange={(e) => setInsurance(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]"
            >
              <option value="">선택 안 함</option>
              {INSURANCE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}보험</option>
              ))}
            </select>
          </div>

          {/* 상담 방법 */}
          <div>
            <p className="mb-1.5 text-sm font-medium text-gray-700">
              상담 방법 <span className="text-[#1e3a5f]">*</span>
            </p>
            <div className="flex gap-3">
              {(['전화', '채팅'] as const).map((opt) => (
                <label
                  key={opt}
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded border py-2.5 text-sm font-medium transition ${
                    method === opt
                      ? 'border-[#1e3a5f] bg-[#1e3a5f] text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-[#1e3a5f] hover:text-[#1e3a5f]'
                  }`}
                >
                  <input
                    type="radio"
                    name="method"
                    value={opt}
                    checked={method === opt}
                    onChange={() => setMethod(opt)}
                    className="sr-only"
                  />
                  {opt === '전화' ? '📞 전화 상담' : '💬 채팅 상담'}
                </label>
              ))}
            </div>
          </div>

          {/* 문의 내용 */}
          <div>
            <label htmlFor="inquiry" className="mb-1.5 block text-sm font-medium text-gray-700">
              문의 내용{' '}
              <span className="text-xs font-normal text-gray-400">(선택)</span>
            </label>
            <textarea
              id="inquiry"
              value={inquiry}
              onChange={(e) => setInquiry(e.target.value)}
              rows={4}
              placeholder="궁금한 점이나 현재 상황을 자유롭게 적어주세요."
              className="w-full resize-none rounded border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]"
            />
          </div>

          {/* 개인정보 동의 */}
          <div className="rounded border border-gray-200 bg-white p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#1e3a5f]"
              />
              <span className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">[필수]</span>{' '}
                개인정보 수집·이용에 동의합니다.
              </span>
              <button
                type="button"
                onClick={() => setPolicyOpen((v) => !v)}
                aria-expanded={policyOpen}
                className="ml-auto shrink-0 text-xs text-[#1e3a5f] underline underline-offset-2 hover:opacity-70"
              >
                {policyOpen ? '접기' : '내용 보기'}
              </button>
            </label>
            {policyOpen && (
              <div className="mt-3 rounded bg-gray-50 p-3 text-xs leading-relaxed text-gray-500">
                [준법 검토 후 교체 예정]
              </div>
            )}
          </div>

          {/* 서버 오류 */}
          {submitResult === 'error' && (
            <p className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {errorMsg}
            </p>
          )}

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded bg-[#1e3a5f] py-3 text-sm font-semibold text-white transition hover:bg-[#162d4a] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isPending ? '처리 중…' : '신청하기'}
          </button>
        </form>
      </div>
    </section>
  );
}
