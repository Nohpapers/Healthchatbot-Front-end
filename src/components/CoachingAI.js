import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import AiPanel from './AiPanel';
import ChatInputBox from './ChatInputBox';

const mono = { fontFamily: "'Anonymous Pro', monospace" };

const INITIAL_MESSAGES = [
  {
    id: 1,
    role: 'ai',
    text: '안녕하세요! 저는 코칭AI입니다.\n지난 루틴을 기반하여 오늘은 상체 운동을 하시는 날입니다.\n식사량, 운동 강도, 컨디션 등을 말씀해 주시면 맞춤 코칭을 드리겠습니다.',
  },
];

function AiMessage({ text }) {
  return (
    <div className="flex items-start gap-3">
      <img src="/logo.png" alt="APEXAI" className="w-[32px] object-contain shrink-0 mt-1" />
      <div
        className="bg-white border border-[#e5e7eb] px-4 py-3 max-w-[600px]"
        style={{ ...mono, fontSize: 13, color: '#161415', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}
      >
        {text}
      </div>
    </div>
  );
}

function UserMessage({ text }) {
  return (
    <div className="flex justify-end">
      <div
        className="bg-[#161415] px-4 py-3 max-w-[500px]"
        style={{ ...mono, fontSize: 13, color: '#fff', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}
      >
        {text}
      </div>
    </div>
  );
}

export default function CoachingAI() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text) => {
    const userMsg = { id: Date.now(), role: 'user', text };
    const aiReply = {
      id: Date.now() + 1,
      role: 'ai',
      text: `"${text}"에 대한 코칭 답변입니다.\n현재 루틴을 기반으로 최적의 운동 방법을 안내해 드리겠습니다.`,
    };
    setMessages((prev) => [...prev, userMsg, aiReply]);
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden" style={{ minWidth: 1440 }}>
      {/* 좌측 사이드바 */}
      <Sidebar />

      {/* 중앙 콘텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 상단 여백 */}
        <div className="pt-[40px] px-[60px] shrink-0">
          <span className="font-bold" style={{ ...mono, fontSize: 16, color: '#161415' }}>
            코칭 AI
          </span>
        </div>

        {/* 채팅 메시지 영역 */}
        <div className="flex-1 overflow-y-auto px-[60px] py-[24px] flex flex-col gap-[20px]">
          {messages.map((msg) =>
            msg.role === 'ai'
              ? <AiMessage key={msg.id} text={msg.text} />
              : <UserMessage key={msg.id} text={msg.text} />
          )}
          <div ref={bottomRef} />
        </div>

        {/* 하단 채팅 입력박스 */}
        <div className="shrink-0 px-[60px] pb-[30px]">
          <ChatInputBox onSend={handleSend} />
        </div>
      </div>

      {/* 우측 AI 패널 — 코칭AI 활성(빨간불) */}
      <AiPanel activeAi="코칭AI" />
    </div>
  );
}
