import { createClient } from '@supabase/supabase-js';

// 이 모듈은 서버 전용입니다. 'use client' 파일에서 import하면 빌드 오류가 납니다.
export function createServerSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    throw new Error('SUPABASE_URL 또는 SUPABASE_SECRET_KEY 환경 변수가 설정되지 않았습니다.');
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
