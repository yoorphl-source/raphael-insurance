'use server';

import { createServerSupabase } from '@/lib/supabase-server';

export type SubmitLandingResult = { ok: true } | { ok: false; error: string };

export async function submitLandingLead(data: {
  name: string;
  phone: string;
  birth: string | null;
  interests: string | null;
  message: string | null;
  source: string;
}): Promise<SubmitLandingResult> {
  const supabase = createServerSupabase();

  const { error } = await supabase.from('leads').insert({
    name: data.name,
    phone: data.phone,
    birth: data.birth,
    interests: data.interests,
    message: data.message,
    source: data.source,
  });

  if (error) {
    console.error('[submitLandingLead]', error.message);
    return { ok: false, error: '저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' };
  }

  return { ok: true };
}
