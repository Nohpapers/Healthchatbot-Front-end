import React from 'react';

const mono = { fontFamily: "'Anonymous Pro', monospace" };

/* ─── AI 아바타 (코칭/영양 공용) ─── */
export function AiAvatar({ icon, tag }) {
  return (
    <div className="border border-[#161415] w-[66px] h-[66px] shrink-0 flex flex-col items-center justify-center gap-1">
      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ ...mono, fontSize: 9, fontWeight: 700 }}>AI</span>
      <span style={{ ...mono, fontSize: 7, letterSpacing: '0.05em', color: '#6b6f76' }}>{tag}</span>
    </div>
  );
}

/* ─── AI 말풍선 ─── */
export function MessageBubble({ children }) {
  return (
    <div className="flex-1 border border-[#161415] px-5 py-3 flex items-center">
      <p style={{ ...mono, fontSize: 13, color: '#161415', lineHeight: 1.6 }}>{children}</p>
    </div>
  );
}

/* ─── 사용자 말풍선 ─── */
export function UserBubble({ children }) {
  return (
    <div className="flex justify-end mt-2">
      <div className="bg-[#161415] text-white px-5 py-3 max-w-[70%]" style={{ ...mono, fontSize: 13, lineHeight: 1.6 }}>
        {children}
      </div>
    </div>
  );
}

/* ─── 빠른 답장 칩 (클릭 시 사용자 메시지로 전송) ─── */
export function QuickReplyChip({ label, onClick }) {
  return (
    <div className="flex justify-end mt-2">
      <button
        type="button"
        onClick={onClick}
        className="border border-[#161415] bg-white text-[#161415] px-5 h-[36px]
                   hover:bg-[#161415] hover:text-white transition-colors"
        style={{ ...mono, fontSize: 13, fontWeight: 700 }}
      >
        {label}
      </button>
    </div>
  );
}
