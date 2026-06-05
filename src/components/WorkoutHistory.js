import React from 'react';
import { useNavigate } from 'react-router-dom';

const SIDE_NAV = [
  { icon: 'chat', label: '채팅', to: '/chat' },
  { icon: 'history', label: '히스토리', to: '/history', active: true },
  { icon: 'monitoring', label: '통계 분석', to: '/insights' },
  { icon: 'settings', label: '설정', to: '/settings' },
];

const HISTORY = [
  {
    icon: 'fitness_center',
    iconWrap: 'bg-primary-container text-on-primary-container',
    date: '2023.10.24',
    intensity: '강도: 상',
    title: '하체 근력 강화 및 코어',
    desc: '스쿼트, 데드리프트 위주의 고중량 세션. 마지막 15분 코어 안정화 운동 진행.',
    accent: true,
    stats: [
      { label: '운동 시간', value: '65분' },
      { label: '소모 칼로리', value: '420 kcal' },
    ],
  },
  {
    icon: 'directions_run',
    iconWrap: 'bg-tertiary-container text-on-tertiary-container',
    date: '2023.10.22',
    intensity: '강도: 중',
    title: '인터벌 유산소 트레이닝',
    desc: '트레드밀 1분 전력질주, 2분 걷기 10세트 반복. 심폐지구력 향상 목적.',
    stats: [
      { label: '운동 시간', value: '45분' },
      { label: '평균 심박수', value: '145 bpm' },
    ],
  },
  {
    icon: 'pool',
    iconWrap: 'bg-primary-container text-on-primary-container',
    date: '2023.10.20',
    intensity: '강도: 중하',
    title: '회복 수영 세션',
    desc: '자유형 위주의 가벼운 페이스 수영. 관절 부담 최소화 및 전신 이완.',
    stats: [
      { label: '운동 시간', value: '50분' },
      { label: '이동 거리', value: '1.2 km' },
    ],
  },
  {
    icon: 'self_improvement',
    iconWrap: 'bg-surface-container-high text-on-surface-variant',
    date: '2023.10.18',
    intensity: '강도: 하',
    title: '모빌리티 & 스트레칭',
    desc: '전신 관절 가동범위 확보를 위한 동적 스트레칭 폼롤러 마사지 포함.',
    dimmed: true,
    stats: [],
  },
];

const KPIS = [
  { icon: 'local_fire_department', label: '총 소모량', value: '420', unit: 'kcal' },
  { icon: 'timer', label: '운동 시간', value: '65', unit: 'min' },
  { icon: 'vital_signs', label: '평균 심박수', value: '132', unit: 'bpm' },
  { icon: 'fitness_center', label: '총 볼륨', value: '8.4', unit: 'ton' },
];

const HR_BARS = [
  { h: '20%', color: 'bg-surface-variant' },
  { h: '40%', color: 'bg-secondary-container' },
  { h: '70%', color: 'bg-tertiary-fixed' },
  { h: '90%', color: 'bg-primary-fixed' },
  { h: '60%', color: 'bg-tertiary-fixed' },
  { h: '30%', color: 'bg-secondary-container' },
];

const MUSCLES = [
  { name: '대퇴사두근', pct: 45, barOpacity: '' },
  { name: '둔근', pct: 30, barOpacity: 'opacity-80' },
  { name: '코어', pct: 25, barOpacity: 'opacity-60' },
];

