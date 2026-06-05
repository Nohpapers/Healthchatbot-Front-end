import React from 'react';
import { useNavigate } from 'react-router-dom';

function GoogleIcon() {
  return (
    <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function KakaoIcon() {
  return (
    <svg className="mr-3 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.558 1.707 4.8 4.315 6.091l-.81 2.962c-.06.223.076.45.286.495.064.014.129.006.186-.022l3.491-2.31c.176.014.354.022.532.022 4.97 0 9-3.185 9-7.115S16.97 3 12 3z" />
    </svg>
  );
}

/**
 * HealthAI splash / login screen.
 * 세 개의 로그인 버튼은 모두 채팅 시작 페이지(/chat)로 이동합니다.
 */
function SplashScreen() {
  const navigate = useNavigate();
  const goToChat = () => navigate('/chat');

  return (
    <div className="relative flex h-screen min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0e101e]">
      {/* Subtle gradient background element for depth */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-[#1a1c2e]/80 to-[#0e101e]" />

      <div
        className="z-10 flex w-full max-w-sm flex-col items-center justify-center space-y-lg px-gutter text-center"
        style={{ minHeight: '100vh', paddingTop: '48px', paddingBottom: '48px' }}
      >
        {/* Logo mark with heartbeat + EKG ripple */}
        <div className="relative flex h-24 w-24 animate-heartbeat items-center justify-center">
          <div
            className="absolute inset-0 animate-ekg-ripple rounded-full border-2 border-on-primary/30"
            style={{ animationDelay: '0s' }}
          />
          <div
            className="absolute inset-0 animate-ekg-ripple rounded-full border-2 border-on-primary/30"
            style={{ animationDelay: '0.6s' }}
          />
          <span
            className="material-symbols-outlined z-10 text-[64px] text-on-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            health_and_safety
          </span>
        </div>

        {/* Brand name */}
        <div className="flex flex-col items-center space-y-base">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile tracking-tight text-on-primary md:font-headline-lg md:text-headline-lg">
            HealthAI
          </h1>
          <p className="font-label-md text-label-md uppercase tracking-widest text-on-primary/60">
            Clinical Precision
          </p>
        </div>

        {/* Action / loading area */}
        <div className="mt-lg flex w-full flex-col items-center space-y-lg">
          {/* Social login buttons */}
          <div className="flex w-full flex-col space-y-md">
            <button
              type="button"
              onClick={goToChat}
              className="flex w-full items-center justify-center rounded-full border border-[#dadce0] bg-white px-6 py-3 font-body-md text-body-md font-medium text-[#3c4043] transition-transform hover:scale-[0.98] active:scale-95"
            >
              <GoogleIcon />
              Google로 계속하기
            </button>
            <button
              type="button"
              onClick={goToChat}
              className="flex w-full items-center justify-center rounded-full bg-[#FEE500] px-6 py-3 font-body-md text-body-md font-medium text-[#191919] transition-transform hover:scale-[0.98] active:scale-95"
            >
              <KakaoIcon />
              카카오톡으로 계속하기
            </button>
          </div>

          {/* Divider */}
          <div className="flex w-full items-center space-x-4 opacity-40">
            <div className="h-px flex-grow bg-on-primary" />
            <span className="font-label-sm text-label-sm text-on-primary">또는</span>
            <div className="h-px flex-grow bg-on-primary" />
          </div>

          {/* Email / ID login button */}
          <button
            type="button"
            onClick={goToChat}
            className="w-full rounded-full border border-on-primary/20 bg-[#0e101e] px-6 py-3 font-body-md text-body-md font-medium text-on-primary transition-all hover:scale-[0.98] hover:bg-[#1a1c2e] active:scale-95"
          >
            아이디로 로그인
          </button>
        </div>
      </div>

      {/* Bottom subtle version text */}
      <div className="absolute bottom-margin-mobile z-10 w-full text-center md:bottom-margin-desktop">
        <p className="font-label-sm text-label-sm text-on-primary/40">
          v 2.4.1 — ENTERPRISE EDITION
        </p>
      </div>
    </div>
  );
}

export default SplashScreen;
