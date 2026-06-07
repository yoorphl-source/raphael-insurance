'use server';

import { createServerSupabase } from '@/lib/supabase-server';

type ChatLeadData = {
  name: string;
  phone: string;
  gender: string;
  insuranceType: string;
  detail: Record<string, string>;
  birthdate: string;
};

export async function submitChatLead(data: ChatLeadData): Promise<void> {
  try {
    const supabase = createServerSupabase();
    const { error } = await supabase.from('leads').insert({
      name: data.name,
      phone: data.phone,
      gender: data.gender || null,
      insurance_type: data.insuranceType || null,
      detail: Object.keys(data.detail).length > 0 ? data.detail : null,
      birthdate: data.birthdate || null,
      consent: true,
    });
    if (error) console.error('[submitChatLead]', error.message);
  } catch (err) {
    console.error('[submitChatLead] unexpected error:', err);
  }
}
