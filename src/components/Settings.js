import React from 'react';
import { useNavigate } from 'react-router-dom';
import ToggleSwitch from './ToggleSwitch';

const SIDE_NAV = [
  { icon: 'chat', label: '채팅', to: '/chat' },
  { icon: 'history', label: '히스토리', to: '/history' },
  { icon: 'monitoring', label: '통계 분석', to: '/insights' },
  { icon: 'settings', label: '설정', to: '/settings', active: true },
];

const PROFILE = [
  ['이름', '홍길동'],
  ['이메일', 'hong.gd@example.com'],
  ['신체 정보', '178cm / 75kg'],
];

const GOALS = [
  { title: '체중 감량 (다이어트)', desc: '체지방 감소 위주 루틴' },
  { title: '근육량 증가 (벌크업)', desc: '근비대 훈련 중심 루틴', checked: true },
  { title: '체력 유지', desc: '균형 잡힌 웰니스 관리' },
];

const NOTIFS = [
  { label: '푸시 알림', on: true },
  { label: '운동 리마인더', on: true },
  { label: '마케팅 정보 수신', on: false },
];

const SIDEBAR_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD7VWeUqpdUL-5YreU4BC1RMyM6Yodp7cOY8zDyWmFGfxsfWRfvCmSO4bhqi8K16f64a83PukUE8u4SpBdE0Rsk-KmzVKfhv3fR9BuNHNKLYkvdGKYQhdvXwJL_296GXqtEJ0viSN_eyayvzrzz-MSVppgRRT5Uyqs9X4RwWI7UIZpJHW9wa60otI6CLklSbnWrC0fJIZEwJCGfjWdv1bRDQ9aSbhWEp668cYEygDrUDZPeadOB6iMv3MbBdjyiu1z4X47swsd28SOv';
const PROFILE_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAWTZNnP4Qiwrx8qTiai4dyXsmxrr-ReNH-dQSBTOL4u7edfzqhZ4UaQ-XPgKvbExw1ENS-nJOLLPy-NCYRtTD8-euaJev_WtHJpAlxXuhPhbzWcdnSQZX6n_ScVSa3ccyaEf5uSOT_UFr4MIT8gvRJbGnI2j0FLMHMTOmbc8FedQE6Qx8dUg17m20bM_ypeQM2hRPV22vyK65wwr27uNCYThAzscMp1vBrgUSKuEnJ390ispBUIRpSxveFT_S5A4cz-NTjmUFCn-nQ';

