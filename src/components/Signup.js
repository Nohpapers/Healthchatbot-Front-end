import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mono } from '../constants';

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

/* ─── 라벨 + 입력 ─── */
function Input({ label, required, placeholder, value, unit, defaultValue }) {
  return (
    <label className="flex flex-col gap-2">
      {label && (
        <span style={{ ...mono, fontSize: 12, color: '#161415' }}>
          {label} {required && <span style={{ color: '#ff1c1e' }}>*</span>}
        </span>
      )}
      <div className="relative">
        <input placeholder={placeholder} defaultValue={defaultValue}
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

/* ─── STEP 1: 개인정보 ─── */
function Step1({ onNext, onLater }) {
  const [gender, setGender] = useState('남성');
  const [goal, setGoal] = useState('체지방 감소');
  const [career, setCareer] = useState('6개월 ~ 1년');
  const [freq, setFreq] = useState('주 3회');
  const [time, setTime] = useState('60분');
  const [pains, setPains] = useState(['없음']);
  const togglePain = (p) => setPains((l) => l.includes(p) ? l.filter((x) => x !== p) : [...l, p]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 style={{ ...mono, fontSize: 26, fontWeight: 700, color: '#161415' }}>기본 정보를 설정해 주세요</h1>
        <p className="mt-1" style={{ ...mono, fontSize: 13, color: '#6b6f76' }}>입력한 정보를 바탕으로 회원님에게 적합한 운동 루틴과 건강 분석을 제공합니다.</p>
      </div>

      {/* 프로필 이미지 */}
      <div className="border border-[rgba(183,186,196,0.6)] p-5 flex items-center gap-4">
        <div className="w-[56px] h-[56px] rounded-full bg-[#e5e7eb] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[#9aa0a6]" style={{ fontSize: 26 }}>person</span>
        </div>
        <div className="flex-1">
          <div style={{ ...mono, fontSize: 12, color: '#9aa0a6' }}>프로필 이미지</div>
          <div style={{ ...mono, fontSize: 11, color: '#9aa0a6' }}>JPG, PNG / 최대 5MB</div>
        </div>
        <button className="border border-[#e5e7eb] h-[38px] px-4 hover:bg-[#f7f7f7] transition-colors" style={{ ...mono, fontSize: 12, color: '#161415' }}>이미지 업로드</button>
        <button className="flex items-center gap-1 border border-[#161415] h-[38px] px-4 hover:bg-[#f7f7f7] transition-colors" style={{ ...mono, fontSize: 12, color: '#161415' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>삭제
        </button>
      </div>

      {/* 기본 개인정보 */}
      <Card title="기본 개인정보">
        <div className="flex flex-col gap-4">
          <Input label="이름" required placeholder="이름을 입력해 주세요" />
          <Input label="닉네임" required placeholder="닉네임을 입력해 주세요" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="생년월일" required placeholder="YYYY-MM-DD" />
            <Input label="성별" required placeholder="선택" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['남성', '여성', '선택 안 함'].map((g) => (
              <SelectBtn key={g} active={gender === g} onClick={() => setGender(g)}>{g}</SelectBtn>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="키" required placeholder="169" unit="cm" />
            <Input label="현재 체중" required placeholder="60" unit="kg" />
          </div>
        </div>
      </Card>

      {/* 운동 목표 */}
      <Card title="운동 목표" sub="하나의 주요 목표를 선택해 주세요">
        <div className="flex flex-col gap-3">
          {GOALS.map(([name, desc]) => {
            const active = goal === name;
            return (
              <button key={name} onClick={() => setGoal(name)}
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
            <SelectBtn key={c} variant="red" active={career === c} onClick={() => setCareer(c)}>{c}</SelectBtn>
          ))}
        </div>
      </Card>

      {/* 운동 환경과 빈도 */}
      <Card title="운동 환경과 빈도">
        <div style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>주당 운동 가능 횟수</div>
        <div className="flex flex-wrap gap-2 mt-3">
          {FREQ.map((f) => (
            <SelectBtn key={f} variant="dark" active={freq === f} onClick={() => setFreq(f)}>{f}</SelectBtn>
          ))}
        </div>
        <div className="mt-5" style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>1회 운동 가능 시간</div>
        <div className="flex flex-wrap gap-2 mt-3">
          {TIMES.map((t) => (
            <SelectBtn key={t} variant="dark" active={time === t} onClick={() => setTime(t)}>{t}</SelectBtn>
          ))}
        </div>
        <div className="mt-5" style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>운동 시 불편한 부위</div>
        <div className="flex flex-wrap gap-2 mt-3">
          {PAINS.map((p) => (
            <SelectBtn key={p} variant="dark" active={pains.includes(p)} onClick={() => togglePain(p)}>{p}</SelectBtn>
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
function Step2({ onNext, onPrev }) {
  const [mode, setMode] = useState('direct'); // 'direct' | 'skip'
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 style={{ ...mono, fontSize: 26, fontWeight: 700, color: '#161415' }}>인바디 정보를 입력해 주세요</h1>
        <p className="mt-1" style={{ ...mono, fontSize: 13, color: '#6b6f76' }}>최근 인바디 측정 결과를 입력하면 신체 구성에 맞는 운동과 식단을 추천할 수 있습니다.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setMode('direct')} className="h-[46px] border transition-colors"
          style={{ ...mono, fontSize: 13, fontWeight: 700, borderColor: mode === 'direct' ? '#ff1c1e' : '#e5e7eb', color: mode === 'direct' ? '#e2231a' : '#6b6f76' }}>직접 입력</button>
        <button onClick={() => setMode('skip')} className="h-[46px] border transition-colors"
          style={{ ...mono, fontSize: 13, fontWeight: 700, borderColor: mode === 'skip' ? '#ff1c1e' : '#e5e7eb', color: mode === 'skip' ? '#e2231a' : '#6b6f76' }}>인바디 정보 없이 시작</button>
      </div>

      {mode === 'direct' && (
        <>
          <Card title="측정 기본정보" sub="* 개인정보 설정에서 입력한 키와 체중이 자동으로 불러와졌습니다.">
            <div className="grid grid-cols-3 gap-4">
              <Input label="측정일" defaultValue="2025-07-20" />
              <Input label="키" defaultValue="169" unit="cm" />
              <Input label="체중" defaultValue="60" unit="kg" />
            </div>
          </Card>
          <Card title="신체 구성 정보">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ ...mono, fontSize: 12, fontWeight: 700, color: '#161415' }}>골격근량</span>
                  <span className="px-2 py-[1px]" style={{ ...mono, fontSize: 9, fontWeight: 700, background: '#ffd6d5', color: '#e2231a' }}>핵심</span>
                </div>
                <Input defaultValue="28.4" unit="kg" />
                <div className="mt-1" style={{ ...mono, fontSize: 11, color: '#6b6f76' }}>예시: 28.4kg</div>
              </div>
              <div>
                <div style={{ ...mono, fontSize: 12, color: '#161415', marginBottom: 8 }}>체지방량</div>
                <Input defaultValue="10.2" unit="kg" />
                <div className="mt-1" style={{ ...mono, fontSize: 11, color: '#6b6f76' }}>예시: 10.2kg</div>
              </div>
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ ...mono, fontSize: 12, fontWeight: 700, color: '#161415' }}>체지방률</span>
                  <span className="px-2 py-[1px]" style={{ ...mono, fontSize: 9, fontWeight: 700, background: '#ffd6d5', color: '#e2231a' }}>핵심</span>
                </div>
                <Input defaultValue="18.5" />
                <div className="mt-1" style={{ ...mono, fontSize: 11, color: '#6b6f76' }}>예시: 18.5%</div>
              </div>
              <div className="mt-4">
                <div style={{ ...mono, fontSize: 12, color: '#161415', marginBottom: 8 }}>기초대사량</div>
                <Input defaultValue="1520" unit="kcal" />
                <div className="mt-1" style={{ ...mono, fontSize: 11, color: '#6b6f76' }}>예시: 1520kcal</div>
              </div>
            </div>
          </Card>
        </>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onPrev} className="border border-[#b7bac4] h-[42px] px-5 hover:bg-[#f7f7f7] transition-colors" style={{ ...mono, fontSize: 13, color: '#161415' }}>이전</button>
        <button onClick={onNext} className="bg-[#161415] text-white h-[42px] px-5 hover:opacity-80 transition-opacity" style={{ ...mono, fontSize: 13, fontWeight: 700 }}>설정 완료</button>
      </div>
    </div>
  );
}

/* ─── STEP 3: 완료 ─── */
function Step3({ onStart }) {
  const rows = [
    ['운동 목표', '근육 증가'],
    ['주간 운동 횟수', '주 3회'],
    ['최근 체중', '60 kg'],
    ['골격근량', '28.4 kg'],
    ['체지방률', '18.5%'],
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

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  return (
    <div className="min-h-screen bg-white">
      {/* 로고 + 스텝 */}
      <div className="max-w-[1000px] mx-auto px-8">
        <div className="pt-6">
          <img src="/logo.png" alt="APEXAI" className="w-[90px] object-contain" />
        </div>
        <StepHeader current={step} />

        <div className="py-10">
          {step === 0 && <Step1 onNext={() => setStep(1)} onLater={() => navigate('/')} />}
          {step === 1 && <Step2 onNext={() => setStep(2)} onPrev={() => setStep(0)} />}
          {step === 2 && <Step3 onStart={() => navigate('/chat')} />}
        </div>
      </div>
    </div>
  );
}