function SideNavBar() {
  const navigate = useNavigate();
  const go = (to) => () => to && navigate(to);

  const inactive =
    'flex w-full cursor-pointer items-center gap-md rounded-lg px-md py-sm text-left text-on-surface-variant transition-colors duration-200 hover:bg-surface-container-highest hover:text-on-surface';

  return (
    <nav className="fixed left-0 top-0 z-50 hidden h-screen w-72 flex-col border-r border-outline-variant bg-surface-container-low shadow-sm lg:flex">
      {/* Brand header */}
      <div className="flex items-center gap-sm p-lg">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-headline-md text-on-primary">
          H
        </div>
        <div>
          <h1
            className="font-headline-lg text-primary"
            style={{ fontSize: '24px', lineHeight: '32px' }}
          >
            건강 비서
          </h1>
          <p className="font-label-md text-label-md text-on-surface-variant">AI 기반 웰니스 케어</p>
        </div>
      </div>

      {/* CTA */}
      <button
        type="button"
        className="mx-lg my-md flex items-center justify-center gap-2 rounded-full bg-primary px-md py-sm font-label-md text-label-md text-on-primary transition-colors hover:bg-inverse-surface"
      >
        <span className="material-symbols-outlined text-[18px]">add</span> 새 상담 시작
      </button>

      {/* Nav items */}
      <div className="mt-sm flex flex-1 flex-col gap-xs overflow-y-auto px-md pb-md">
        {SIDE_NAV.map(({ icon, label, to, active }) => (
          <button
            key={label}
            type="button"
            onClick={go(to)}
            className={
              active
                ? 'flex w-full scale-95 cursor-pointer items-center gap-md rounded-lg border-r-4 border-primary bg-surface-container-high px-md py-sm text-left font-bold text-primary transition-transform'
                : inactive
            }
          >
            <span className={active ? 'material-symbols-outlined fill-icon' : 'material-symbols-outlined'}>
              {icon}
            </span>
            <span className="font-body-md text-body-md">{label}</span>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto flex flex-col gap-xs border-t border-outline-variant p-md">
        <button type="button" className={inactive}>
          <span className="material-symbols-outlined">help</span>
          <span className="font-body-md text-body-md">도움말</span>
        </button>
        <button
          type="button"
          className="flex w-full cursor-pointer items-center gap-md rounded-lg px-md py-sm text-left text-error transition-colors duration-200 hover:bg-error-container"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-body-md text-body-md">로그아웃</span>
        </button>
      </div>
    </nav>
  );
}

function TopAppBar() {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between bg-surface px-lg shadow-md lg:hidden">
      <div className="font-headline-md text-headline-md font-bold text-primary">HealthAI</div>
      <div className="hidden items-center gap-md md:flex">
        {['운동', '영양', '코칭'].map((label) => (
          <button
            key={label}
            type="button"
            className="cursor-pointer font-label-md text-label-md text-secondary hover:text-primary"
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-sm">
        <button
          type="button"
          className="rounded-full p-2 text-on-surface transition-colors hover:bg-surface-variant"
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button
          type="button"
          className="rounded-full p-2 text-on-surface transition-colors hover:bg-surface-variant"
        >
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      </div>
    </header>
  );
}

function BottomNavBar() {
  return (
    <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around rounded-t-xl bg-surface-container-highest px-4 py-3 shadow-[0_-4px_20px_rgba(14,16,30,0.06)] lg:hidden">
      <button
        type="button"
        className="flex cursor-pointer flex-col items-center justify-center font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-variant"
      >
        <span className="material-symbols-outlined mb-1">fitness_center</span>
        Exercise
      </button>
      <button
        type="button"
        className="flex cursor-pointer flex-col items-center justify-center font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-variant"
      >
        <span className="material-symbols-outlined mb-1">restaurant</span>
        Nutrition
      </button>
      <button
        type="button"
        className="flex scale-90 cursor-pointer flex-col items-center justify-center rounded-full bg-primary-container px-4 py-1 font-label-sm text-label-sm text-on-primary-container transition-all"
      >
        <span className="material-symbols-outlined mb-1 fill-icon">psychology</span>
        Coaching
      </button>
    </nav>
  );
}

function HistoryCard({ icon, iconWrap, date, intensity, title, desc, stats = [], accent = false, dimmed = false }) {
  return (
    <article
      className={`group relative flex cursor-pointer flex-col gap-sm overflow-hidden rounded-xl border border-outline-variant bg-white p-md shadow-sm transition-colors hover:border-primary ${
        dimmed ? 'opacity-70' : ''
      }`}
    >
      {accent && (
        <div className="absolute right-0 top-0 -mr-4 -mt-4 h-16 w-16 rounded-full bg-gradient-to-br from-tertiary-fixed to-transparent opacity-20 transition-transform duration-500 group-hover:scale-150" />
      )}
      <div className="z-10 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${iconWrap}`}>
            <span className="material-symbols-outlined text-[16px]">{icon}</span>
          </div>
          <span className="rounded-md bg-surface-container-low px-2 py-0.5 font-label-md text-label-md text-on-surface-variant">
            {date}
          </span>
        </div>
        <span className="rounded-sm bg-surface-container-highest px-2 py-1 font-label-sm text-label-sm text-on-surface-variant">
          {intensity}
        </span>
      </div>
      <div className="z-10 mt-xs">
        <h3 className="font-body-lg text-body-lg font-bold text-on-surface transition-colors group-hover:text-primary">
          {title}
        </h3>
        <p className="mt-1 line-clamp-2 font-body-sm text-body-sm text-on-surface-variant">{desc}</p>
      </div>
      {stats.length > 0 && (
        <div className="z-10 mt-auto flex gap-md border-t border-outline-variant pt-md">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant">{s.label}</span>
              <span className="font-label-md text-label-md text-on-surface">{s.value}</span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

function AnalyticsPanel() {
  return (
    <aside className="relative hidden h-full w-full flex-shrink-0 overflow-y-auto border-l border-outline-variant bg-white sm:block md:w-80 lg:w-96">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-outline-variant bg-white/90 p-md backdrop-blur-md">
        <h3 className="flex items-center gap-2 font-body-md text-body-md font-bold text-on-surface">
          <span className="material-symbols-outlined text-[18px]">analytics</span> 세션 분석
        </h3>
        <span className="font-label-md text-label-md text-on-surface-variant">2023.10.24</span>
      </div>

      <div className="flex flex-col gap-lg p-md">
        {/* KPI metrics */}
        <div className="grid grid-cols-2 gap-sm">
          {KPIS.map(({ icon, label, value, unit }) => (
            <div key={label} className="rounded-lg border border-outline-variant bg-surface-container-low p-sm">
              <div className="mb-1 flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-[14px]">{icon}</span> {label}
              </div>
              <div className="font-headline-sm text-headline-sm text-on-surface">
                {value}
                <span className="ml-1 text-label-md font-normal text-on-surface-variant">{unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Heart-rate-zone bar chart (CSS art) */}
        <div className="mt-md">
          <h4 className="mb-sm font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
            심박수 존
          </h4>
          <div className="relative flex h-32 items-end gap-1 rounded-lg border border-outline-variant bg-surface-container-lowest p-2">
            {HR_BARS.map((b, i) => (
              <div key={i} className={`w-full rounded-t-sm ${b.color}`} style={{ height: b.h }} />
            ))}
            <div className="absolute bottom-[30%] w-full border-t border-dashed border-outline-variant opacity-50" />
            <div className="absolute bottom-[60%] w-full border-t border-dashed border-outline-variant opacity-50" />
            <div className="absolute bottom-[90%] w-full border-t border-dashed border-outline-variant opacity-50" />
          </div>
          <div className="mt-1 flex justify-between px-1">
            <span className="font-label-sm text-label-sm text-outline">웜업</span>
            <span className="font-label-sm text-label-sm text-outline">무산소</span>
          </div>
        </div>

        {/* Muscle group focus */}
        <div>
          <h4 className="mb-sm font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
            주요 타겟 부위
          </h4>
          <div className="rounded-lg border border-outline-variant bg-surface-container-low p-md">
            {MUSCLES.map(({ name, pct, barOpacity }, i) => (
              <React.Fragment key={name}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-body-sm text-body-sm text-on-surface">{name}</span>
                  <span className="font-label-md text-label-md text-on-surface-variant">{pct}%</span>
                </div>
                <div
                  className={`h-1.5 w-full rounded-full bg-surface-variant ${
                    i < MUSCLES.length - 1 ? 'mb-4' : ''
                  }`}
                >
                  <div
                    className={`h-1.5 rounded-full bg-primary ${barOpacity}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* AI insight card */}
        <div className="relative overflow-hidden rounded-xl bg-tertiary-container p-md text-on-tertiary-container shadow-sm">
          <div className="absolute -right-4 -top-4 opacity-10">
            <span className="material-symbols-outlined text-[100px]">smart_toy</span>
          </div>
          <h4 className="relative z-10 mb-2 flex items-center gap-1 font-label-md text-label-md">
            <span className="material-symbols-outlined text-[16px]">lightbulb</span> AI 에이전트 코멘트
          </h4>
          <p className="relative z-10 font-body-sm text-body-sm leading-relaxed opacity-90">
            "지난 세션 대비 하체 볼륨이 10% 증가했습니다. 충분한 단백질 섭취와 내일은 가벼운 회복 운동을 권장합니다."
          </p>
        </div>
      </div>
    </aside>
  );
}

function WorkoutHistory() {
  return (
    <div className="flex h-screen overflow-hidden antialiased selection:bg-primary-container selection:text-on-primary-container">
      <SideNavBar />

      <main className="flex h-screen flex-1 flex-col overflow-hidden bg-background lg:ml-72">
        <TopAppBar />

        <div className="relative flex flex-1 flex-col overflow-hidden md:flex-row">
          {/* History list */}
          <section className="flex-1 scroll-smooth overflow-y-auto p-md md:p-lg lg:p-xl">
            <header className="mb-lg flex items-end justify-between">
              <div>
                <h2 className="mb-xs font-headline-sm text-headline-sm text-on-surface">운동 히스토리</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  최근 30일간의 트레이닝 기록입니다.
                </p>
              </div>
              <div className="flex gap-sm">
                <button
                  type="button"
                  className="flex items-center gap-1 rounded-lg border border-outline-variant bg-surface-container px-3 py-1.5 font-label-md text-label-md transition-colors hover:bg-surface-variant"
                >
                  <span className="material-symbols-outlined text-[16px]">filter_list</span> 필터
                </button>
              </div>
            </header>

            <div className="grid grid-cols-1 gap-md md:grid-cols-2">
              {HISTORY.map((card) => (
                <HistoryCard key={card.title} {...card} />
              ))}
            </div>

            {/* Loading indicator */}
            <div className="flex items-center justify-center gap-2 py-lg text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
              <span className="font-label-md text-label-md">이전 기록 불러오는 중...</span>
            </div>
          </section>

          <AnalyticsPanel />
        </div>
      </main>

      <BottomNavBar />
    </div>
  );
}

export default WorkoutHistory;
