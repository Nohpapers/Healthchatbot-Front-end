import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import AiPanel from './AiPanel';
import PresetDropdown from './PresetDropdown';
import { AiAvatar, MessageBubble, UserBubble, TypingBubble } from './AiChatWidgets';
import { postChat, getChatSessionDetail, ApiError } from '../api/client';

const mono = { fontFamily: "'Anonymous Pro', monospace" };

const UPPER_BODY_OPTIONS = ['이두·삼두', '가슴운동', '등 운동', '어깨운동', '코어 운동'];
const LOWER_BODY_OPTIONS = ['엉덩이', '허벅지', '종아리'];
const TIME_OPTIONS = ['30분', '60분', '90분', '120분', '150분', '180분'];
const DURATION_MINUTES = { '30분': 30, '60분': 60, '90분': 90, '120분': 120, '150분': 150, '180분': 180 };

/* ─── 운동루틴 카드 ─── */
function RoutineCard({ routine }) {
  if (!routine) return null;
  return (
    <div className="border border-[#b7bac4] p-4 mt-4">
      <h3 className="text-center font-bold" style={{ ...mono, fontSize: 16, color: '#161415' }}>
        {routine.title}
      </h3>

      <div className="flex flex-col gap-4 mt-3">
        {routine.exercises?.map((ex) => (
          <div key={ex.order} className="border border-[#161415] p-5 flex gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span
                  className="bg-[#e2231a] text-white rounded-full w-5 h-5 flex items-center justify-center font-bold shrink-0"
                  style={{ ...mono, fontSize: 11 }}
                >
                  {ex.order}
                </span>
                <span className="font-bold" style={{ ...mono, fontSize: 14, color: '#161415' }}>{ex.name}</span>
              </div>
              <p className="font-bold mt-3" style={{ ...mono, fontSize: 13, color: '#161415' }}>
                {ex.sets} | {ex.reps}
              </p>
              <p className="mt-2" style={{ ...mono, fontSize: 11, color: '#161415', lineHeight: 1.7 }}>
                {ex.description}
              </p>
            </div>

            <div className="w-[170px] shrink-0 flex flex-col gap-2">
              {ex.imageUrl ? (
                <img src={ex.imageUrl} alt={ex.name} className="w-full h-[140px] object-cover border border-[#e5e7eb]" />
              ) : (
                <div className="w-full h-[140px] bg-[#f2f2f2] border border-[#e5e7eb] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#b7bac4]" style={{ fontSize: 40 }}>
                    fitness_center
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CoachingAI() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  const [input, setInput] = useState('');
  const [upperBody, setUpperBody] = useState(null);
  const [lowerBody, setLowerBody] = useState(null);
  const [duration, setDuration] = useState(null);

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

      postChat({ type: 'COACHING', message: null, sessionId: null, settings: null })
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

  async function sendMessage(text, settingsOverride) {
    const message = text.trim();
    if (!message || sending) return;

    setSending(true);
    setMessages((prev) => [...prev, { role: 'USER', content: message, result: null }]);
    setInput('');

    try {
      const res = await postChat({
        type: 'COACHING',
        message,
        sessionId,
        // 프리셋 클릭 직후엔 state 반영 전이므로 호출부가 최신 설정을 직접 넘긴다
        settings: settingsOverride ?? {
          upperBody,
          lowerBody,
          durationMinutes: duration ? DURATION_MINUTES[duration] : null,
        },
      });
      setMessages((prev) => [...prev, { role: 'ASSISTANT', content: res.reply, result: res.result }]);
      if (!sessionId) setSearchParams({ sessionId: res.sessionId }, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '메시지를 보내지 못했습니다.');
    } finally {
      setSending(false);
    }
  }

  const hasPreset = Boolean(upperBody || lowerBody || duration);

  /** [프리셋 적용] 클릭 시 선택해둔 프리셋 전체를 백엔드로 전송 (별도 설정 API가 없어 /api/chat의 settings로 전달) */
  function applyPresets() {
    if (sending || loading || !hasPreset) return;

    const parts = [];
    if (upperBody) parts.push(`상체운동은 ${upperBody}`);
    if (lowerBody) parts.push(`하체운동은 ${lowerBody}`);
    if (duration) parts.push(`운동시간은 ${duration}`);
    const message = `${parts.join(', ')}(으)로 설정했어. 이 설정에 맞는 운동루틴을 추천해줘.`;

    sendMessage(message, {
      upperBody,
      lowerBody,
      durationMinutes: duration ? DURATION_MINUTES[duration] : null,
    });
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
                          <AiAvatar icon="smart_toy" tag="COACHING" />
                          <MessageBubble>{msg.content}</MessageBubble>
                        </div>
                        <RoutineCard routine={msg.result?.routine} />
                      </>
                    ) : (
                      <UserBubble>{msg.content}</UserBubble>
                    )}
                  </div>
                ))
              )}

              {sending && (
                <div className="flex gap-3 items-stretch mt-6">
                  <AiAvatar icon="smart_toy" tag="COACHING" />
                  <TypingBubble />
                </div>
              )}

              {error && (
                <p className="mt-4" style={{ ...mono, fontSize: 13, color: '#e2231a' }}>{error}</p>
              )}

              {/* 운동 부위 / 시간 프리셋 + 초기화 */}
              <div className="flex items-center gap-6 mt-6 flex-wrap">
                <PresetDropdown label="상체운동설정" options={UPPER_BODY_OPTIONS} width={200} value={upperBody} onChange={setUpperBody} />
                <PresetDropdown label="하체운동설정" options={LOWER_BODY_OPTIONS} width={190} value={lowerBody} onChange={setLowerBody} />
                <PresetDropdown label="시간설정" options={TIME_OPTIONS} width={160} value={duration} onChange={setDuration} />
                <button
                  type="button"
                  onClick={applyPresets}
                  disabled={sending || loading || !hasPreset}
                  className="border-2 border-[#161415] bg-white text-[#161415] h-[42px] px-5
                             hover:bg-[#161415] hover:text-white transition-colors
                             disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#161415]"
                  style={{ ...mono, fontSize: 13, fontWeight: 700 }}
                >
                  프리셋 적용
                </button>
                <button
                  type="button"
                  onClick={() => { setUpperBody(null); setLowerBody(null); setDuration(null); }}
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
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                  placeholder="오늘의 루틴을 말씀해 주세요."
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
