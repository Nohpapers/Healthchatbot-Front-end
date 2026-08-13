import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import AiPanel from './AiPanel';
import { mono } from '../constants';
import {
  getMe, patchMe,
  getPreferences, putPreferences,
  getAiSettings, putAiSettings,
  getNotificationSettings, putNotificationSettings,
  ApiError,
} from '../api/client';
import { logout } from '../api/auth';
import {
  GENDER, GOAL, EXPERIENCE_LEVEL, WORKOUT_DURATION, INJURY_PART, WORKOUT_TYPE,
  RECOMMENDATION_STYLE, EXPLANATION_LEVEL, COACH_TONE, RECEIVE_CHANNEL,
  toEnums, labelOf, toFrequency, toIsoDate, toNumber, formatDateInput,
} from '../api/enums';

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

/* ─── 입력 필드 (제어 컴포넌트 — 저장 시 그대로 PATCH 바디가 된다)
 *     date를 주면 타이핑하는 동안 yyyy-mm-dd 형식으로 자동 정리한다 ─── */
function Field({ label, value, onChange, readOnly, placeholder, date }) {
  return (
    <label className="flex flex-col gap-2">
      <span style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>{label}</span>
      <input
        value={value ?? ''}
        placeholder={date ? 'YYYY-MM-DD' : placeholder}
        readOnly={readOnly}
        onChange={onChange ? (e) => onChange(date ? formatDateInput(e.target.value) : e.target.value) : undefined}
        {...(date ? { inputMode: 'numeric', maxLength: 10 } : {})}
        className="border border-[#e5e7eb] h-[42px] px-3 outline-none focus:border-[#161415] transition-colors read-only:bg-[#f7f7f7] read-only:text-[#6b6f76]"
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

const GOALS = ['근육량 증가', '체지방 감소', '체력 향상', '자세 교정', '재활 및 회복', '운동습관 형성'];
const PREF_WAYS = ['웨이트 트레이닝', '맨몸 운동', '유산소', '스트레칭', '기능성 운동'];
const PREF_TIMES = ['30분 이하', '60분', '90분', '120분 이상'];
const PREF_CAREERS = ['6개월 미만', '6개월 ~ 1년', '1년 ~ 2년', '2년 이상'];
const PREF_PAINS = ['목', '어깨', '팔꿈치', '허리', '무릎', '손목', '발목', '없음'];
const AI_RECOMS = ['안전성 강화형 우선', '운동 효과 우선', '짧고 간단한 운동 우선', '새로운 운동 형태 우선'];
const AI_LEVELS = ['간결하게', '보통', '상세하게'];
const AI_TONES = ['차분한 코치', '전문적인 트레이너', '동기부여 중심', '건조한 안내'];
const CHANNELS = ['앱 알림', '이메일', '문자 알림'];

/** 기본 상태 — 서버에 아직 아무것도 저장되지 않은 유저(설정 3종 미생성)에서도 화면이 돌아가야 한다 */
const EMPTY = {
  name: '', nickname: '', birthDate: '', gender: '', email: '', phone: '',
  heightCm: '', targetWeightKg: '', targetMuscleKg: '', goalTargetDate: '',
  goals: [], career: '', freq: '', prefTime: '',
  prefWays: [], prefPain: [],
  aiRecom: '', aiLevel: '', aiTone: '',
  autoRecom: { today: false, adjust: false, lack: false, rest: false, caution: false },
  alarms: { start: false, weekly: false, longRest: false, ai: false, body: false, summary: false, event: false },
  channel: '앱 알림',
};

export default function Profile() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);

  // 화면에만 있고 백엔드 엔드포인트가 아직 없는 항목 (명세 4장 · api.md 5장)
  const [privacy, setPrivacy] = useState({ collect: true, aiUse: true });
  const [twoStep, setTwoStep] = useState(false);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  /** 서버 응답(enum) → 화면 상태(한글 라벨)로 펼친다 */
  function hydrate(me, prefs, ai, notif) {
    setForm({
      name: me?.name ?? '',
      nickname: me?.nickname ?? '',
      birthDate: me?.birthDate ?? '',
      gender: labelOf(GENDER, me?.gender) ?? '',
      email: me?.email ?? '',
      phone: me?.phone ?? '',
      heightCm: me?.heightCm ?? '',
      targetWeightKg: me?.targetWeightKg ?? '',
      targetMuscleKg: me?.targetMuscleKg ?? '',
      goalTargetDate: me?.goalTargetDate ?? '',
      goals: (me?.goals ?? []).map((g) => labelOf(GOAL, g)).filter(Boolean),
      career: labelOf(EXPERIENCE_LEVEL, me?.experienceLevel) ?? '',
      freq: me?.workoutFrequencyPerWeek ? `주 ${me.workoutFrequencyPerWeek}회` : '',
      prefTime: labelOf(WORKOUT_DURATION, me?.workoutDuration) ?? '',
      prefWays: (prefs?.preferredWorkoutTypes ?? []).map((w) => labelOf(WORKOUT_TYPE, w)).filter(Boolean),
      prefPain: (prefs?.injuryParts ?? []).map((p) => labelOf(INJURY_PART, p)).filter(Boolean),
      aiRecom: labelOf(RECOMMENDATION_STYLE, ai?.recommendationStyle) ?? '',
      aiLevel: labelOf(EXPLANATION_LEVEL, ai?.explanationLevel) ?? '',
      aiTone: labelOf(COACH_TONE, ai?.coachTone) ?? '',
      autoRecom: {
        today: !!ai?.autoDailyRoutine,
        adjust: !!ai?.autoIntensityAdjust,
        lack: !!ai?.autoWeakpartAlert,
        rest: !!ai?.autoRestdaySuggest,
        caution: !!ai?.autoPostureTip,
      },
      alarms: {
        start: !!notif?.notifyWorkoutStart,
        weekly: !!notif?.notifyWeeklyGoal,
        longRest: !!notif?.notifyLongAbsence,
        ai: !!notif?.notifyAiRecommend,
        body: !!notif?.notifyBodyUpdate,
        summary: !!notif?.notifyWorkoutSummary,
        event: !!notif?.notifyServiceEvent,
      },
      channel: labelOf(RECEIVE_CHANNEL, notif?.receiveChannel) ?? '앱 알림',
    });
  }

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    Promise.all([getMe(), getPreferences(), getAiSettings(), getNotificationSettings()])
      .then(([me, prefs, ai, notif]) => {
        if (cancelled) return;
        hydrate(me, prefs, ai, notif);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(
          err instanceof ApiError && err.status === 401
            ? '로그인이 필요합니다. 구글 로그인 후 다시 시도해 주세요.'
            : err?.message || '프로필을 불러오지 못했습니다.'
        );
      })
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [reloadKey]);

  function toggleIn(key, item) {
    const list = form[key];
    set({ [key]: list.includes(item) ? list.filter((x) => x !== item) : [...list, item] });
  }

  /**
   * 변경사항 저장 — 명세 2-3 / 2-5 / 2-6 / 2-7.
   * 프로필은 PATCH(부분 수정), 설정 3종은 PUT(upsert)로 한 번에 올린다.
   * name은 로그인 시 채워진 값이라 보내지 않는다 (2-2 참고).
   */
  async function handleSave() {
    if (saving) return;
    setSaveMsg(null);
    setSaving(true);
    try {
      await patchMe({
        nickname: form.nickname || null,
        birthDate: toIsoDate(form.birthDate),
        email: form.email || null,
        phone: form.phone || null,
        heightCm: toNumber(form.heightCm),
        goals: toEnums(GOAL, form.goals),
        experienceLevel: EXPERIENCE_LEVEL[form.career] ?? null,
        workoutFrequencyPerWeek: toFrequency(form.freq),
        workoutDuration: WORKOUT_DURATION[form.prefTime] ?? null,
        targetWeightKg: toNumber(form.targetWeightKg),
        targetMuscleKg: toNumber(form.targetMuscleKg),
        goalTargetDate: toIsoDate(form.goalTargetDate),
      });

      await putPreferences({
        preferredWorkoutTypes: toEnums(WORKOUT_TYPE, form.prefWays),
        injuryParts: toEnums(INJURY_PART, form.prefPain),
      });

      await putAiSettings({
        recommendationStyle: RECOMMENDATION_STYLE[form.aiRecom] ?? null,
        explanationLevel: EXPLANATION_LEVEL[form.aiLevel] ?? null,
        coachTone: COACH_TONE[form.aiTone] ?? null,
        autoDailyRoutine: form.autoRecom.today,
        autoIntensityAdjust: form.autoRecom.adjust,
        autoWeakpartAlert: form.autoRecom.lack,
        autoRestdaySuggest: form.autoRecom.rest,
        autoPostureTip: form.autoRecom.caution,
      });

      await putNotificationSettings({
        notifyWorkoutStart: form.alarms.start,
        notifyWeeklyGoal: form.alarms.weekly,
        notifyLongAbsence: form.alarms.longRest,
        notifyAiRecommend: form.alarms.ai,
        notifyBodyUpdate: form.alarms.body,
        notifyWorkoutSummary: form.alarms.summary,
        notifyServiceEvent: form.alarms.event,
        receiveChannel: RECEIVE_CHANNEL[form.channel] ?? 'APP',
      });

      setSaveMsg({ ok: true, text: '저장되었습니다.' });
    } catch (err) {
      setSaveMsg({
        ok: false,
        text: err instanceof ApiError && err.status === 401
          ? '로그인이 필요합니다.'
          : err?.message || '저장에 실패했습니다.',
      });
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/', { replace: true });
  }

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
                <button onClick={handleSave} disabled={saving || loading || !!loadError}
                  className="border border-[#b7bac4] h-[42px] px-4 hover:bg-[#f7f7f7] transition-colors disabled:opacity-40"
                  style={{ ...mono, fontSize: 13, color: '#161415' }}>
                  {saving ? '저장 중...' : '변경사항 저장'}
                </button>
                <button onClick={() => setReloadKey((k) => k + 1)} disabled={saving}
                  className="bg-[#161415] text-white h-[42px] px-4 hover:opacity-80 transition-opacity disabled:opacity-40"
                  style={{ ...mono, fontSize: 13, fontWeight: 700 }}>변경사항 취소</button>
              </div>
            </div>

            {loading && (
              <p className="mt-4" style={{ ...mono, fontSize: 13, color: '#6b6f76' }}>프로필을 불러오는 중...</p>
            )}
            {loadError && (
              <div className="border border-[#ffb3b1] bg-[#fff2f1] px-4 py-3 mt-4">
                <p style={{ ...mono, fontSize: 12, color: '#e2231a' }}>{loadError}</p>
              </div>
            )}
            {saveMsg && (
              <div className="px-4 py-3 mt-4 border"
                style={{
                  borderColor: saveMsg.ok ? '#a7e3bb' : '#ffb3b1',
                  background: saveMsg.ok ? '#f0fbf4' : '#fff2f1',
                }}>
                <p style={{ ...mono, fontSize: 12, color: saveMsg.ok ? '#1a8f3c' : '#e2231a' }}>{saveMsg.text}</p>
              </div>
            )}

            {/* 프로필 카드 */}
            <div className="border border-[rgba(183,186,196,0.6)] p-5 mt-6 flex items-center gap-4">
              <div className="w-[64px] h-[64px] rounded-full bg-[#f0f0f0] border border-[#e5e7eb] shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span style={{ ...mono, fontSize: 16, fontWeight: 700, color: '#161415' }}>
                    {form.name || form.nickname || '이름 미설정'}
                  </span>
                  {form.career && (
                    <span className="px-2 py-[2px]" style={{ ...mono, fontSize: 10, fontWeight: 700, background: '#ffd6d5', color: '#e2231a' }}>
                      {form.career}
                    </span>
                  )}
                </div>
                <div className="mt-1" style={{ ...mono, fontSize: 11, color: '#6b6f76' }}>
                  {form.goals.length ? form.goals.join(' · ') : '운동 목표 미설정'}
                </div>
              </div>
            </div>

            <div className="mt-8">
              {/* 섹션들 */}
              <div className="flex flex-col gap-10">

                {/* 기본 프로필 */}
                <Section id="basic" title="기본 프로필">
                  <div className="grid grid-cols-2 gap-5">
                    {/* 이름은 소셜 로그인에서 받은 값 — 쓰기 API가 없어 읽기 전용 (명세 2-2) */}
                    <Field label="이름 (로그인 계정 기준)" value={form.name} readOnly />
                    <Field label="닉네임" value={form.nickname} onChange={(v) => set({ nickname: v })} placeholder="닉네임" />
                    <Field label="생년월일" date value={form.birthDate} onChange={(v) => set({ birthDate: v })} />
                    <Field label="성별" value={form.gender} readOnly placeholder="회원가입에서 설정" />
                    <Field label="이메일" value={form.email} onChange={(v) => set({ email: v })} placeholder="you@example.com" />
                    <Field label="휴대전화 번호" value={form.phone} onChange={(v) => set({ phone: v })} placeholder="010-0000-0000" />
                  </div>
                </Section>

                {/* 신체 정보 */}
                <Section id="body" title="신체 정보">
                  <div className="grid grid-cols-2 gap-5">
                    <Field label="키 (cm)" value={form.heightCm} onChange={(v) => set({ heightCm: v })} />
                    <Field label="목표 근육량 (kg)" value={form.targetMuscleKg} onChange={(v) => set({ targetMuscleKg: v })} />
                  </div>
                  <p className="mt-4" style={{ ...mono, fontSize: 11, color: '#6b6f76' }}>
                    체중·골격근량·체지방률은 인바디 기록(POST /api/inbody)으로 관리됩니다. 종합 데이터 화면에서 확인하세요.
                  </p>
                  <button onClick={() => navigate('/dashboard')}
                    className="mt-3 border border-[#b7bac4] h-[38px] px-4 hover:bg-[#f7f7f7] transition-colors"
                    style={{ ...mono, fontSize: 12, color: '#161415' }}>전체 신체 기록 보기</button>
                </Section>

                {/* 운동 목표 */}
                <Section id="goal" title="운동 목표">
                  <div style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>주요 운동 목표 (복수선택 가능)</div>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {GOALS.map((g) => (
                      <Chip key={g} variant="dark" active={form.goals.includes(g)}
                        onClick={() => toggleIn('goals', g)}>{g}</Chip>
                    ))}
                  </div>
                  <div className="mt-6" style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>주간 운동 목표 횟수</div>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                      <Chip key={n} variant="dark" active={form.freq === `주 ${n}회`}
                        onClick={() => set({ freq: `주 ${n}회` })}>{`주 ${n}회`}</Chip>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-5 mt-6">
                    <Field label="목표 체중 (kg)" value={form.targetWeightKg} onChange={(v) => set({ targetWeightKg: v })} />
                    <Field label="목표 달성 예정일" date value={form.goalTargetDate} onChange={(v) => set({ goalTargetDate: v })} />
                  </div>
                </Section>

                {/* 운동 선호 설정 */}
                <Section id="pref" title="운동 선호 설정">
                  <div style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>선호 가능 방식 (복수선택 가능)</div>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {PREF_WAYS.map((w) => (
                      <Chip key={w} active={form.prefWays.includes(w)}
                        onClick={() => toggleIn('prefWays', w)}>{w}</Chip>
                    ))}
                  </div>

                  <div className="mt-5" style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>1회 운동 가능 시간</div>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {PREF_TIMES.map((t) => (
                      <Chip key={t} active={form.prefTime === t} onClick={() => set({ prefTime: t })}>{t}</Chip>
                    ))}
                  </div>

                  <div className="mt-5" style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>운동 경력</div>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {PREF_CAREERS.map((c) => (
                      <Chip key={c} active={form.career === c} onClick={() => set({ career: c })}>{c}</Chip>
                    ))}
                  </div>

                  <div className="mt-5" style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>운동 시 불편한 부위</div>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {PREF_PAINS.map((p) => (
                      <Chip key={p} active={form.prefPain.includes(p)}
                        onClick={() => toggleIn('prefPain', p)}>{p}</Chip>
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
                      <Chip key={r} active={form.aiRecom === r} onClick={() => set({ aiRecom: r })}>{r}</Chip>
                    ))}
                  </div>

                  <div className="mt-5" style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>AI 설명 수준</div>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {AI_LEVELS.map((l) => (
                      <Chip key={l} active={form.aiLevel === l} onClick={() => set({ aiLevel: l })}>{l}</Chip>
                    ))}
                  </div>

                  <div className="mt-5" style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>AI 운동 코치 말투</div>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {AI_TONES.map((t) => (
                      <Chip key={t} active={form.aiTone === t} onClick={() => set({ aiTone: t })}>{t}</Chip>
                    ))}
                  </div>

                  <div className="mt-6" style={{ ...mono, fontSize: 13, fontWeight: 700, color: '#161415' }}>자동 추천 기능</div>
                  <div className="mt-2">
                    {[
                      ['today', '오늘의 운동 루틴 추천'],
                      ['adjust', '운동 기록 기반 강도 조절'],
                      ['lack', '부족한 운동 부위 알림'],
                      ['rest', '휴식일 추천'],
                      ['caution', '운동 자세 주의사항 제공'],
                    ].map(([key, title]) => (
                      <ToggleRow key={key} title={title} on={form.autoRecom[key]}
                        onToggle={() => set({ autoRecom: { ...form.autoRecom, [key]: !form.autoRecom[key] } })} />
                    ))}
                  </div>
                </Section>

                {/* 알림 설정 */}
                <Section id="alarm" title="알림 설정">
                  {[
                    ['start', '운동 시작 알림', '설정한 시간에 운동 시작을 알려줍니다'],
                    ['weekly', '주간 목표 진행 알림', '주간 운동 목표 달성률을 알려줍니다'],
                    ['longRest', '장기간 미운동 알림', '3일 이상 운동하지 않으면 알림을 보냅니다'],
                    ['ai', 'AI 추천 루틴 알림', 'AI가 새로운 루틴을 추천하면 알립니다'],
                    ['body', '신체 정보 업데이트 알림', '주기적으로 신체 정보 업데이트를 안내합니다'],
                    ['summary', '운동 기록 요약 알림', '주간 운동 요약 리포트를 알려줍니다'],
                    ['event', '서비스 공지 및 이벤트', null],
                  ].map(([key, title, desc]) => (
                    <ToggleRow key={key} title={title} desc={desc} on={form.alarms[key]}
                      onToggle={() => set({ alarms: { ...form.alarms, [key]: !form.alarms[key] } })} />
                  ))}
                  <div className="mt-4" style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>알림 수신 방식</div>
                  <div className="flex gap-3 mt-3">
                    {CHANNELS.map((c) => (
                      <Chip key={c} active={form.channel === c} onClick={() => set({ channel: c })}>{c}</Chip>
                    ))}
                  </div>
                </Section>

                {/* 개인정보 및 데이터 — 백엔드 엔드포인트 없음 (화면 전용) */}
                <Section id="privacy" title="개인정보 및 데이터">
                  <ToggleRow title="운동 데이터 수집 동의" desc="운동 기록을 수집하여 서비스를 개선합니다" on={privacy.collect} onToggle={() => setPrivacy((s) => ({ ...s, collect: !s.collect }))} />
                  <ToggleRow title="AI 추천을 위한 데이터 활용 동의" desc="신체·운동 데이터를 AI 추천에 활용합니다" on={privacy.aiUse} onToggle={() => setPrivacy((s) => ({ ...s, aiUse: !s.aiUse }))} />
                  <p className="mt-4" style={{ ...mono, fontSize: 11, color: '#6b6f76' }}>
                    아래 항목은 백엔드 엔드포인트가 아직 없어 화면에만 존재합니다.
                  </p>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {['개인정보 이용 내역', '데이터 내보내기 (CSV)', '운동 기록 다운로드'].map((label) => (
                      <button key={label} disabled
                        className="border border-[#e5e7eb] h-[38px] px-4 opacity-40 cursor-not-allowed"
                        style={{ ...mono, fontSize: 12, color: '#161415' }}>{label}</button>
                    ))}
                  </div>
                </Section>

                {/* 계정 및 보안 */}
                <Section id="account" title="계정 및 보안">
                  <div className="flex items-center justify-between py-3 border-b border-[#f0f0f0]">
                    <span style={{ ...mono, fontSize: 13, fontWeight: 700, color: '#161415' }}>연결된 계정</span>
                    <span style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>Google (소셜 로그인)</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-[#f0f0f0]">
                    <span style={{ ...mono, fontSize: 13, fontWeight: 700, color: '#161415' }}>2단계 인증</span>
                    <Toggle on={twoStep} onClick={() => setTwoStep((v) => !v)} />
                  </div>

                  <div className="flex gap-6 mt-6">
                    <button onClick={handleLogout} className="flex items-center gap-1" style={{ ...mono, fontSize: 12, color: '#ff1c1e', fontWeight: 700 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>logout</span>로그아웃
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
