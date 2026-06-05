import React from 'react';

const NAV_ITEMS = [
  { icon: 'history', label: '히스토리' },
  { icon: 'monitoring', label: '통계 분석' },
  { icon: 'settings', label: '설정' },
];

const SUGGESTIONS = [
  {
    icon: 'restaurant',
    title: '맞춤형 식단 추천',
    desc: '현재 건강 상태와 목표에 맞춘 일주일 단위의 식단 계획을 받아보세요.',
  },
  {
    icon: 'fitness_center',
    title: '주간 운동 루틴',
    desc: '근력 향상 및 체지방 감소를 위한 최적화된 운동 스케줄을 설계합니다.',
  },
  {
    icon: 'self_improvement',
    title: '스트레스 관리',
    desc: '수면 패턴 분석 및 멘탈 헬스케어를 위한 명상 가이드를 제공합니다.',
  },
  {
    icon: 'query_stats',
    title: '골격근 데이터 분석',
    desc: '최근 체성분 검사 결과를 바탕으로 한 심층적인 변화 추이를 확인하세요.',
  },
];

// 사이드바 메뉴 항목 공통 스타일 (아직 라우트가 없는 자리표시 버튼)
const NAV_ITEM_BASE =
  'flex w-full cursor-pointer items-center space-x-3 px-6 py-3 text-left transition-colors';

