import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { exchangeCode } from '../api/auth';
import { mono } from '../constants';

/**
 * 백엔드가 로그인 성공 후 리다이렉트하는 착지점: /oauth/callback?code=xxx
 * code는 60초 TTL·1회용이라 진입 즉시 교환하고, StrictMode의 이펙트 이중 실행로
 * 같은 code가 두 번 교환되지 않게 ref로 가드한다 (두 번째 호출은 401).
 */
export default function OAuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [error, setError] = useState(null);
  const exchangedRef = useRef(false);

  useEffect(() => {
    if (exchangedRef.current) return;
    exchangedRef.current = true;

    const code = params.get('code');
    if (!code) {
      setError('로그인 코드가 없습니다. 다시 시도해 주세요.');
      return;
    }

    /* 원래는 프로필 완성 여부로 행선지를 갈랐다 (signup_profile_api_spec.md 2-1) —
     * profileCompleted=false면 /signup, 아니면 /chat.
     * 지금은 테스트 단계라 입력 데이터를 반복해서 고쳐야 하므로, 완성 여부와 무관하게
     * 항상 회원가입 화면으로 보낸다. 회원가입은 INSERT가 아니라 UPDATE이고 진입 시
     * 현재 값을 불러와 채우므로(Signup.js), 재로그인할 때마다 수정 화면이 된다.
     * 원복하려면 아래 destination을
     *   me && me.profileCompleted === false ? '/signup' : '/chat'
     * 로 되돌리면 된다. */
    exchangeCode(code)
      .then(() => {
        navigate('/signup', { replace: true });
      })
      .catch((err) => setError(err.message || '로그인에 실패했습니다.'));
  }, [params, navigate]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#f0f0f0]">
      <div className="flex flex-col items-center gap-4">
        <img src="/logo.png" alt="APEXAI" className="w-[120px] object-contain" />
        {error ? (
          <>
            <p style={{ ...mono, fontSize: 14, color: '#e2231a' }}>{error}</p>
            <button
              onClick={() => navigate('/', { replace: true })}
              className="bg-[#161415] text-white h-[42px] px-6 hover:opacity-80 transition-opacity"
              style={{ ...mono, fontSize: 13, fontWeight: 700 }}
            >
              로그인 화면으로
            </button>
          </>
        ) : (
          <p style={{ ...mono, fontSize: 14, color: '#6b6f76' }}>로그인 처리 중...</p>
        )}
      </div>
    </div>
  );
}
