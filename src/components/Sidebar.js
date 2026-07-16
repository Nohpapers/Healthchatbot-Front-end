import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getChatSessions, ApiError } from '../api/client';

const mono = { fontFamily: "'Anonymous Pro', monospace" };

function typeFromPath(pathname) {
  if (pathname.startsWith('/nutrition')) return 'NUTRITION';
  return 'COACHING';
}

function formatDateTime(iso) {
  if (!iso) return '';
  return iso.slice(0, 10).replaceAll('-', '.');
}

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const type = typeFromPath(location.pathname);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!historyOpen) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    getChatSessions(type)
      .then((list) => !cancelled && setSessions(list))
      .catch((err) => !cancelled && setError(err instanceof ApiError ? err.message : '목록을 불러오지 못했습니다.'))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [historyOpen, type]);

  function goToSession(sessionId) {
    const path = type === 'NUTRITION' ? '/nutrition' : '/coaching';
    navigate(`${path}?sessionId=${sessionId}`);
  }

  return (
    <aside className="w-[260px] shrink-0 h-screen bg-white border-r border-[#e5e7eb] flex flex-col relative px-5 overflow-y-auto">
      {/* 로고 */}
      <div className="pt-8 pb-4">
        <img src="/logo.png" alt="APEXAI" className="w-[130px] object-contain" />
      </div>

      {/* 새 채팅시작 */}
      <button
        onClick={() => navigate('/chat')}
        className="w-full flex items-center justify-center gap-[10px] bg-[#161415]
                   border border-[#b7bac4] h-[45px]
                   shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
                   hover:opacity-80 transition-opacity"
        style={{ ...mono, fontSize: 13, color: '#fff', fontWeight: 700 }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chat</span>
        새 채팅시작
      </button>

      {/* 네비게이션 */}
      <nav className="mt-8 flex flex-col gap-3">
        <button
          onClick={() => setHistoryOpen((o) => !o)}
          className="flex items-center bg-[#f7f7f7]
                     border border-[rgba(183,186,196,0.45)] h-[40px] w-full
                     shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
                     overflow-hidden hover:bg-[#efefef] transition-colors px-[14px] gap-[10px]"
        >
          <span className="material-symbols-outlined text-[#161415]" style={{ fontSize: 16 }}>history</span>
          <span style={{ ...mono, fontSize: 12, color: '#000' }} className="whitespace-nowrap">최근 채팅내역</span>
          <span className="material-symbols-outlined text-[#161415] ml-auto" style={{ fontSize: 16 }}>
            {historyOpen ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {historyOpen && (
          <div className="flex flex-col gap-1 pl-2 max-h-[240px] overflow-y-auto">
            {loading && (
              <span style={{ ...mono, fontSize: 11, color: '#6b6f76' }}>불러오는 중...</span>
            )}
            {error && (
              <span style={{ ...mono, fontSize: 11, color: '#e2231a' }}>{error}</span>
            )}
            {!loading && !error && sessions.length === 0 && (
              <span style={{ ...mono, fontSize: 11, color: '#6b6f76' }}>채팅 기록이 없습니다.</span>
            )}
            {sessions.map((s) => (
              <button
                key={s.sessionId}
                onClick={() => goToSession(s.sessionId)}
                className="text-left px-2 py-2 hover:bg-[#f7f7f7] transition-colors border-b border-[#f0f0f0]"
              >
                <div className="truncate" style={{ ...mono, fontSize: 11, color: '#161415', fontWeight: 700 }}>
                  {s.title}
                </div>
                <div style={{ ...mono, fontSize: 9, color: '#b7bac4' }}>{formatDateTime(s.createdAt)}</div>
              </button>
            ))}
          </div>
        )}

        <button
          className="flex items-center bg-[#f7f7f7]
                     border border-[rgba(183,186,196,0.45)] h-[40px] w-full
                     shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
                     overflow-hidden hover:bg-[#efefef] transition-colors px-[14px] gap-[10px]"
        >
          <span className="material-symbols-outlined text-[#161415]" style={{ fontSize: 16 }}>bar_chart</span>
          <span style={{ ...mono, fontSize: 12, color: '#000' }} className="whitespace-nowrap">종합 데이터</span>
        </button>
        <button
          className="flex items-center bg-[#f7f7f7]
                     border border-[rgba(183,186,196,0.45)] h-[40px] w-full
                     shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
                     overflow-hidden hover:bg-[#efefef] transition-colors px-[14px] gap-[10px]"
        >
          <span className="material-symbols-outlined text-[#161415]" style={{ fontSize: 16 }}>settings</span>
          <span style={{ ...mono, fontSize: 12, color: '#000' }} className="whitespace-nowrap">정보 설정</span>
        </button>
        <button
          onClick={() => navigate('/api-test')}
          className="flex items-center bg-[#f7f7f7]
                     border border-[rgba(183,186,196,0.45)] h-[40px] w-full
                     shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
                     overflow-hidden hover:bg-[#efefef] transition-colors px-[14px] gap-[10px]"
        >
          <span className="material-symbols-outlined text-[#161415]" style={{ fontSize: 16 }}>terminal</span>
          <span style={{ ...mono, fontSize: 12, color: '#000' }} className="whitespace-nowrap">API 테스트</span>
        </button>
      </nav>

      {/* 로그아웃 */}
      <div className="pt-6 pb-6 mt-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 hover:opacity-70 transition-opacity"
          style={{ ...mono, fontSize: 12, color: '#ff1c1e' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>logout</span>
          로그아웃
        </button>
      </div>
    </aside>
  );
}
