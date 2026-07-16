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

/* ─── AI 응답 대기 중 표시 (동기 호출이라 최대 30초까지 걸릴 수 있음) ─── */
export function TypingBubble() {
  return (
    <div className="flex-1 border border-[#161415] px-5 py-3 flex items-center gap-2">
      <span className="flex gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[#161415] animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-[#161415] animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-[#161415] animate-bounce" style={{ animationDelay: '300ms' }} />
      </span>
      <p style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>답변을 작성하고 있습니다...</p>
    </div>
  );
}

