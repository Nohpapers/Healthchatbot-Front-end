import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const mono = { fontFamily: "'Anonymous Pro', monospace" };

const ITEMS = [
  { label: '코칭 A I', icon: 'psychology', to: '/coaching' },
  { label: '영양 A I', icon: 'restaurant', to: '/nutrition' },
];

export default function AiPanel() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="w-[60px] shrink-0 flex flex-col items-end justify-start gap-4 pt-8">
      {ITEMS.map(({ label, icon, to }) => {
        const active = to && location.pathname === to;
        return (
          <button
            key={label}
            onClick={() => to && navigate(to)}
            className={`flex flex-col items-center justify-center gap-2 h-[95px] w-[50px] border
                       shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)] transition-colors
                       ${active
                         ? 'bg-[#ff3b30] border-[#ff3b30]'
                         : 'bg-white border-[rgba(183,186,196,0.45)] hover:bg-[#f7f7f7]'}`}
          >
            <span
              className={`material-symbols-outlined ${active ? 'text-white' : 'text-[#161415]'}`}
              style={{ fontSize: 18 }}
            >
              {icon}
            </span>
            <span
              className={`font-bold whitespace-nowrap ${active ? 'text-white' : 'text-[#161415]'}`}
              style={{ ...mono, fontSize: 12, writingMode: 'vertical-rl' }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
