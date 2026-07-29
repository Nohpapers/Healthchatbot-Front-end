import React, { useState } from 'react';
import Sidebar from './Sidebar';
import AiPanel from './AiPanel';
import { mono } from '../constants';

/* ─── 재사용 토글 스위치 ─── */
function Toggle({ on, onClick }) {
  return (
    <button onClick={onClick}
      className="w-[44px] h-[24px] rounded-full transition-colors shrink-0 relative"
      style={{ background: on ? '#ff1c1e' : '#d1d5db' }}>
      <span className="absolute top-[2px] w-[20px] h-[20px] bg-white rounded-full transition-all"
        style={{ left: on ? 22 : 2 }} />
    </button>
  );
}

/* ─── 선택 칩 (여러 스타일) ─── */
function Chip({ active, onClick, children, variant = 'pink' }) {
  const styles = active
    ? (variant === 'dark'
      ? { background: '#161415', color: '#fff', borderColor: '#161415' }
      : { background: '#ffd6d5', color: '#e2231a', borderColor: '#ffb3b1' })
    : { background: '#fff', color: '#161415', borderColor: '#e5e7eb' };
  return (
    <button onClick={onClick} className="h-[38px] px-4 border transition-colors hover:opacity-90"
      style={{ ...mono, fontSize: 12, fontWeight: 700, ...styles }}>
      {children}
    </button>
  );
}

/* ─── 입력 필드 ─── */
function Field({ label, value }) {
  return (
    <label className="flex flex-col gap-2">
      <span style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>{label}</span>
      <input defaultValue={value}
        className="border border-[#e5e7eb] h-[42px] px-3 outline-none focus:border-[#161415] transition-colors"
        style={{ ...mono, fontSize: 13, color: '#161415' }} />
    </label>
  );
}

/* ─── 섹션 래퍼 ─── */
function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-6">
      <h2 style={{ ...mono, fontSize: 18, fontWeight: 700, color: '#161415' }}>{title}</h2>
      <div className="border border-[rgba(183,186,196,0.6)] p-6 mt-4">{children}</div>
    </section>
  );
}

/* ─── 토글 행 ─── */
function ToggleRow({ title, desc, on, onToggle }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#f0f0f0] last:border-0">
      <div>
        <div style={{ ...mono, fontSize: 13, fontWeight: 700, color: '#161415' }}>{title}</div>
        {desc && <div className="mt-1" style={{ ...mono, fontSize: 11, color: '#6b6f76' }}>{desc}</div>}
      </div>
      <Toggle on={on} onClick={onToggle} />
    </div>
  );
}

