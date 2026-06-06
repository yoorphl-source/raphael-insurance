'use server';

import { createServerSupabase } from '@/lib/supabase-server';

export type SubmitResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitLead(data: {
  name: string;
  phone: string;
  product: string;
  message: string;
  consent: boolean;
}): Promise<SubmitResult> {
  const supabase = createServerSupabase();

  const { error } = await supabase.from('leads').insert({
    name: data.name,
    phone: data.phone,
    product: data.product || null,
    message: data.message || null,
    consent: data.consent,
  });

  if (error) {
    console.error('[submitLead]', error.message);
    return { ok: false, error: '저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' };
  }

  return { ok: true };
}
