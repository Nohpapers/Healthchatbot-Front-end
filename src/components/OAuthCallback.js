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

    exchangeCode(code)
      .then(() => navigate('/chat', { replace: true }))
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
