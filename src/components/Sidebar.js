import React from 'react';
import { useNavigate } from 'react-router-dom';

const mono = { fontFamily: "'Anonymous Pro', monospace" };

const imgIconHistory = 'https://www.figma.com/api/mcp/asset/a1fe8fc5-1bd2-46a8-b33f-d77c0b2ac65f';
const imgIconData    = 'https://www.figma.com/api/mcp/asset/73431efc-ac3a-49a7-9083-6415102890ee';
const imgIconProfile = 'https://www.figma.com/api/mcp/asset/0fcff7bc-86a2-4d45-b928-77a81bacf2d2';
const imgIconSet     = 'https://www.figma.com/api/mcp/asset/73846766-ffee-4ebc-be45-4241f6c275dd';
const imgIconLogout  = 'https://www.figma.com/api/mcp/asset/cc3778f0-722f-4175-8682-5ac385b859a9';

const NAV_ITEMS = [
  { img: imgIconHistory, label: '최근 채팅내역', to: '/history'  },
  { img: imgIconData,    label: '종합 데이터',   to: '/insights' },
  { img: imgIconProfile, label: '개인 프로필',   to: '/settings' },
  { img: imgIconSet,     label: '정보 설정',     to: '/settings' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  return (
    <aside className="w-[220px] shrink-0 h-screen bg-white border-r border-[#e5e7eb] flex flex-col relative">
      {/* 로고 */}
      <div className="flex justify-start px-[20px] pt-[30px] pb-4">
        <img src="/logo.png" alt="APEXAI" style={{ width: 90 }} className="object-contain" />
      </div>

      {/* 새 채팅시작 */}
      <div className="px-[20px] mt-2">
        <button
          onClick={() => navigate('/chat')}
          className="w-full flex items-center justify-center gap-[10px] bg-[#161415]
                     border border-[#b7bac4] h-[45px]
                     shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
                     hover:opacity-80 transition-opacity"
          style={{ ...mono, fontSize: 13, color: '#fff' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chat</span>
          새 채팅시작
        </button>
      </div>

      {/* 네비게이션 */}
      <nav className="px-[20px] mt-[40px] flex flex-col gap-[12px]">
        {NAV_ITEMS.map(({ img, label, to }) => (
          <button
            key={label}
            onClick={() => navigate(to)}
            className="flex items-center bg-[#f7f7f7]
                       border border-[rgba(183,186,196,0.45)] h-[40px] w-full
                       shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
                       overflow-hidden hover:bg-[#efefef] transition-colors px-[14px]"
            style={{ gap: '10px' }}
          >
            <img src={img} alt="" className="w-[16px] h-[16px] object-contain shrink-0" />
            <span style={{ ...mono, fontSize: 12, color: '#000' }} className="whitespace-nowrap">{label}</span>
          </button>
        ))}
      </nav>

      {/* 로그아웃 */}
      <div className="absolute bottom-6 left-0 right-0 px-[20px]">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 hover:opacity-70 transition-opacity"
          style={{ ...mono, fontSize: 12, color: '#ff1c1e' }}
        >
          <img src={imgIconLogout} alt="" className="w-[14px] h-[14px] object-contain" />
          로그아웃
        </button>
      </div>
    </aside>
  );
}
