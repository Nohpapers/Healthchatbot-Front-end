import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import AiPanel from './AiPanel';
import PresetDropdown from './PresetDropdown';
import { getInbodyRecent, postChat, ApiError } from '../api/client';
import {
  mono, UPPER_BODY_OPTIONS, LOWER_BODY_OPTIONS, TIME_OPTIONS,
  CHAT_TYPE, buildPresetMessage, toSettings,
} from '../constants';

const BAR_HEIGHTS = [40, 65, 35, 70, 45, 55, 28];

function formatDate(dateStr) {
  return dateStr ? dateStr.replaceAll('-', '.') : '--';
}

/** AI 인사말 reply를 큰 제목 / 작은 설명 두 줄로 나눈다 (형식은 보장되지 않으므로 첫 문장 기준 분리) */
function splitGreeting(reply) {
  if (!reply) return { title: '', subtitle: '' };
  const idx = reply.indexOf('. ');
  if (idx === -1) return { title: reply, subtitle: '' };
  return { title: reply.slice(0, idx + 1), subtitle: reply.slice(idx + 2) };
}

/* ─── 막대 그래프 (이력 데이터 API가 없어 시각적 참고용) ─── */
function BarGraph() {
  return (
    <div className="flex-1 relative border border-[#b7bac4] px-1 py-1 h-[88px]">
      <div className="absolute inset-1 flex flex-col justify-between pointer-events-none">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="border-t border-[#ececec]" />
        ))}
      </div>
      <div className="relative flex items-end justify-around h-full gap-[2px]">
        {BAR_HEIGHTS.map((h, i) => (
          <div key={i} className="flex flex-col items-center justify-end h-full">
            <div className="bg-[#4b4e59] w-[10px]" style={{ height: `${h}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── 인바디 한 행 ─── */
function InbodyRow({ label, value }) {
  return (
    <div className="flex gap-3 items-stretch">
      <div className="bg-[#161415] flex flex-col items-center justify-center gap-1 px-2 h-[88px] w-[125px] shrink-0">
        <span
          className="text-center leading-tight whitespace-nowrap"
          style={{ ...mono, fontSize: 10, fontWeight: 700, color: '#e5e7eb' }}
        >
          {label}
        </span>
        <span style={{ ...mono, fontSize: 19, fontWeight: 700, color: '#fff' }}>{value}</span>
        <div className="border border-[#b7bac4] rounded-full px-2 py-[1px]">
          <span style={{ ...mono, fontSize: 9, fontWeight: 700, color: '#fff' }}>표준</span>
        </div>
      </div>
      <BarGraph />
    </div>
  );
}

/* ─── 인바디 기록 없음 ─── */
function NoInbodyData() {
  return (
    <div className="border border-[#b7bac4] px-[14px] py-[9px] flex items-center justify-center" style={{ height: 132 }}>
      <span style={{ ...mono, fontSize: 13, color: '#6b6f76' }}>
        아직 등록된 인바디 기록이 없습니다.
      </span>
    </div>
  );
}

/* ─── 메인 화면 ─── */
export default function ChatStart() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const [upperBody, setUpperBody] = useState(null);
  const [lowerBody, setLowerBody] = useState(null);
  const [duration, setDuration] = useState(null);

  const [sessionId, setSessionId] = useState(null);
  const [greeting, setGreeting] = useState({ title: '', subtitle: '' });
  const [greetingLoading, setGreetingLoading] = useState(true);
  const [greetingError, setGreetingError] = useState(null);

  const [inbody, setInbody] = useState(null);
  const [inbodyLoading, setInbodyLoading] = useState(true);
  const [inbodyError, setInbodyError] = useState(null);

  // React.StrictMode(개발 모드)가 마운트 이펙트를 두 번 실행해서, 이 가드가 없으면
  // 인사말 요청이 두 번 나가 세션이 중복 생성된다.
  const greetingRequestedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    // ref로 중복 실행을 막기 때문에 이 요청은 실제로 딱 한 번만 나간다.
    // (StrictMode의 mount→cleanup→mount 시뮬레이션에서 cleanup이 cancelled를 앞서 true로
    // 바꿔버리면 유일한 응답까지 버려지므로, 여기서는 cancelled를 확인하지 않는다.)
    if (!greetingRequestedRef.current) {
      greetingRequestedRef.current = true;
      postChat({ type: CHAT_TYPE.COACHING, message: null, sessionId: null, settings: null })
        .then((res) => {
          setSessionId(res.sessionId);
          setGreeting(splitGreeting(res.reply));
        })
        .catch((err) => {
          setGreetingError(err instanceof ApiError ? err.message : '인사말을 불러오지 못했습니다.');
          greetingRequestedRef.current = false;
        })
        .finally(() => setGreetingLoading(false));
    }

    getInbodyRecent()
      .then((data) => !cancelled && setInbody(data))
      .catch((err) => {
        if (cancelled) return;
        setInbodyError(err instanceof ApiError ? err.message : '인바디 데이터를 불러오지 못했습니다.');
      })
      .finally(() => !cancelled && setInbodyLoading(false));

    return () => {
      cancelled = true;
    };
  }, []);

  async function sendAndGoToCoaching(message) {
    if (!message || sending) return;

    setSending(true);
    try {
      const res = await postChat({
        type: CHAT_TYPE.COACHING,
        message,
        sessionId,
        settings: toSettings({ upperBody, lowerBody, duration }),
      });
      navigate(`/coaching?sessionId=${res.sessionId}`);
    } catch (err) {
      setGreetingError(err instanceof ApiError ? err.message : '메시지를 보내지 못했습니다.');
      setSending(false);
    }
  }

  function handleSend() {
    sendAndGoToCoaching(input.trim());
  }

  const hasPreset = Boolean(upperBody || lowerBody || duration);

  /** [프리셋 적용] — 선택한 프리셋 전체를 백엔드로 보내고 코칭 AI 화면으로 이동 (CoachingAI와 동일한 문구) */
  function applyPresets() {
    if (sending || greetingLoading || !hasPreset) return;
    sendAndGoToCoaching(buildPresetMessage({ upperBody, lowerBody, duration }));
  }

  const inbodyRows = inbody
    ? [
        { label: '체중 (kg)', value: inbody.weightKg?.toFixed(1) ?? '--' },
        { label: '골격근량(kg)', value: inbody.skeletalMuscleMassKg?.toFixed(1) ?? '--' },
        { label: '체지방량 (kg)', value: inbody.bodyFatMassKg?.toFixed(1) ?? '--' },
      ]
    : [];

  return (
    <div className="flex h-screen bg-white overflow-hidden" style={{ minWidth: 1100 }}>
      <Sidebar />

      <div className="flex-1 flex overflow-hidden pt-[70px]">
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="flex flex-col items-center w-full px-8">
            <div className="w-full max-w-[799px] flex flex-col">

              {/* 인사말 */}
              <div className="flex flex-col items-center text-center gap-[25px]">
                {greetingLoading ? (
                  <p style={{ ...mono, fontSize: 20, color: '#6b6f76' }}>불러오는 중...</p>
                ) : greetingError ? (
                  <p style={{ ...mono, fontSize: 15, color: '#e2231a' }}>{greetingError}</p>
                ) : (
                  <>
                    <h1 className="font-bold text-black leading-tight" style={{ ...mono, fontSize: 45 }}>
                      {greeting.title}
                    </h1>
                    {greeting.subtitle && (
                      <p className="text-black" style={{ ...mono, fontSize: 25 }}>
                        {greeting.subtitle}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* 채팅 입력창 */}
              <div className="flex items-center border-2 border-[#161415] mt-[35px]" style={{ height: 52 }}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="오늘의 루틴을 말씀해 주세요."
                  disabled={sending}
                  className="flex-1 h-full bg-transparent text-[#161415] outline-none px-4 placeholder-[#161415]/40"
                  style={{ ...mono, fontSize: 15 }}
                />
                <button
                  onClick={handleSend}
                  disabled={sending}
                  className="w-[52px] h-full flex items-center justify-center shrink-0 border-l-2 border-[#161415]
                             hover:bg-[#f7f7f7] transition-colors disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-[#161415]" style={{ fontSize: 20 }}>send</span>
                </button>
              </div>

              {/* 운동 부위 / 시간 프리셋 + 적용 + 초기화 (CoachingAI와 동일 구성) */}
              <div className="flex items-center gap-6 mt-[20px] flex-wrap">
                <PresetDropdown label="상체운동설정" options={UPPER_BODY_OPTIONS} width={200} value={upperBody} onChange={setUpperBody} />
                <PresetDropdown label="하체운동설정" options={LOWER_BODY_OPTIONS} width={190} value={lowerBody} onChange={setLowerBody} />
                <PresetDropdown label="시간설정" options={TIME_OPTIONS} width={160} value={duration} onChange={setDuration} />
                <button
                  type="button"
                  onClick={applyPresets}
                  disabled={sending || greetingLoading || !hasPreset}
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

              {/* My Recent Inbody Data */}
              <div className="mt-[100px] pb-8">
                <div className="flex items-baseline gap-[13px] mb-2">
                  <span className="font-bold text-black" style={{ ...mono, fontSize: 20 }}>
                    My Recent Inbody Data
                  </span>
                  {inbody && (
                    <span className="text-black" style={{ ...mono, fontSize: 12 }}>
                      Last Data {formatDate(inbody.measuredAt)}
                    </span>
                  )}
                </div>

                {inbodyLoading ? (
                  <div className="border border-[#b7bac4] flex items-center justify-center" style={{ height: 132 }}>
                    <span style={{ ...mono, fontSize: 13, color: '#6b6f76' }}>불러오는 중...</span>
                  </div>
                ) : inbodyError ? (
                  <div className="border border-[#b7bac4] flex items-center justify-center" style={{ height: 132 }}>
                    <span style={{ ...mono, fontSize: 13, color: '#e2231a' }}>{inbodyError}</span>
                  </div>
                ) : !inbody ? (
                  <NoInbodyData />
                ) : (
                  <div className="border border-[#b7bac4] px-[14px] py-[9px] flex items-stretch gap-4">
                    <div className="bg-[#161415] px-[13px] pt-[15px] pb-[13px] w-[182px] shrink-0
                                    flex flex-col gap-[11px]">
                      <span style={{ ...mono, fontSize: 12, color: '#fff' }}>My Profile</span>
                      <span className="font-bold" style={{ ...mono, fontSize: 12, color: '#fff' }}>
                        체중. {inbody.weightKg?.toFixed(1) ?? '--'}kg
                      </span>
                      <span className="font-bold" style={{ ...mono, fontSize: 12, color: '#fff' }}>
                        기초대사량. {inbody.bmrKcal ?? '--'}kcal
                      </span>
                      <span className="text-center mt-auto" style={{ ...mono, fontSize: 8, color: '#fff' }}>
                        APEX AI
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col gap-4 justify-between">
                      {inbodyRows.map((row) => (
                        <InbodyRow key={row.label} label={row.label} value={row.value} />
                      ))}
                    </div>

                    <div className="bg-[#161415] w-[80px] shrink-0 flex flex-col items-center justify-end gap-1 pb-4">
                      <div className="relative border border-[#b7bac4] flex items-center justify-center" style={{ width: 44, height: 44 }}>
                        <span className="font-bold text-white" style={{ ...mono, fontSize: 22 }}> A</span>
                        <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-[#b7bac4] rounded-full -translate-y-0.5 translate-x-0.5" />
                      </div>
                      <span className="tracking-[0.2em] text-[#b7bac4]" style={{ ...mono, fontSize: 7 }}>APEXAI</span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        <AiPanel />
      </div>
    </div>
  );
}