function SideNavBar() {
  return (
    <nav className="fixed left-0 top-0 z-40 hidden h-full w-72 flex-col border-r border-outline-variant bg-surface-container-low shadow-sm lg:flex">
      {/* Header */}
      <div className="flex items-center space-x-4 border-b border-outline-variant/50 p-6">
        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-outline-variant bg-surface-container-high">
          <img
            alt="User profile"
            className="h-full w-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbYPgpmHhLqGsijj3lbMOGia3dWVDyPzEff30c08clWBKv41QEyNvF91dPmfg_wN8CuNYUgX32gZ7UGbKyiN4bemNeNrf4n7zQFl9t3yjADs_6TERxiI0CcxL5_0BfWqszfA3NZJct4thH77fAO4HAujt9d2tVxyCQdGvijVsj63sBWe81LQwTm7sZyD8Oli5krux4dqTbu48_iJzbelElCHJu_f1znwQ7QHr95ZYnVWVKa10E9WnXZ2gKbSi8DPHrYoPu83aRz6qA"
          />
        </div>
        <div>
          <h2 className="font-headline-sm text-headline-sm tracking-tight text-primary">
            Health Assistant
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">AI-Driven Wellness</p>
        </div>
      </div>

      {/* CTA */}
      <div className="p-4">
        <button
          type="button"
          className="flex w-full items-center justify-center space-x-2 rounded-lg bg-primary px-4 py-3 font-label-md text-label-md text-on-primary shadow-sm transition-colors hover:bg-inverse-surface"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>새 상담 시작</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex-1 overflow-y-auto py-2">
        <ul className="space-y-1">
          {/* Active tab: Chat */}
          <li>
            <button
              type="button"
              className={`${NAV_ITEM_BASE} border-r-4 border-primary bg-surface-container-high font-bold text-primary`}
            >
              <span className="material-symbols-outlined filled">chat</span>
              <span className="font-label-md text-label-md">채팅</span>
            </button>
          </li>
          {/* Inactive tabs */}
          {NAV_ITEMS.map(({ icon, label }) => (
            <li key={label}>
              <button
                type="button"
                className={`${NAV_ITEM_BASE} duration-200 text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface`}
              >
                <span className="material-symbols-outlined">{icon}</span>
                <span className="font-label-md text-label-md">{label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer / Agent Status */}
      <div className="mt-auto border-t border-outline-variant/50">
        <ul className="py-2">
          <li>
            <button
              type="button"
              className={`${NAV_ITEM_BASE} duration-200 text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface`}
            >
              <span className="material-symbols-outlined">help</span>
              <span className="font-label-md text-label-md">도움말</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              className={`${NAV_ITEM_BASE} duration-200 text-error hover:bg-error/10`}
            >
              <span className="material-symbols-outlined">logout</span>
              <span className="font-label-md text-label-md">로그아웃</span>
            </button>
          </li>
        </ul>
        <div className="flex items-center space-x-2 border-t border-outline-variant/50 bg-surface-container px-6 py-4 text-xs text-on-surface-variant">
          <span className="h-2 w-2 rounded-full bg-[#10b981]" />
          <span className="font-label-sm text-label-sm">System Online</span>
        </div>
      </div>
    </nav>
  );
}

function TopAppBar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-outline-variant/50 bg-surface px-6 shadow-sm">
      {/* Brand (mobile only) */}
      <div className="lg:hidden">
        <span className="font-headline-md text-headline-md font-bold text-primary">HealthAI</span>
      </div>
      {/* Navigation links (desktop) */}
      <div className="hidden flex-1 justify-center lg:flex">
        <nav className="flex space-x-8">
          {['운동', '영양', '코칭'].map((label) => (
            <button
              key={label}
              type="button"
              className="flex h-16 cursor-pointer items-center font-label-md text-label-md text-secondary transition-colors hover:text-primary"
            >
              {label}
            </button>
          ))}
        </nav>
      </div>
      {/* Trailing icons */}
      <div className="flex items-center space-x-4 text-on-surface-variant">
        <button
          type="button"
          className="rounded-full p-1 transition-opacity hover:bg-surface-container-highest hover:opacity-80"
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button
          type="button"
          className="rounded-full p-1 transition-opacity hover:bg-surface-container-highest hover:opacity-80"
        >
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      </div>
    </header>
  );
}

function ChatStart() {
  return (
    <div className="flex min-h-screen bg-background font-body-md text-on-background antialiased">
      <SideNavBar />

      <main className="ml-0 flex min-h-screen flex-1 flex-col bg-surface lg:ml-72">
        <TopAppBar />

        {/* Central chat interface */}
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center p-8">
          {/* Greeting */}
          <div className="mb-12 animate-fade-in-up text-center">
            <h1 className="mb-4 font-headline-lg text-headline-lg tracking-tight text-primary">
              무엇을 도와드릴까요?
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              정확한 건강 인사이트와 AI 기반의 맞춤형 조언을 제공합니다.
            </p>
          </div>

          {/* Main input area */}
          <div className="group relative mb-16 w-full max-w-3xl">
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-outline-variant to-outline-variant opacity-20 blur transition duration-500 group-hover:opacity-40" />
            <div className="relative flex items-center rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm transition-all duration-200 hover:border-primary focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
              <button
                type="button"
                className="pl-5 pr-3 text-on-surface-variant transition-colors hover:text-primary"
              >
                <span className="material-symbols-outlined text-[28px]">mic</span>
              </button>
              <input
                type="text"
                placeholder="건강에 대해 무엇이든 물어보세요..."
                className="flex-1 border-none bg-transparent px-2 py-5 font-body-lg text-body-lg text-on-surface outline-none placeholder:text-on-surface-variant/60 focus:ring-0"
              />
              <button
                type="button"
                className="mr-3 flex items-center justify-center rounded-lg bg-primary p-3 text-on-primary transition-colors hover:bg-inverse-surface"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>

          {/* Quick action cards */}
          <div className="w-full max-w-3xl">
            <p className="mb-4 text-center font-label-md text-label-md uppercase tracking-widest text-on-surface-variant">
              추천 질문
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {SUGGESTIONS.map(({ icon, title, desc }) => (
                <button
                  key={title}
                  type="button"
                  className="group flex items-start rounded-lg border border-outline-variant bg-surface-container-lowest p-5 text-left transition-all duration-200 hover:border-primary hover:shadow-md"
                >
                  <div className="mr-4 rounded-md bg-surface-container-low p-2 transition-colors group-hover:bg-primary/5">
                    <span className="material-symbols-outlined text-primary">{icon}</span>
                  </div>
                  <div>
                    <h3 className="mb-1 font-body-md text-body-md font-semibold text-on-surface">
                      {title}
                    </h3>
                    <p className="line-clamp-2 font-body-sm text-body-sm text-on-surface-variant">
                      {desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ChatStart;