function SideNavBar() {
  const navigate = useNavigate();
  const go = (to) => () => to && navigate(to);

  const inactive =
    'flex w-full cursor-pointer items-center gap-md px-lg py-sm text-left font-body-md text-body-md text-on-surface-variant transition-colors duration-200 hover:bg-surface-container-highest hover:text-on-surface';

  return (
    <nav className="fixed left-0 top-0 z-40 hidden h-screen w-72 flex-col border-r border-outline-variant bg-surface-container-low shadow-sm lg:flex">
      {/* Header + CTA */}
      <div className="border-b border-outline-variant p-lg">
        <div className="flex items-center gap-md">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-surface-variant">
            <img alt="User profile" className="h-full w-full object-cover" src={SIDEBAR_AVATAR} />
          </div>
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-primary">HealthAI</h1>
            <p className="font-label-md text-label-md text-on-surface-variant">AI 기반 웰니스 케어</p>
          </div>
        </div>
        <button
          type="button"
          className="mt-lg flex w-full items-center justify-center gap-xs rounded-lg bg-primary px-md py-sm font-label-md text-label-md text-on-primary transition-opacity hover:opacity-90"
        >
          <span className="material-symbols-outlined filled text-[16px]">add</span>
          새 상담 시작
        </button>
      </div>

      {/* Nav items */}
      <div className="flex flex-1 flex-col gap-xs overflow-y-auto py-md">
        {SIDE_NAV.map(({ icon, label, to, active }) => (
          <button
            key={label}
            type="button"
            onClick={go(to)}
            className={
              active
                ? 'flex w-full scale-95 cursor-pointer items-center gap-md border-r-4 border-primary bg-surface-container-high px-lg py-sm text-left font-body-md text-body-md font-bold text-primary transition-transform'
                : inactive
            }
          >
            <span className={active ? 'material-symbols-outlined filled' : 'material-symbols-outlined'}>
              {icon}
            </span>
            {label}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-xs border-t border-outline-variant p-lg">
        <button
          type="button"
          className="flex w-full cursor-pointer items-center gap-md rounded-md px-md py-sm text-left font-body-md text-body-md text-on-surface-variant transition-colors duration-200 hover:bg-surface-container-highest hover:text-on-surface"
        >
          <span className="material-symbols-outlined">help</span>
          도움말
        </button>
        <button
          type="button"
          className="flex w-full cursor-pointer items-center gap-md rounded-md px-md py-sm text-left font-body-md text-body-md text-error transition-colors duration-200 hover:bg-error-container"
        >
          <span className="material-symbols-outlined">logout</span>
          로그아웃
        </button>
      </div>
    </nav>
  );
}

function TopAppBar() {
  return (
    <header className="sticky top-0 z-30 mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between bg-surface px-container-padding shadow-md lg:hidden">
      <div className="font-headline-md text-headline-md font-bold text-primary">HealthAI</div>
      <div className="hidden gap-lg md:flex">
        {['운동', '영양', '코칭'].map((label) => (
          <button
            key={label}
            type="button"
            className="font-label-md text-label-md text-secondary transition-opacity hover:text-primary hover:opacity-80"
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-sm">
        <button
          type="button"
          className="rounded-full p-xs text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-primary"
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button
          type="button"
          className="rounded-full p-xs text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-primary"
        >
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      </div>
    </header>
  );
}

function BottomNavBar() {
  const items = [
    { icon: 'fitness_center', label: '운동' },
    { icon: 'restaurant', label: '영양' },
    { icon: 'psychology', label: '코칭' },
  ];
  return (
    <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around rounded-t-xl bg-surface-container-highest px-4 py-3 shadow-[0_-4px_20px_rgba(14,16,30,0.06)] lg:hidden">
      {items.map(({ icon, label }) => (
        <button
          key={label}
          type="button"
          className="flex w-16 cursor-pointer flex-col items-center justify-center rounded-lg py-1 text-on-surface-variant transition-colors hover:bg-surface-variant"
        >
          <span className="material-symbols-outlined mb-1">{icon}</span>
          <span className="font-label-sm text-label-sm">{label}</span>
        </button>
      ))}
    </nav>
  );
}

function Settings() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-body-md text-on-background md:flex-row">
      <SideNavBar />

      <main className="relative flex min-h-screen flex-1 flex-col pb-20 lg:ml-72 lg:pb-0">
        <TopAppBar />

        <div className="mx-auto w-full max-w-4xl flex-1 space-y-xl p-margin-mobile md:p-margin-desktop">
          {/* Page header */}
          <div className="space-y-sm">
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary md:font-headline-lg md:text-headline-lg">
              설정
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              앱 환경과 사용자 프로필을 관리하세요.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 gap-lg md:grid-cols-2">
            {/* Profile card */}
            <div className="flex flex-col gap-lg rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm md:col-span-2">
              <div className="flex items-center justify-between border-b border-surface-container pb-md">
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary">person</span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">프로필 관리</h3>
                </div>
                <button
                  type="button"
                  className="rounded-lg border border-outline-variant bg-surface-container-low px-md py-sm font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-variant"
                >
                  편집
                </button>
              </div>
              <div className="flex items-center gap-lg">
                <div className="h-20 w-20 overflow-hidden rounded-full bg-surface-variant">
                  <img alt="User avatar" className="h-full w-full object-cover" src={PROFILE_AVATAR} />
                </div>
                <div className="flex-1 space-y-xs">
                  <div className="grid grid-cols-3 gap-md">
                    {PROFILE.map(([key, value]) => (
                      <React.Fragment key={key}>
                        <div className="col-span-1 font-label-md text-label-md uppercase text-on-surface-variant">
                          {key}
                        </div>
                        <div className="col-span-2 font-body-md text-body-md text-on-surface">{value}</div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Fitness goals card */}
            <div className="flex flex-col gap-md rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm">
              <div className="flex items-center gap-sm border-b border-surface-container pb-md">
                <span className="material-symbols-outlined text-primary">flag</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">운동 목표</h3>
              </div>
              <div className="space-y-md pt-sm">
                {GOALS.map(({ title, desc, checked }, i) => (
                  <React.Fragment key={title}>
                    {i > 0 && <div className="h-px w-full bg-surface-container" />}
                    <label className="group flex cursor-pointer items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-body-md text-body-md text-on-surface transition-colors group-hover:text-primary">
                          {title}
                        </span>
                        <span className="font-label-md text-label-md text-on-surface-variant">{desc}</span>
                      </div>
                      <input
                        type="radio"
                        name="goal"
                        defaultChecked={checked}
                        className="h-5 w-5 accent-primary"
                      />
                    </label>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Notifications + integration column */}
            <div className="flex flex-col gap-lg">
              {/* Notifications */}
              <div className="flex flex-col gap-md rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm">
                <div className="flex items-center gap-sm border-b border-surface-container pb-md">
                  <span className="material-symbols-outlined text-primary">notifications_active</span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">알림 설정</h3>
                </div>
                <div className="space-y-md pt-sm">
                  {NOTIFS.map(({ label, on }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="font-body-md text-body-md text-on-surface">{label}</span>
                      <ToggleSwitch defaultChecked={on} aria-label={label} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Data integration */}
              <div className="flex flex-col gap-md rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm">
                <div className="flex items-center gap-sm border-b border-surface-container pb-md">
                  <span className="material-symbols-outlined text-primary">sync</span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">데이터 연동</h3>
                </div>
                <div className="space-y-md pt-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-on-surface-variant">watch</span>
                      <span className="font-body-md text-body-md text-on-surface">스마트 워치 연동</span>
                    </div>
                    <button
                      type="button"
                      className="rounded bg-surface-container px-sm py-xs font-label-sm text-label-sm uppercase text-on-surface-variant transition-colors hover:bg-surface-variant"
                    >
                      연결됨
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-on-surface-variant">monitor_weight</span>
                      <span className="font-body-md text-body-md text-on-surface">스마트 체중계 연동</span>
                    </div>
                    <button
                      type="button"
                      className="rounded bg-primary px-sm py-xs font-label-sm text-label-sm uppercase text-on-primary transition-opacity hover:opacity-90"
                    >
                      연결하기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end pt-lg">
            <button
              type="button"
              className="rounded-lg bg-primary px-lg py-sm font-body-md text-body-md text-on-primary shadow-sm transition-opacity hover:opacity-90"
            >
              변경사항 저장
            </button>
          </div>
        </div>
      </main>

      <BottomNavBar />
    </div>
  );
}

export default Settings;
