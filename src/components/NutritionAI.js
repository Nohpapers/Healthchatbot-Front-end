import React, { useState } from 'react';
import Sidebar from './Sidebar';
import AiPanel from './AiPanel';
import { AiAvatar, MessageBubble, UserBubble, QuickReplyChip } from './AiChatWidgets';

const mono = { fontFamily: "'Anonymous Pro', monospace" };

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const MEAL_ITEMS = ['흰밥', '김치', '닭가슴살', '마늘무침'];
const MEAL_SLOTS = 3;

export default function NutritionAI() {
  const [input, setInput] = useState('');
  const [progressed, setProgressed] = useState(false);

  return (
    <div className="flex h-screen bg-white overflow-hidden" style={{ minWidth: 1100 }}>
      <Sidebar />

      <div className="flex-1 flex overflow-hidden pt-[70px]">
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="flex flex-col items-center w-full px-8">
            <div className="w-full max-w-[900px] flex flex-col pb-8">

              {/* AI 메시지 1 */}
              <div className="flex gap-3 items-stretch">
                <AiAvatar icon="restaurant" tag="NUTRITION" />
                <MessageBubble>
                  안녕하세요! OOO님! 오늘의 식단을 선택해주세요. 스타일에 맞는 맞춤형 식단을 추천해드리겠습니다.
                  지난 식단을 보아 균형 잡힌 식단으로 진행하시는 것을 추천드립니다. 관련된 7일 식단표를 만들까요?
                </MessageBubble>
              </div>
              {progressed ? (
                <UserBubble>진행시켜</UserBubble>
              ) : (
                <QuickReplyChip label="진행시켜" onClick={() => setProgressed(true)} />
              )}

              {progressed && (
                <>
                  {/* AI 메시지 2 */}
                  <div className="flex gap-3 items-stretch mt-6">
                    <AiAvatar icon="restaurant" tag="NUTRITION" />
                    <MessageBubble>
                      말씀하신대로 7일 식단표를 추천하여 제작하겠습니다.
                    </MessageBubble>
                  </div>

                  {/* 식단표 카드 */}
                  <div className="border border-[#b7bac4] p-4 mt-4">
                    <h3 className="text-center font-bold" style={{ ...mono, fontSize: 16, color: '#161415' }}>
                      NUTRITION AI 식단표
                    </h3>

                    <div className="border border-[#161415] mt-3 flex">
                      {/* 요일별 식단 테이블 */}
                      <div className="flex-1 grid grid-cols-7">
                        {DAYS.map((day) => (
                          <div key={day} className="border-r border-[#e5e7eb] last:border-r-0 flex flex-col">
                            <div
                              className={`flex items-center justify-center py-2 font-bold
                                         ${day === 'SAT' ? 'bg-[#e2231a] text-white' : 'bg-[#161415] text-white'}`}
                              style={{ ...mono, fontSize: 11 }}
                            >
                              {day}
                            </div>
                            {Array.from({ length: MEAL_SLOTS }).map((_, i) => (
                              <div
                                key={i}
                                className="flex flex-col items-center justify-center gap-[3px] py-3 border-b border-[#e5e7eb] last:border-b-0"
                              >
                                {MEAL_ITEMS.map((item) => (
                                  <span key={item} style={{ ...mono, fontSize: 9, color: '#161415' }}>{item}</span>
                                ))}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>

                      {/* 오른쪽: 식단표 라벨 + 로고 */}
                      <div className="w-[60px] shrink-0 bg-[#161415] flex flex-col items-center">
                        <div className="flex-1 flex items-center justify-center">
                          <span
                            className="font-bold text-white whitespace-nowrap"
                            style={{ ...mono, fontSize: 13, writingMode: 'vertical-rl' }}
                          >
                            식단표
                          </span>
                        </div>
                        <div className="w-full bg-black flex flex-col items-center justify-center gap-1 py-3">
                          <div
                            className="relative border border-[#b7bac4] flex items-center justify-center"
                            style={{ width: 32, height: 32 }}
                          >
                            <span className="font-bold text-white" style={{ ...mono, fontSize: 16 }}> A</span>
                            <div className="absolute top-0 right-0 w-1 h-1 bg-[#b7bac4] rounded-full -translate-y-0.5 translate-x-0.5" />
                          </div>
                          <span className="tracking-[0.15em] text-[#b7bac4]" style={{ ...mono, fontSize: 6 }}>APEXAI</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* 식단표 제작 / 수정 + 초기화 */}
              <div className="flex items-center gap-6 mt-6 flex-wrap">
                <button
                  type="button"
                  className="border border-[#161415] bg-white h-[42px] px-6 hover:bg-[#f7f7f7] transition-colors"
                  style={{ ...mono, fontSize: 14, color: '#161415', fontWeight: 700 }}
                >
                  7일 식단표 제작
                </button>
                <button
                  type="button"
                  className="border border-[#161415] bg-white h-[42px] px-6 hover:bg-[#f7f7f7] transition-colors"
                  style={{ ...mono, fontSize: 14, color: '#161415', fontWeight: 700 }}
                >
                  식단표 수정
                </button>
                <button
                  type="button"
                  className="ml-auto bg-[#161415] text-white h-[42px] px-5 hover:opacity-80 transition-opacity"
                  style={{ ...mono, fontSize: 13, fontWeight: 700 }}
                >
                  설정 초기화
                </button>
              </div>

              {/* 채팅 입력창 */}
              <div className="flex items-center border-2 border-[#161415] mt-6" style={{ height: 52 }}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="오늘의 루틴을 말씀해 주세요."
                  className="flex-1 h-full bg-transparent text-[#161415] outline-none px-4 placeholder-[#161415]/40"
                  style={{ ...mono, fontSize: 15 }}
                />
                <button
                  className="w-[52px] h-full flex items-center justify-center shrink-0 border-l-2 border-[#161415]
                             hover:bg-[#f7f7f7] transition-colors"
                >
                  <span className="material-symbols-outlined text-[#161415]" style={{ fontSize: 20 }}>send</span>
                </button>
              </div>

            </div>
          </div>
        </div>

        <AiPanel />
      </div>
    </div>
  );
}