export default function Profile() {
  const [goals, setGoals] = useState(['근육량 증가']);
  const [prefWays, setPrefWays] = useState(['웨이트 트레이닝', '유산소']);
  const [prefTime, setPrefTime] = useState('60분');
  const [prefCareer, setPrefCareer] = useState('1년 ~ 2년');
  const [prefPain, setPrefPain] = useState(['없음']);
  const [aiRecom, setAiRecom] = useState('안전성 강화형 우선');
  const [aiLevel, setAiLevel] = useState('보통');
  const [aiTone, setAiTone] = useState('전문적인 트레이너');

  const [autoRecom, setAutoRecom] = useState({ today: true, adjust: true, lack: true, rest: false, caution: true });
  const [alarms, setAlarms] = useState({ start: true, weekly: true, longRest: true, ai: false, body: true, summary: true, event: false });
  const [privacy, setPrivacy] = useState({ collect: true, aiUse: true });
  const [twoStep, setTwoStep] = useState(false);

  function toggleIn(list, setList, item) {
    setList(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  }

  const GOALS = ['근육량 증가', '체지방 감소', '체력 향상', '자세 교정', '재활 및 회복', '운동습관 형성'];
  const PREF_WAYS = ['웨이트 트레이닝', '맨몸 운동', '유산소', '스트레칭', '기능성 운동'];
  const PREF_TIMES = ['30분 이하', '60분', '120분 이상'];
  const PREF_CAREERS = ['6개월 미만', '6개월 ~ 1년', '1년 ~ 2년', '2년 이상'];
  const PREF_PAINS = ['목', '어깨', '팔꿈치', '허리', '무릎', '손목', '발목', '없음'];
  const AI_RECOMS = ['안전성 강화형 우선', '운동 효과 우선', '짧고 간단한 운동 우선', '새로운 운동 형태 우선'];
  const AI_LEVELS = ['간결하게', '보통', '상세하게'];
  const AI_TONES = ['차분한 코치', '전문적인 트레이너', '동기부여 중심', '건조한 안내'];

  return (
    <div className="flex h-screen bg-white overflow-hidden" style={{ minWidth: 1100 }}>
      <Sidebar />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full max-w-[1000px] mx-auto px-8 pt-10 pb-16">

            {/* 헤더 */}
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 style={{ ...mono, fontSize: 30, fontWeight: 700, color: '#161415' }}>프로필 설정</h1>
                <p className="mt-1" style={{ ...mono, fontSize: 13, color: '#6b6f76' }}>개인 프로필 설정</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 border border-[#b7bac4] h-[42px] px-4 hover:bg-[#f7f7f7] transition-colors"
                  style={{ ...mono, fontSize: 13, fontWeight: 700, color: '#161415' }}>
                  최근 30일
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>expand_more</span>
                </button>
                <button className="border border-[#b7bac4] h-[42px] px-4 hover:bg-[#f7f7f7] transition-colors"
                  style={{ ...mono, fontSize: 13, color: '#161415' }}>변경사항 저장</button>
                <button className="bg-[#161415] text-white h-[42px] px-4 hover:opacity-80 transition-opacity"
                  style={{ ...mono, fontSize: 13, fontWeight: 700 }}>변경사항 취소</button>
              </div>
            </div>

            {/* 프로필 카드 */}
            <div className="border border-[rgba(183,186,196,0.6)] p-5 mt-6 flex items-center gap-4">
              <div className="w-[64px] h-[64px] rounded-full bg-[#f0f0f0] border border-[#e5e7eb] shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span style={{ ...mono, fontSize: 16, fontWeight: 700, color: '#161415' }}>박창현</span>
                  <span className="px-2 py-[2px]" style={{ ...mono, fontSize: 10, fontWeight: 700, background: '#ffd6d5', color: '#e2231a' }}>Intermediate</span>
                </div>
                <div className="mt-1" style={{ ...mono, fontSize: 11, color: '#6b6f76' }}>
                  전체 회원 · 근육량 증가 · 가입일 2025.03.15
                </div>
                <div className="mt-2 h-[6px] bg-[#f0f0f0] rounded-full overflow-hidden max-w-[420px]">
                  <div className="h-full bg-[#ff1c1e]" style={{ width: '65%' }} />
                </div>
              </div>
              <button className="border border-[#b7bac4] h-[38px] px-4 hover:bg-[#f7f7f7] transition-colors self-start"
                style={{ ...mono, fontSize: 12, color: '#161415' }}>이미지 변경</button>
            </div>

            <div className="mt-8">
              {/* 섹션들 */}
              <div className="flex flex-col gap-10">

                {/* 기본 프로필 */}
                <Section id="basic" title="기본 프로필">
                  <div className="grid grid-cols-2 gap-5">
                    <Field label="이름" value="박창현" />
                    <Field label="닉네임" value="창현_fitness" />
                    <Field label="생년월일" value="1998.05.12" />
                    <Field label="성별" value="남성" />
                    <Field label="이메일" value="oooRoooo.com" />
                    <Field label="휴대전화 번호" value="000-0000-0000" />
                  </div>
                </Section>

                {/* 신체 정보 */}
                <Section id="body" title="신체 정보">
                  <div className="grid grid-cols-2 gap-5">
                    <Field label="키 (cm)" value="169" />
                    <Field label="체중 (kg)" value="60" />
                    <Field label="골격근량 (kg)" value="29.4" />
                    <Field label="체지방률 (%)" value="15.2" />
                  </div>
                  <p className="mt-4" style={{ ...mono, fontSize: 11, color: '#6b6f76' }}>
                    입력한 신체 정보는 운동 강도와 루틴 추천을 개인화하는 데 사용됩니다.
                  </p>
                  <button className="mt-3 border border-[#b7bac4] h-[38px] px-4 hover:bg-[#f7f7f7] transition-colors"
                    style={{ ...mono, fontSize: 12, color: '#161415' }}>전체 신체 기록 보기</button>
                </Section>

                {/* 운동 목표 */}
                <Section id="goal" title="운동 목표">
                  <div style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>주요 운동 목표 (복수선택 가능)</div>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {GOALS.map((g) => (
                      <Chip key={g} variant="dark" active={goals.includes(g)}
                        onClick={() => toggleIn(goals, setGoals, g)}>{g}</Chip>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-5 mt-6">
                    <Field label="주간 운동 목표 횟수" value="4회" />
                    <Field label="1회 목표 운동 시간" value="60분" />
                    <Field label="목표 체중 (kg)" value="62" />
                    <Field label="목표 달성 예정일" value="2025.12.31" />
                  </div>
                </Section>

                {/* 운동 선호 설정 */}
                <Section id="pref" title="운동 선호 설정">
                  <div style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>선호 가능 방식 (복수선택 가능)</div>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {PREF_WAYS.map((w) => (
                      <Chip key={w} active={prefWays.includes(w)}
                        onClick={() => toggleIn(prefWays, setPrefWays, w)}>{w}</Chip>
                    ))}
                  </div>

                  <div className="mt-5" style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>운동 가능 시간</div>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {PREF_TIMES.map((t) => (
                      <Chip key={t} active={prefTime === t} onClick={() => setPrefTime(t)}>{t}</Chip>
                    ))}
                  </div>

                  <div className="mt-5" style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>운동 경력</div>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {PREF_CAREERS.map((c) => (
                      <Chip key={c} active={prefCareer === c} onClick={() => setPrefCareer(c)}>{c}</Chip>
                    ))}
                  </div>

                  <div className="mt-5" style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>운동 시 불편한 부위</div>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {PREF_PAINS.map((p) => (
                      <Chip key={p} active={prefPain.includes(p)}
                        onClick={() => toggleIn(prefPain, setPrefPain, p)}>{p}</Chip>
                    ))}
                  </div>
                  <p className="mt-4" style={{ ...mono, fontSize: 11, color: '#6b6f76' }}>
                    해당 정보는 의학적 진단이 아니라 운동 추천을 조절하기 위한 참고 정보입니다.
                  </p>
                </Section>

                {/* AI 맞춤 설정 */}
                <Section id="ai" title="AI 맞춤 설정">
                  <div style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>추천 방식</div>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {AI_RECOMS.map((r) => (
                      <Chip key={r} active={aiRecom === r} onClick={() => setAiRecom(r)}>{r}</Chip>
                    ))}
                  </div>

                  <div className="mt-5" style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>AI 설명 수준</div>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {AI_LEVELS.map((l) => (
                      <Chip key={l} active={aiLevel === l} onClick={() => setAiLevel(l)}>{l}</Chip>
                    ))}
                  </div>

                  <div className="mt-5" style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>AI 운동 코치 말투</div>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {AI_TONES.map((t) => (
                      <Chip key={t} active={aiTone === t} onClick={() => setAiTone(t)}>{t}</Chip>
                    ))}
                  </div>

                  <div className="mt-6" style={{ ...mono, fontSize: 13, fontWeight: 700, color: '#161415' }}>자동 추천 기능</div>
                  <div className="mt-2">
                    <ToggleRow title="오늘의 운동 루틴 추천" on={autoRecom.today} onToggle={() => setAutoRecom((s) => ({ ...s, today: !s.today }))} />
                    <ToggleRow title="운동 기록 기반 강도 조절" on={autoRecom.adjust} onToggle={() => setAutoRecom((s) => ({ ...s, adjust: !s.adjust }))} />
                    <ToggleRow title="부족한 운동 부위 알림" on={autoRecom.lack} onToggle={() => setAutoRecom((s) => ({ ...s, lack: !s.lack }))} />
                    <ToggleRow title="휴식일 추천" on={autoRecom.rest} onToggle={() => setAutoRecom((s) => ({ ...s, rest: !s.rest }))} />
                    <ToggleRow title="운동 자세 주의사항 제공" on={autoRecom.caution} onToggle={() => setAutoRecom((s) => ({ ...s, caution: !s.caution }))} />
                  </div>
                </Section>

                {/* 알림 설정 */}
                <Section id="alarm" title="알림 설정">
                  <ToggleRow title="운동 시작 알림" desc="설정한 시간에 운동 시작을 알려줍니다" on={alarms.start} onToggle={() => setAlarms((s) => ({ ...s, start: !s.start }))} />
                  <ToggleRow title="주간 목표 진행 알림" desc="주간 운동 목표 달성률을 알려줍니다" on={alarms.weekly} onToggle={() => setAlarms((s) => ({ ...s, weekly: !s.weekly }))} />
                  <ToggleRow title="장기간 미운동 알림" desc="3일 이상 운동하지 않으면 알림을 보냅니다" on={alarms.longRest} onToggle={() => setAlarms((s) => ({ ...s, longRest: !s.longRest }))} />
                  <ToggleRow title="AI 추천 루틴 알림" desc="AI가 새로운 루틴을 추천하면 알립니다" on={alarms.ai} onToggle={() => setAlarms((s) => ({ ...s, ai: !s.ai }))} />
                  <ToggleRow title="신체 정보 업데이트 알림" desc="주기적으로 신체 정보 업데이트를 안내합니다" on={alarms.body} onToggle={() => setAlarms((s) => ({ ...s, body: !s.body }))} />
                  <ToggleRow title="운동 기록 요약 알림" desc="주간 운동 요약 리포트를 알려줍니다" on={alarms.summary} onToggle={() => setAlarms((s) => ({ ...s, summary: !s.summary }))} />
                  <ToggleRow title="서비스 공지 및 이벤트" on={alarms.event} onToggle={() => setAlarms((s) => ({ ...s, event: !s.event }))} />
                  <div className="mt-4" style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>알림 수신 방식</div>
                  <div className="flex gap-3 mt-3">
                    <Chip active>앱 알림</Chip>
                    <Chip>이메일</Chip>
                    <Chip>문자 알림</Chip>
                  </div>
                </Section>

                {/* 개인정보 및 데이터 */}
                <Section id="privacy" title="개인정보 및 데이터">
                  <ToggleRow title="운동 데이터 수집 동의" desc="운동 기록을 수집하여 서비스를 개선합니다" on={privacy.collect} onToggle={() => setPrivacy((s) => ({ ...s, collect: !s.collect }))} />
                  <ToggleRow title="AI 추천을 위한 데이터 활용 동의" desc="신체·운동 데이터를 AI 추천에 활용합니다" on={privacy.aiUse} onToggle={() => setPrivacy((s) => ({ ...s, aiUse: !s.aiUse }))} />
                  <div className="flex flex-wrap gap-3 mt-5">
                    <button className="border border-[#b7bac4] h-[38px] px-4 hover:bg-[#f7f7f7] transition-colors" style={{ ...mono, fontSize: 12, color: '#161415' }}>개인정보 이용 내역</button>
                    <button className="border border-[#b7bac4] h-[38px] px-4 hover:bg-[#f7f7f7] transition-colors" style={{ ...mono, fontSize: 12, color: '#161415' }}>데이터 내보내기 (CSV)</button>
                    <button className="border border-[#b7bac4] h-[38px] px-4 hover:bg-[#f7f7f7] transition-colors" style={{ ...mono, fontSize: 12, color: '#161415' }}>운동 기록 다운로드</button>
                  </div>
                  <div className="mt-6" style={{ ...mono, fontSize: 13, fontWeight: 700, color: '#e2231a' }}>위험 영역</div>
                  <div className="flex gap-6 mt-3">
                    <button style={{ ...mono, fontSize: 12, color: '#e2231a', fontWeight: 700 }}>운동 기록 초기화</button>
                    <button style={{ ...mono, fontSize: 12, color: '#e2231a', fontWeight: 700 }}>계정 데이터 삭제 요청</button>
                  </div>
                </Section>

                {/* 계정 및 보안 */}
                <Section id="account" title="계정 및 보안">
                  {[
                    ['이메일 변경', 'changyhun@email.com'],
                    ['비밀번호 변경', '마지막 변경: 2025.06.01'],
                    ['로그인된 기기 관리', '2개 기기'],
                  ].map(([label, value]) => (
                    <button key={label} className="w-full flex items-center justify-between py-3 border-b border-[#f0f0f0] hover:bg-[#f7f7f7] transition-colors">
                      <span style={{ ...mono, fontSize: 13, fontWeight: 700, color: '#161415' }}>{label}</span>
                      <span className="flex items-center gap-2" style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>
                        {value}
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
                      </span>
                    </button>
                  ))}
                  <div className="flex items-center justify-between py-3 border-b border-[#f0f0f0]">
                    <span style={{ ...mono, fontSize: 13, fontWeight: 700, color: '#161415' }}>2단계 인증</span>
                    <Toggle on={twoStep} onClick={() => setTwoStep((v) => !v)} />
                  </div>

                  <div className="mt-5" style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>연결된 계정</div>
                  <div className="flex flex-col gap-3 mt-3">
                    {[['Google', true], ['Apple', false], ['Kakao', true]].map(([name, linked]) => (
                      <div key={name} className="border border-[#e5e7eb] p-4 flex items-center justify-between">
                        <span style={{ ...mono, fontSize: 13, color: '#161415' }}>{name}</span>
                        <span className="px-2 py-[3px]" style={{
                          ...mono, fontSize: 10, fontWeight: 700,
                          background: linked ? '#e5f6ea' : '#f0f0f0',
                          color: linked ? '#1f9d55' : '#6b6f76',
                        }}>{linked ? '연결됨' : '연결되지 않음'}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-6 mt-6">
                    <button className="flex items-center gap-1" style={{ ...mono, fontSize: 12, color: '#ff1c1e', fontWeight: 700 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>logout</span>로그아웃
                    </button>
                    <button className="flex items-center gap-1" style={{ ...mono, fontSize: 12, color: '#ff1c1e', fontWeight: 700 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>person_remove</span>회원 탈퇴
                    </button>
                  </div>
                </Section>

              </div>
            </div>
          </div>
        </div>

        <AiPanel />
      </div>
    </div>
  );
}
