import React from 'react';
import { useNavigate } from 'react-router-dom';

const mono = { fontFamily: "'Anonymous Pro', monospace" };

const NAV_ITEMS = [
  { icon: 'history', label: '최근 채팅내역' },
  { icon: 'bar_chart', label: '종합 데이터' },
  { icon: 'settings', label: '정보 설정' },
];

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="w-[260px] shrink-0 h-screen bg-white border-r border-[#e5e7eb] flex flex-col relative px-5">
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
        {NAV_ITEMS.map(({ icon, label }) => (
          <button
            key={label}
            className="flex items-center bg-[#f7f7f7]
                       border border-[rgba(183,186,196,0.45)] h-[40px] w-full
                       shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
                       overflow-hidden hover:bg-[#efefef] transition-colors px-[14px] gap-[10px]"
          >
            <span className="material-symbols-outlined text-[#161415]" style={{ fontSize: 16 }}>{icon}</span>
            <span style={{ ...mono, fontSize: 12, color: '#000' }} className="whitespace-nowrap">{label}</span>
          </button>
        ))}
      </nav>

      {/* 로그아웃 */}
      <div className="absolute bottom-6 left-5">
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
