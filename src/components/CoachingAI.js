import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import AiPanel from './AiPanel';
import PresetDropdown from './PresetDropdown';
import { AiAvatar, MessageBubble, UserBubble, TypingBubble } from './AiChatWidgets';
import WorkoutLogModal from './WorkoutLogModal';
import { postChat, getChatSessionDetail, ApiError } from '../api/client';
import {
  AI_BODY_PART, AI_BODY_PART_TO_MUSCLE_GROUP, MUSCLE_GROUP, labelOf, firstNumber,
} from '../api/enums';
import {
  mono, UPPER_BODY_OPTIONS, LOWER_BODY_OPTIONS, TIME_OPTIONS,
  CHAT_TYPE, buildPresetMessage, toSettings,
} from '../constants';

/* ─── 운동루틴 카드 ─── */
function RoutineCard({ routine, onLog }) {
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
                {/* AI가 내려주는 부위(9개 값). 라벨이 없는 값이면 원문을 그대로 보여준다 */}
                {ex.bodyPart && (
                  <span className="px-2 py-[2px] shrink-0"
                    style={{ ...mono, fontSize: 10, fontWeight: 700, background: '#ffd6d5', color: '#e2231a' }}>
                    {labelOf(AI_BODY_PART, ex.bodyPart) ?? ex.bodyPart}
                  </span>
                )}
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
              {/* 추천받은 운동을 수행 기록으로 남긴다. 세트/횟수는 '3~4세트'처럼 범위로 오므로
                  하한을 계획값으로 채워 넣고, 실제 수행 세트는 사용자가 모달에서 입력한다. */}
              <button
                onClick={() => onLog(ex)}
                className="flex items-center justify-center gap-1 border border-[#161415] h-[34px] hover:bg-[#f7f7f7] transition-colors"
                style={{ ...mono, fontSize: 11, fontWeight: 700, color: '#161415' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
                기록에 추가
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CoachingAI() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  // '기록에 추가'로 열리는 운동 기록 모달의 초기값 (null이면 닫힌 상태)
  const [logDraft, setLogDraft] = useState(null);
  const [logSaved, setLogSaved] = useState(false);

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

      postChat({ type: CHAT_TYPE.COACHING, message: null, sessionId: null, settings: null })
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
        type: CHAT_TYPE.COACHING,
        message,
        sessionId,
        // [프리셋 적용] 버튼을 눌렀을 때만 settings를 전송하고, 일반 메시지는 null로 보낸다.
        settings: settingsOverride ?? toSettings({ upperBody: null, lowerBody: null, duration: null }),
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

  /**
   * 추천받은 운동 하나를 수행 기록 입력으로 넘긴다.
   * AI의 부위(9개)를 workout_logs의 7개 값으로 변환해 모달의 부위 선택을 미리 맞춘다.
   * routineId는 세션 상세 응답에 루틴 id가 없어 보낼 수 없다 — 백엔드에 노출 요청 중이며,
   * 그때까지는 자유 입력으로 저장되고 부위는 프론트가 변환한 값이 쓰인다.
   */
  function openLogDraft(exercise) {
    const code = AI_BODY_PART_TO_MUSCLE_GROUP[exercise.bodyPart];
    setLogSaved(false);
    setLogDraft({
      exerciseName: exercise.name ?? '',
      muscleGroup: labelOf(MUSCLE_GROUP, code) ?? '가슴',
      plannedSets: firstNumber(exercise.sets) ?? '',
      reps: firstNumber(exercise.reps) ?? '',
    });
  }

  /** [프리셋 적용] 클릭 시 선택해둔 프리셋 전체를 백엔드로 전송 (별도 설정 API가 없어 /api/chat의 settings로 전달) */
  function applyPresets() {
    if (sending || loading || !hasPreset) return;
    const preset = { upperBody, lowerBody, duration };
    sendMessage(buildPresetMessage(preset), toSettings(preset));
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
                        <RoutineCard routine={msg.result?.routine} onLog={openLogDraft} />
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

      {logDraft && (
        <WorkoutLogModal
          initial={logDraft}
          onClose={() => setLogDraft(null)}
          onSaved={() => { setLogDraft(null); setLogSaved(true); }}
        />
      )}

      {/* 저장 후 알림 — 종합 데이터로 바로 넘어갈 수 있게 한다 */}
      {logSaved && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-[#161415] px-5 py-3">
          <span style={{ ...mono, fontSize: 12, color: '#fff' }}>운동 기록에 저장했습니다.</span>
          <button onClick={() => navigate('/dashboard')}
            style={{ ...mono, fontSize: 12, fontWeight: 700, color: '#ff8785' }}>
            종합 데이터 보기
          </button>
          <button onClick={() => setLogSaved(false)}
            className="material-symbols-outlined text-white" style={{ fontSize: 16 }}>close</button>
        </div>
      )}
    </div>
  );
}
