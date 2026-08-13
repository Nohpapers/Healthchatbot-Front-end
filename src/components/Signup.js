import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mono } from '../constants';
import { getMe, putMe, putPreferences, postInbody, ApiError } from '../api/client';
import {
  GENDER, GOAL, EXPERIENCE_LEVEL, WORKOUT_DURATION, INJURY_PART,
  toEnums, labelOf, toFrequency, toIsoDate, toNumber, formatDateInput,
} from '../api/enums';

const STEPS = [
  ['01', '개인정보 설정'],
  ['02', '인바디 설정'],
  ['03', '설정 완료'],
];

/* ─── 상단 스텝 인디케이터 ─── */
function StepHeader({ current }) {
  return (
    <div className="flex items-center justify-center gap-4 pt-8">
      {STEPS.map(([num, label], i) => {
        const active = i === current;
        const done = i < current;
        return (
          <React.Fragment key={num}>
            <div className="flex items-center gap-2" style={{ opacity: active || done ? 1 : 0.4 }}>
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                style={{ ...mono, fontSize: 10, fontWeight: 700, background: active || done ? '#ff1c1e' : '#b7bac4' }}>
                {num}
              </span>
              <span style={{ ...mono, fontSize: 14, fontWeight: 700, color: '#161415' }}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <span className="w-[80px] h-px" style={{ background: i < current ? '#ff1c1e' : '#d1d5db' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ─── 라벨 + 입력 (제어 컴포넌트 — 값이 API 요청으로 그대로 나간다)
 *     date를 주면 타이핑하는 동안 yyyy-mm-dd 형식으로 자동 정리한다 ─── */
function Input({ label, required, placeholder, value, onChange, unit, date }) {
  return (
    <label className="flex flex-col gap-2">
      {label && (
        <span style={{ ...mono, fontSize: 12, color: '#161415' }}>
          {label} {required && <span style={{ color: '#ff1c1e' }}>*</span>}
        </span>
      )}
      <div className="relative">
        <input
          placeholder={date ? 'YYYY-MM-DD' : placeholder}
          value={value ?? ''}
          onChange={(e) => onChange(date ? formatDateInput(e.target.value) : e.target.value)}
          {...(date ? { inputMode: 'numeric', maxLength: 10 } : {})}
          className="w-full border border-[#e5e7eb] bg-[#fafafa] h-[46px] px-3 outline-none focus:border-[#161415] transition-colors"
          style={{ ...mono, fontSize: 13, color: '#161415' }} />
        {unit && <span className="absolute right-3 top-1/2 -translate-y-1/2" style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>{unit}</span>}
      </div>
    </label>
  );
}

/* ─── 선택 버튼 (풀폭 3분할 등) ─── */
function SelectBtn({ active, onClick, children, variant = 'pink' }) {
  const s = active
    ? (variant === 'red'
      ? { background: '#ff1c1e', color: '#fff', borderColor: '#ff1c1e' }
      : { background: '#ffd6d5', color: '#e2231a', borderColor: '#ffb3b1' })
    : (variant === 'dark'
      ? { background: '#161415', color: '#fff', borderColor: '#161415' }
      : { background: '#fff', color: '#161415', borderColor: '#e5e7eb' });
  return (
    <button onClick={onClick} className="h-[40px] px-4 border transition-colors hover:opacity-90"
      style={{ ...mono, fontSize: 12, fontWeight: 700, ...s }}>{children}</button>
  );
}

/* ─── 카드 래퍼 ─── */
function Card({ title, sub, children }) {
  return (
    <div className="border border-[rgba(183,186,196,0.6)] p-6">
      {title && <h3 style={{ ...mono, fontSize: 15, fontWeight: 700, color: '#161415' }}>{title}</h3>}
      {sub && <p className="mt-1" style={{ ...mono, fontSize: 11, color: '#6b6f76' }}>{sub}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

const GOALS = [
  ['근육량 증가', '근육량을 증가시켜 튼튼한 몸을 만들어요'],
  ['체지방 감소', '체지방을 줄이고 날씬한 몸매를 만들어요'],
  ['체력 향상', '지구력과 심폐 기능을 높여요'],
  ['자세 교정', '올바른 자세와 유연성을 키워요'],
  ['재활 및 회복', '몸의 재활 및 근육량 회복에 초점을 둬요'],
  ['운동 습관 형성', '운동 기초 습관을 형성해요'],
];
const CAREERS = ['6개월 미만', '6개월 ~ 1년', '1년 ~ 2년', '2년 이상'];
const FREQ = ['주 1회', '주 2회', '주 3회', '주 4회', '주 5회', '주 6회', '주 7회'];
const TIMES = ['30분 이하', '60분', '90분', '120분 이상'];
const PAINS = ['목', '어깨', '팔꿈치', '허리', '무릎', '손목', '발목', '없음'];

/** 오늘 날짜를 yyyy-MM-dd로 (인바디 측정일 기본값) */
function today() {
  return new Date().toISOString().slice(0, 10);
}

/* ─── STEP 1: 개인정보 ─── */
function Step1({ form, set, onNext, onLater }) {
  const togglePain = (p) =>
    set({ pains: form.pains.includes(p) ? form.pains.filter((x) => x !== p) : [...form.pains, p] });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 style={{ ...mono, fontSize: 26, fontWeight: 700, color: '#161415' }}>기본 정보를 설정해 주세요</h1>
        <p className="mt-1" style={{ ...mono, fontSize: 13, color: '#6b6f76' }}>입력한 정보를 바탕으로 회원님에게 적합한 운동 루틴과 건강 분석을 제공합니다.</p>
      </div>

      {/* 프로필 이미지 — 업로드 API가 아직 없어(명세 4장) URL 직접 입력만 지원한다 */}
      <div className="border border-[rgba(183,186,196,0.6)] p-5 flex items-center gap-4">
        <div className="w-[56px] h-[56px] rounded-full bg-[#e5e7eb] flex items-center justify-center shrink-0 overflow-hidden">
          {form.profileImageUrl
            ? <img src={form.profileImageUrl} alt="프로필" className="w-full h-full object-cover" />
            : <span className="material-symbols-outlined text-[#9aa0a6]" style={{ fontSize: 26 }}>person</span>}
        </div>
        <div className="flex-1">
          <Input label="프로필 이미지 URL" placeholder="https://..." value={form.profileImageUrl}
            onChange={(v) => set({ profileImageUrl: v })} />
        </div>
        <button onClick={() => set({ profileImageUrl: '' })}
          className="flex items-center gap-1 border border-[#161415] h-[38px] px-4 hover:bg-[#f7f7f7] transition-colors self-end"
          style={{ ...mono, fontSize: 12, color: '#161415' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>삭제
        </button>
      </div>

      {/* 기본 개인정보 */}
      <Card title="기본 개인정보">
        <div className="flex flex-col gap-4">
          {/* 이름은 소셜 로그인 때 채워진 값을 유지한다 (명세 2-2) — 회원가입에서 보내지 않는다 */}
          <Input label="닉네임" required placeholder="닉네임을 입력해 주세요"
            value={form.nickname} onChange={(v) => set({ nickname: v })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="생년월일" required date
              value={form.birthDate} onChange={(v) => set({ birthDate: v })} />
            <Input label="이메일" placeholder="you@example.com"
              value={form.email} onChange={(v) => set({ email: v })} />
          </div>
          <Input label="휴대전화 번호" placeholder="010-0000-0000"
            value={form.phone} onChange={(v) => set({ phone: v })} />
          <Input label="자기소개" placeholder="3대 400 목표"
            value={form.bio} onChange={(v) => set({ bio: v })} />
          <div>
            <span style={{ ...mono, fontSize: 12, color: '#161415' }}>
              성별 <span style={{ color: '#ff1c1e' }}>*</span>
            </span>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {['남성', '여성', '선택 안 함'].map((g) => (
                <SelectBtn key={g} active={form.gender === g} onClick={() => set({ gender: g })}>{g}</SelectBtn>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="키" required placeholder="169" unit="cm"
              value={form.heightCm} onChange={(v) => set({ heightCm: v })} />
            <Input label="현재 체중" required placeholder="60" unit="kg"
              value={form.weightKg} onChange={(v) => set({ weightKg: v })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="목표 체중" placeholder="62" unit="kg"
              value={form.targetWeightKg} onChange={(v) => set({ targetWeightKg: v })} />
            <Input label="목표 달성 예정일" date
              value={form.goalTargetDate} onChange={(v) => set({ goalTargetDate: v })} />
          </div>
        </div>
      </Card>

      {/* 운동 목표 */}
      <Card title="운동 목표" sub="하나의 주요 목표를 선택해 주세요">
        <div className="flex flex-col gap-3">
          {GOALS.map(([name, desc]) => {
            const active = form.goal === name;
            return (
              <button key={name} onClick={() => set({ goal: name })}
                className="text-left border p-4 transition-colors flex items-center justify-between"
                style={{ borderColor: active ? '#ffb3b1' : '#e5e7eb', background: active ? '#fff2f1' : '#fff' }}>
                <div>
                  <div style={{ ...mono, fontSize: 13, fontWeight: 700, color: active ? '#e2231a' : '#161415' }}>{name}</div>
                  <div className="mt-1" style={{ ...mono, fontSize: 11, color: active ? '#e2231a' : '#6b6f76' }}>{desc}</div>
                </div>
                {active && <span className="material-symbols-outlined text-[#e2231a]" style={{ fontSize: 18 }}>check</span>}
              </button>
            );
          })}
        </div>
      </Card>

      {/* 운동 경력 */}
      <Card title="운동 경력">
        <div className="grid grid-cols-4 gap-3">
          {CAREERS.map((c) => (
            <SelectBtn key={c} variant="red" active={form.career === c} onClick={() => set({ career: c })}>{c}</SelectBtn>
          ))}
        </div>
      </Card>

      {/* 운동 환경과 빈도 */}
      <Card title="운동 환경과 빈도">
        <div style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>주당 운동 가능 횟수</div>
        <div className="flex flex-wrap gap-2 mt-3">
          {FREQ.map((f) => (
            <SelectBtn key={f} variant="dark" active={form.freq === f} onClick={() => set({ freq: f })}>{f}</SelectBtn>
          ))}
        </div>
        <div className="mt-5" style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>1회 운동 가능 시간</div>
        <div className="flex flex-wrap gap-2 mt-3">
          {TIMES.map((t) => (
            <SelectBtn key={t} variant="dark" active={form.time === t} onClick={() => set({ time: t })}>{t}</SelectBtn>
          ))}
        </div>
        <div className="mt-5" style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>운동 시 불편한 부위</div>
        <div className="flex flex-wrap gap-2 mt-3">
          {PAINS.map((p) => (
            <SelectBtn key={p} variant="dark" active={form.pains.includes(p)} onClick={() => togglePain(p)}>{p}</SelectBtn>
          ))}
        </div>
      </Card>

      {/* 하단 버튼 */}
      <div className="flex items-center justify-between pt-2">
        <button onClick={onLater} className="flex items-center gap-1 border border-[#161415] h-[42px] px-4 hover:bg-[#f7f7f7] transition-colors" style={{ ...mono, fontSize: 13, color: '#161415', fontWeight: 700 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>close</span>나중에 설정
        </button>
        <div className="flex gap-3">
          <button onClick={onLater} className="border border-[#b7bac4] h-[42px] px-5 hover:bg-[#f7f7f7] transition-colors" style={{ ...mono, fontSize: 13, color: '#161415' }}>이전</button>
          <button onClick={onNext} className="bg-[#161415] text-white h-[42px] px-5 hover:opacity-80 transition-opacity" style={{ ...mono, fontSize: 13, fontWeight: 700 }}>다음: 인바디 설정</button>
        </div>
      </div>
    </div>
  );
}

/* ─── STEP 2: 인바디 ─── */
function Step2({ form, set, onSubmit, onPrev, saving, error }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 style={{ ...mono, fontSize: 26, fontWeight: 700, color: '#161415' }}>인바디 정보를 입력해 주세요</h1>
        <p className="mt-1" style={{ ...mono, fontSize: 13, color: '#6b6f76' }}>최근 인바디 측정 결과를 입력하면 신체 구성에 맞는 운동과 식단을 추천할 수 있습니다.</p>
      </div>

      {/* database.md 7장: '인바디 없이 시작' 옵션은 제거됐고 인바디는 항상 입력된다.
          inbody_records의 체중·기초대사량·골격근량·체지방량이 not null이라 비우면 저장 자체가 안 된다. */}
      <Card title="측정 기본정보" sub="* 개인정보 설정에서 입력한 키와 체중이 자동으로 불러와졌습니다.">
        <div className="grid grid-cols-3 gap-4">
          <Input label="측정일" required date value={form.measuredAt} onChange={(v) => set({ measuredAt: v })} />
          <Input label="키" unit="cm" value={form.heightCm} onChange={(v) => set({ heightCm: v })} />
          <Input label="체중" required unit="kg" value={form.weightKg} onChange={(v) => set({ weightKg: v })} />
        </div>
      </Card>
      <Card title="신체 구성 정보">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span style={{ ...mono, fontSize: 12, fontWeight: 700, color: '#161415' }}>골격근량</span>
              <span style={{ color: '#ff1c1e', ...mono, fontSize: 12 }}>*</span>
            </div>
            <Input unit="kg" value={form.skeletalMuscleMassKg} onChange={(v) => set({ skeletalMuscleMassKg: v })} />
            <div className="mt-1" style={{ ...mono, fontSize: 11, color: '#6b6f76' }}>예시: 28.4kg</div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span style={{ ...mono, fontSize: 12, fontWeight: 700, color: '#161415' }}>체지방량</span>
              <span style={{ color: '#ff1c1e', ...mono, fontSize: 12 }}>*</span>
            </div>
            <Input unit="kg" value={form.bodyFatMassKg} onChange={(v) => set({ bodyFatMassKg: v })} />
            <div className="mt-1" style={{ ...mono, fontSize: 11, color: '#6b6f76' }}>예시: 10.2kg</div>
          </div>
          <div className="mt-4">
            {/* body_fat_pct만 nullable — 모르면 비워둬도 저장된다 */}
            <div style={{ ...mono, fontSize: 12, color: '#161415', marginBottom: 8 }}>체지방률 (선택)</div>
            <Input unit="%" value={form.bodyFatPct} onChange={(v) => set({ bodyFatPct: v })} />
            <div className="mt-1" style={{ ...mono, fontSize: 11, color: '#6b6f76' }}>예시: 18.5%</div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <span style={{ ...mono, fontSize: 12, fontWeight: 700, color: '#161415' }}>기초대사량</span>
              <span style={{ color: '#ff1c1e', ...mono, fontSize: 12 }}>*</span>
            </div>
            <Input unit="kcal" value={form.bmrKcal} onChange={(v) => set({ bmrKcal: v })} />
            <div className="mt-1" style={{ ...mono, fontSize: 11, color: '#6b6f76' }}>예시: 1520kcal</div>
          </div>
        </div>
      </Card>

      {error && (
        <div className="border border-[#ffb3b1] bg-[#fff2f1] px-4 py-3">
          <p style={{ ...mono, fontSize: 12, color: '#e2231a' }}>{error}</p>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onPrev} disabled={saving} className="border border-[#b7bac4] h-[42px] px-5 hover:bg-[#f7f7f7] transition-colors disabled:opacity-40" style={{ ...mono, fontSize: 13, color: '#161415' }}>이전</button>
        <button onClick={onSubmit} disabled={saving} className="bg-[#161415] text-white h-[42px] px-5 hover:opacity-80 transition-opacity disabled:opacity-40" style={{ ...mono, fontSize: 13, fontWeight: 700 }}>
          {saving ? '저장 중...' : '설정 완료'}
        </button>
      </div>
    </div>
  );
}

/* ─── STEP 3: 완료 ─── */
function Step3({ form, onStart }) {
  const rows = [
    ['운동 목표', form.goal],
    ['주간 운동 횟수', form.freq],
    ['최근 체중', form.weightKg ? `${form.weightKg} kg` : '미입력'],
    ['골격근량', form.skeletalMuscleMassKg ? `${form.skeletalMuscleMassKg} kg` : '미입력'],
    ['체지방률', form.bodyFatPct ? `${form.bodyFatPct}%` : '미입력'],
  ];
  return (
    <div className="flex flex-col items-center gap-6 pt-6">
      <div className="w-[52px] h-[52px] rounded-full bg-[#fff2f1] flex items-center justify-center">
        <span className="material-symbols-outlined text-[#ff1c1e]" style={{ fontSize: 30 }}>check</span>
      </div>
      <h1 style={{ ...mono, fontSize: 26, fontWeight: 700, color: '#161415' }}>맞춤 설정이 완료되었습니다</h1>
      <p style={{ ...mono, fontSize: 13, color: '#6b6f76' }}>입력한 정보를 기반으로 회원님에게 맞는 운동 루틴과 인바디 분석을 준비했습니다.</p>
      <div className="border border-[rgba(183,186,196,0.6)] p-6 w-[420px]">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between py-2">
            <span style={{ ...mono, fontSize: 13, color: '#6b6f76' }}>{k}</span>
            <span style={{ ...mono, fontSize: 13, fontWeight: 700, color: '#161415' }}>{v}</span>
          </div>
        ))}
      </div>
      <button onClick={onStart} className="bg-[#161415] text-white h-[46px] px-10 hover:opacity-80 transition-opacity" style={{ ...mono, fontSize: 14, fontWeight: 700 }}>시작하기</button>
    </div>
  );
}

const INITIAL_FORM = {
  nickname: '', birthDate: '', email: '', phone: '', bio: '',
  profileImageUrl: '', gender: '남성',
  heightCm: '', weightKg: '', targetWeightKg: '', goalTargetDate: '',
  goal: '체지방 감소', career: '6개월 ~ 1년', freq: '주 3회', time: '60분', pains: ['없음'],
  measuredAt: today(),
  skeletalMuscleMassKg: '', bodyFatMassKg: '', bodyFatPct: '', bmrKcal: '',
};

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  /* 회원가입은 유저 INSERT가 아니라 로그인으로 이미 만들어진 유저의 UPDATE다
   * (signup_profile_api_spec.md 0장). 그래서 진입 시 현재 값을 불러와 채운다 —
   * 이름은 소셜 로그인에서 받은 값이고, 재진입 시 이전 입력도 그대로 보여야 한다.
   * 토큰이 없으면 401이 나는데, 그때는 빈 폼으로 두고 저장 시점에 안내한다. */
  useEffect(() => {
    let cancelled = false;
    getMe()
      .then((me) => {
        if (cancelled || !me) return;
        setName(me.name ?? '');
        setForm((f) => ({
          ...f,
          nickname: me.nickname ?? f.nickname,
          birthDate: me.birthDate ?? f.birthDate,
          email: me.email ?? f.email,
          phone: me.phone ?? f.phone,
          bio: me.bio ?? f.bio,
          profileImageUrl: me.profileImageUrl ?? f.profileImageUrl,
          gender: labelOf(GENDER, me.gender) ?? f.gender,
          heightCm: me.heightCm ?? f.heightCm,
          targetWeightKg: me.targetWeightKg ?? f.targetWeightKg,
          goalTargetDate: me.goalTargetDate ?? f.goalTargetDate,
          goal: labelOf(GOAL, me.goals?.[0]) ?? f.goal,
          career: labelOf(EXPERIENCE_LEVEL, me.experienceLevel) ?? f.career,
          freq: me.workoutFrequencyPerWeek ? `주 ${me.workoutFrequencyPerWeek}회` : f.freq,
          time: labelOf(WORKOUT_DURATION, me.workoutDuration) ?? f.time,
        }));
      })
      .catch(() => { /* 미로그인·조회 실패 — 빈 폼으로 진행 */ });
    return () => { cancelled = true; };
  }, []);

  /**
   * 회원가입 저장 (signup_profile_api_spec.md 0장 흐름)
   *  1) PUT /api/users/me      — 기본정보 · 운동목표 · 운동환경
   *  2) PUT /api/users/me/preferences — 불편한 부위 (운동 선호는 프로필 화면에서 이어서)
   *  3) POST /api/inbody       — '직접 입력'을 고른 경우에만
   * 유저 INSERT가 아니라 로그인으로 이미 만들어진 유저의 UPDATE라서 토큰이 반드시 필요하다.
   */
  async function handleSubmit() {
    if (saving) return;
    setError(null);

    const heightCm = toNumber(form.heightCm);
    const gender = GENDER[form.gender];

    // 백엔드 필수값 — 없으면 400 ProblemDetail이 오므로 앞단에서 먼저 잡는다 (명세 2-2 검증)
    if (!gender) {
      setStep(0);
      setError('성별을 남성 또는 여성으로 선택해 주세요. (백엔드 필수값)');
      return;
    }
    if (!heightCm || heightCm <= 0) {
      setStep(0);
      setError('키를 0보다 큰 숫자로 입력해 주세요. (백엔드 필수값)');
      return;
    }

    const profile = {
      nickname: form.nickname || null,
      gender,
      birthDate: toIsoDate(form.birthDate),
      email: form.email || null,
      phone: form.phone || null,
      profileImageUrl: form.profileImageUrl || null,
      bio: form.bio || null,
      heightCm,
      goals: toEnums(GOAL, [form.goal]),
      experienceLevel: EXPERIENCE_LEVEL[form.career] ?? null,
      workoutFrequencyPerWeek: toFrequency(form.freq),
      workoutDuration: WORKOUT_DURATION[form.time] ?? null,
      targetWeightKg: toNumber(form.targetWeightKg),
      targetMuscleKg: null,
      goalTargetDate: toIsoDate(form.goalTargetDate),
    };

    setSaving(true);
    try {
      await putMe(profile);
      await putPreferences({
        preferredWorkoutTypes: [],
        injuryParts: toEnums(INJURY_PART, form.pains),
      });

      const record = {
        measuredAt: toIsoDate(form.measuredAt),
        weightKg: toNumber(form.weightKg),
        bmrKcal: toNumber(form.bmrKcal),
        skeletalMuscleMassKg: toNumber(form.skeletalMuscleMassKg),
        bodyFatMassKg: toNumber(form.bodyFatMassKg),
        bodyFatPct: toNumber(form.bodyFatPct), // 유일한 nullable 항목
      };
      // 명세 2-4 검증 규칙 — 하나라도 비면 400이라, 인바디만 건너뛰고 프로필은 저장된 상태로 둔다
      const missing = !record.measuredAt || !record.weightKg || !record.bmrKcal
        || !record.skeletalMuscleMassKg || record.bodyFatMassKg == null;
      if (missing) {
        setError('인바디 항목(측정일·체중·기초대사량·골격근량·체지방량)을 모두 채워주세요. 프로필은 저장되었습니다.');
        setSaving(false);
        return;
      }
      await postInbody(record);

      setStep(2);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('로그인이 필요합니다. 회원가입은 구글 로그인 이후에 진행할 수 있습니다.');
      } else if (err instanceof ApiError && err.status === 409) {
        setError('같은 측정일의 인바디 기록이 이미 있습니다. 측정일을 바꿔주세요.');
      } else {
        setError(err?.message || '저장에 실패했습니다.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 로고 + 스텝 */}
      <div className="max-w-[1000px] mx-auto px-8">
        <div className="pt-6 flex items-center justify-between">
          <img src="/logo.png" alt="APEXAI" className="w-[90px] object-contain" />
          {name && (
            <span style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>
              <span style={{ fontWeight: 700, color: '#161415' }}>{name}</span>님으로 로그인됨
            </span>
          )}
        </div>
        <StepHeader current={step} />

        <div className="py-10">
          {step === 0 && (
            <>
              {error && (
                <div className="border border-[#ffb3b1] bg-[#fff2f1] px-4 py-3 mb-6">
                  <p style={{ ...mono, fontSize: 12, color: '#e2231a' }}>{error}</p>
                </div>
              )}
              {/* '나중에 설정' — 프로필 미완성 상태를 허용한다(database.md users 컬럼 nullable 근거).
                  이미 로그인된 상태라 로그인 화면이 아니라 메인으로 보낸다. */}
              <Step1 form={form} set={set} onNext={() => { setError(null); setStep(1); }} onLater={() => navigate('/chat')} />
            </>
          )}
          {step === 1 && (
            <Step2 form={form} set={set} onSubmit={handleSubmit} onPrev={() => setStep(0)}
              saving={saving} error={error} />
          )}
          {step === 2 && <Step3 form={form} onStart={() => navigate('/chat')} />}
        </div>
      </div>
    </div>
  );
}
