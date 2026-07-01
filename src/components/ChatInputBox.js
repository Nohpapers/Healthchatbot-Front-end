import React, { useState } from 'react';

const mono = { fontFamily: "'Anonymous Pro', monospace" };

const DEFAULT_CHIPS = ['식사량 추천', '운동 추천', '건강루틴 추천', '러닝 루틴'];
const DEFAULT_ACTIONS = [
  { label: '상체',  icon: 'sports_gymnastics' },
  { label: '하체',  icon: 'accessibility_new'  },
  { label: '유산소', icon: 'directions_run'    },
];

/* onSend(text): 메시지 전송 콜백 / actions: 하단 버튼 커스텀 / chips: 칩 커스텀 / placeholder */
export default function ChatInputBox({
  onSend,
  actions = DEFAULT_ACTIONS,
  chips = DEFAULT_CHIPS,
  placeholder = '오늘의 루틴을 말씀해 주세요.',
}) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    onSend?.(input.trim());
    setInput('');
  };

  return (
    <div className="flex flex-col gap-[14px]">
      {/* 추천 칩 버튼 */}
      <div className="flex gap-[14px] flex-wrap items-center overflow-hidden" style={{ maxHeight: 36 }}>
        {chips.map((chip) => (
          <button
            key={chip}
            className="flex items-center justify-center gap-[10px] bg-white
                       border border-[#c8c8c8] h-[36px] px-[16px]
                       hover:bg-[#f5f5f5] transition-colors shrink-0"
            style={{ ...mono, fontSize: 13, color: '#000' }}
          >
            {chip}
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>close</span>
          </button>
        ))}
      </div>

      {/* 액션 버튼 */}
      <div className="grid gap-[20px]" style={{ gridTemplateColumns: `repeat(${actions.length}, 1fr)` }}>
        {actions.map(({ label, icon }) => (
          <button
            key={label}
            className="bg-[#161415] flex items-center justify-center gap-[14px]
                       h-[55px] hover:opacity-80 transition-opacity"
          >
            <span className="material-symbols-outlined text-white" style={{ fontSize: 24 }}>{icon}</span>
            <span className="text-white font-bold" style={{ ...mono, fontSize: 15 }}>{label}</span>
          </button>
        ))}
      </div>

      {/* 채팅 입력창 */}
      <div className="flex items-center bg-white" style={{ border: '1px solid #c8c8c8', height: 55 }}>
        <div className="flex-1 flex items-center px-4 overflow-hidden h-full">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={placeholder}
            className="w-full bg-transparent text-[#161415] outline-none
                       placeholder-[#b7bac4] overflow-hidden text-ellipsis"
            style={{ ...mono, fontSize: 14 }}
          />
        </div>
        <button
          onClick={handleSend}
          className="w-[55px] h-full flex items-center justify-center shrink-0
                     hover:opacity-70 transition-opacity"
        >
          <span className="material-symbols-outlined text-[#161415]" style={{ fontSize: 20 }}>send</span>
        </button>
      </div>
    </div>
  );
}
