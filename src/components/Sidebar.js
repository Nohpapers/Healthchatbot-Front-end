import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getChatSessions, ApiError } from '../api/client';
import { logout } from '../api/auth';
import { mono, CHAT_TYPE } from '../constants';

function typeFromPath(pathname) {
  if (pathname.startsWith('/nutrition')) return CHAT_TYPE.NUTRITION;
  return CHAT_TYPE.COACHING;
}

/** 프로필 설정 화면 내 섹션 (Profile.js의 섹션 id와 1:1) */
export const PROFILE_SECTIONS = [
  ['basic', '기본 프로필'],
  ['body', '신체 정보'],
  ['goal', '운동 목표'],
  ['pref', '운동 선호 설정'],
  ['ai', 'AI 맞춤 설정'],
  ['alarm', '알림 설정'],
  ['privacy', '개인정보 및 데이터'],
  ['account', '계정 및 보안'],
];

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

  // 페이지네이션 (api.md 3.3 — page 0부터, Page 응답)
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  // 탭(코칭/영양)을 바꾸거나 목록을 접으면 처음 페이지로 되돌린다
  useEffect(() => {
    setSessions([]);
    setPage(0);
    setHasNext(false);
  }, [type]);

  useEffect(() => {
    if (!historyOpen) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    getChatSessions(type, { page })
      .then((res) => {
        if (cancelled) return;
        // page 0은 교체, 그 이후는 이어붙이기 ("더보기")
        setSessions((prev) => (page === 0 ? res.items : [...prev, ...res.items]));
        setHasNext(res.hasNext);
      })
      .catch((err) => !cancelled && setError(err instanceof ApiError ? err.message : '목록을 불러오지 못했습니다.'))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [historyOpen, type, page]);

  function goToSession(sessionId) {
    const path = type === CHAT_TYPE.NUTRITION ? '/nutrition' : '/coaching';
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
            {hasNext && !loading && (
              <button
                onClick={() => setPage((p) => p + 1)}
                className="px-2 py-2 hover:bg-[#f7f7f7] transition-colors"
                style={{ ...mono, fontSize: 11, color: '#6b6f76', fontWeight: 700 }}
              >
                더보기
              </button>
            )}
          </div>
        )}

        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center bg-[#f7f7f7]
                     border border-[rgba(183,186,196,0.45)] h-[40px] w-full
                     shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
                     overflow-hidden hover:bg-[#efefef] transition-colors px-[14px] gap-[10px]"
        >
          <span className="material-symbols-outlined text-[#161415]" style={{ fontSize: 16 }}>bar_chart</span>
          <span style={{ ...mono, fontSize: 12, color: '#000' }} className="whitespace-nowrap">종합 데이터</span>
        </button>
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center bg-[#f7f7f7]
                     border border-[rgba(183,186,196,0.45)] h-[40px] w-full
                     shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
                     overflow-hidden hover:bg-[#efefef] transition-colors px-[14px] gap-[10px]"
        >
          <span className="material-symbols-outlined text-[#161415]" style={{ fontSize: 16 }}>settings</span>
          <span style={{ ...mono, fontSize: 12, color: '#000' }} className="whitespace-nowrap">프로필 설정</span>
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

      {/* 프로필 설정 화면에서만 노출되는 섹션 내비 */}
      {location.pathname === '/profile' && (
        <div className="mt-4 border border-[rgba(183,186,196,0.45)]">
          {PROFILE_SECTIONS.map(([id, label], idx) => (
            <button
              key={id}
              onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className={`w-full text-left px-[14px] py-[10px] hover:bg-[#f7f7f7] transition-colors
                         ${idx === 0 ? 'text-[#e2231a] bg-[#ffecec]' : 'text-[#161415]'}`}
              style={{ ...mono, fontSize: 12, borderBottom: idx < PROFILE_SECTIONS.length - 1 ? '1px solid #f0f0f0' : 'none' }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* 로그아웃 */}
      <div className="pt-6 pb-6 mt-auto">
        <button
          onClick={() => { logout(); navigate('/'); }}
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
