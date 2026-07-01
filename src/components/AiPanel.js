import React from 'react';
import { useNavigate } from 'react-router-dom';

const mono = { fontFamily: "'Anonymous Pro', monospace" };

const AI_ITEMS = [
  { label: '코칭AI', icon: 'psychology',     to: '/coaching'   },
  { label: '영양AI', icon: 'restaurant',     to: '/nutrition'  },
  { label: '운동AI', icon: 'fitness_center', to: '/workout'    },
];

/* activeAi: '코칭AI' | '영양AI' | '운동AI' | null */
export default function AiPanel({ activeAi = null }) {
  const navigate = useNavigate();
  return (
    <div className="w-[50px] shrink-0 flex flex-col gap-[15px] pt-[93px]">
      {AI_ITEMS.map(({ label, icon, to }) => {
        const isActive = activeAi === label;
        return (
          <button
            key={label}
            onClick={() => navigate(to)}
            className={`flex flex-col items-center justify-center gap-[10px]
                       h-[186px] w-full drop-shadow-[0px_4px_2px_rgba(0,0,0,0.25)]
                       transition-colors
                       ${isActive ? 'bg-[#ff1c1e]' : 'bg-[#f7f7f7] hover:bg-[#efefef]'}`}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 20, color: isActive ? '#fff' : '#161415' }}
            >
              {icon}
            </span>
            <span
              className="font-bold"
              style={{ ...mono, fontSize: 13, writingMode: 'vertical-rl', color: isActive ? '#fff' : '#161415' }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
