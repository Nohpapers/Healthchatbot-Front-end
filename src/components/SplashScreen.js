import React from 'react';
import { loginWith } from '../api/auth';

function GoogleIcon() {
  return (
    <svg className="mr-3 h-5 w-5 shrink-0" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function KakaoIcon() {
  return (
    <svg className="mr-3 h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.558 1.707 4.8 4.315 6.091l-.81 2.962c-.06.223.076.45.286.495.064.014.129.006.186-.022l3.491-2.31c.176.014.354.022.532.022 4.97 0 9-3.185 9-7.115S16.97 3 12 3z" />
    </svg>
  );
}

export default function SplashScreen() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#f0f0f0]">
      <div className="flex w-[360px] flex-col items-center gap-6">

        {/* 로고 */}
        <img
          src="/logo.png"
          alt="APEXAI"
          className="w-[160px] object-contain"
        />

        {/* 버튼 영역 */}
        <div className="flex w-full flex-col gap-3 mt-4">
          {/* Google */}
          <button
            type="button"
            onClick={() => loginWith('google')}
            className="flex w-full items-center justify-center rounded-full border border-[#dadce0] bg-white px-6 py-3 text-sm font-medium text-[#3c4043] shadow-sm hover:bg-gray-50 transition-colors"
          >
            <GoogleIcon />
            Google로 계속하기
          </button>

          {/* 카카오 */}
          <button
            type="button"
            onClick={() => loginWith('kakao')}
            className="flex w-full items-center justify-center rounded-full bg-[#FEE500] px-6 py-3 text-sm font-medium text-[#191919] hover:bg-[#f5dc00] transition-colors"
          >
            <KakaoIcon />
            카카오톡으로 계속하기
          </button>
        </div>

      </div>
    </div>
  );
}
