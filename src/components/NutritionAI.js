import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import AiPanel from './AiPanel';
import { AiAvatar, MessageBubble, UserBubble, TypingBubble } from './AiChatWidgets';
import { postChat, getChatSessionDetail, ApiError } from '../api/client';
import { mono, DAYS, MEAL_SLOTS, CHAT_TYPE } from '../constants';

/* ─── 식단표 카드 ─── */
function MealPlanCard({ mealPlan }) {
  if (!mealPlan) return null;
  const dayByName = Object.fromEntries((mealPlan.days || []).map((d) => [d.dayOfWeek, d]));

  return (
    <div className="border border-[#b7bac4] p-4 mt-4">
      <h3 className="text-center font-bold" style={{ ...mono, fontSize: 16, color: '#161415' }}>
        {mealPlan.title}
      </h3>

      <div className="border border-[#161415] mt-3 flex">
        <div className="flex-1 grid grid-cols-7">
          {DAYS.map((day) => {
            const meals = dayByName[day]?.meals || [];
            const mealBySlot = Object.fromEntries(meals.map((m) => [m.slot, m]));
            return (
              <div key={day} className="border-r border-[#e5e7eb] last:border-r-0 flex flex-col">
                <div
                  className={`flex items-center justify-center py-2 font-bold
                             ${day === 'SAT' ? 'bg-[#e2231a] text-white' : 'bg-[#161415] text-white'}`}
                  style={{ ...mono, fontSize: 11 }}
                >
                  {day}
                </div>
                {MEAL_SLOTS.map((slot) => {
                  const meal = mealBySlot[slot];
                  return (
                    <div
                      key={slot}
                      className="flex flex-col items-center justify-center gap-[3px] py-3 border-b border-[#e5e7eb] last:border-b-0"
                    >
                      {meal ? (
                        <>
                          <span style={{ ...mono, fontSize: 9, color: '#161415', fontWeight: 700 }}>{meal.menu}</span>
                          <span style={{ ...mono, fontSize: 8, color: '#6b6f76' }}>{meal.calories}kcal</span>
                        </>
                      ) : (
                        <span style={{ ...mono, fontSize: 9, color: '#b7bac4' }}>-</span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

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
  );
}

export default function NutritionAI() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState('');

  // React.StrictMode(개발 모드)가 마운트 이펙트를 두 번 실행해서, 이 가드가 없으면
  // 인사말 요청이 두 번 나가 세션이 중복 생성된다.
  const greetingRequestedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    if (sessionId) {
      getChatSessionDetail(sessionId)
        .then((detail) => !cancelled && setMessages(detail.messages))
        .catch((err) => !cancelled && setError(err instanceof ApiError ? err.message : '대화를 불러오지 못했습니다.'))
        .finally(() => !cancelled && setLoading(false));
    } else if (!greetingRequestedRef.current) {
      // ref로 중복 실행을 막기 때문에 이 요청은 실제로 딱 한 번만 나간다.
      // (StrictMode의 mount→cleanup→mount 시뮬레이션에서 cleanup이 cancelled를 앞서 true로
      // 바꿔버리면 유일한 응답까지 버려지므로, 여기서는 cancelled를 확인하지 않는다.)
      greetingRequestedRef.current = true;

      postChat({ type: CHAT_TYPE.NUTRITION, message: null, sessionId: null, settings: null })
        .then((res) => {
          setMessages([{ role: 'ASSISTANT', content: res.reply, result: res.result }]);
          setSearchParams({ sessionId: res.sessionId }, { replace: true });
        })
        .catch((err) => {
          setError(err instanceof ApiError ? err.message : '인사말을 불러오지 못했습니다.');
          greetingRequestedRef.current = false;
        })
        .finally(() => setLoading(false));
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  async function sendMessage(text) {
    const message = text.trim();
    if (!message || sending) return;

    setSending(true);
    setMessages((prev) => [...prev, { role: 'USER', content: message, result: null }]);
    setInput('');

    try {
      const res = await postChat({ type: CHAT_TYPE.NUTRITION, message, sessionId, settings: null });
      setMessages((prev) => [...prev, { role: 'ASSISTANT', content: res.reply, result: res.result }]);
      if (!sessionId) setSearchParams({ sessionId: res.sessionId }, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '메시지를 보내지 못했습니다.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden" style={{ minWidth: 1100 }}>
      <Sidebar />

      <div className="flex-1 flex overflow-hidden pt-[70px]">
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="flex flex-col items-center w-full px-8">
            <div className="w-full max-w-[900px] flex flex-col pb-8">

              {loading ? (
                <p style={{ ...mono, fontSize: 14, color: '#6b6f76' }}>불러오는 중...</p>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={i > 0 ? 'mt-6' : ''}>
                    {msg.role === 'ASSISTANT' ? (
                      <>
                        <div className="flex gap-3 items-stretch">
                          <AiAvatar icon="restaurant" tag="NUTRITION" />
                          <MessageBubble>{msg.content}</MessageBubble>
                        </div>
                        <MealPlanCard mealPlan={msg.result?.mealPlan} />
                      </>
                    ) : (
                      <UserBubble>{msg.content}</UserBubble>
                    )}
                  </div>
                ))
              )}

              {sending && (
                <div className="flex gap-3 items-stretch mt-6">
                  <AiAvatar icon="restaurant" tag="NUTRITION" />
                  <TypingBubble />
                </div>
              )}

              {error && (
                <p className="mt-4" style={{ ...mono, fontSize: 13, color: '#e2231a' }}>{error}</p>
              )}

              {/* 식단표 제작 / 수정 — 백엔드 엔드포인트 미확정 (api.md 5장) */}
              <div className="flex items-center gap-6 mt-6 flex-wrap">
                <button
                  type="button"
                  disabled
                  title="아직 지원되지 않는 기능입니다."
                  className="border border-[#b7bac4] bg-white h-[42px] px-6 opacity-40 cursor-not-allowed"
                  style={{ ...mono, fontSize: 14, color: '#161415', fontWeight: 700 }}
                >
                  7일 식단표 제작
                </button>
                <button
                  type="button"
                  disabled
                  title="아직 지원되지 않는 기능입니다."
                  className="border border-[#b7bac4] bg-white h-[42px] px-6 opacity-40 cursor-not-allowed"
                  style={{ ...mono, fontSize: 14, color: '#161415', fontWeight: 700 }}
                >
                  식단표 수정
                </button>
              </div>

              {/* 채팅 입력창 */}
              <div className="flex items-center border-2 border-[#161415] mt-6" style={{ height: 52 }}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                  placeholder="오늘의 식단을 말씀해 주세요."
                  disabled={sending || loading}
                  className="flex-1 h-full bg-transparent text-[#161415] outline-none px-4 placeholder-[#161415]/40"
                  style={{ ...mono, fontSize: 15 }}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={sending || loading}
                  className="w-[52px] h-full flex items-center justify-center shrink-0 border-l-2 border-[#161415]
                             hover:bg-[#f7f7f7] transition-colors disabled:opacity-40"
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
