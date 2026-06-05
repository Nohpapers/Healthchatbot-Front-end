import React from 'react';
import { useNavigate } from 'react-router-dom';
import ToggleSwitch from './ToggleSwitch';

const SIDE_NAV = [
  { icon: 'chat', label: '채팅', to: '/chat' },
  { icon: 'history', label: '히스토리', to: '/history' },
  { icon: 'monitoring', label: '통계 분석', to: '/insights', active: true },
  { icon: 'settings', label: '설정', to: '/settings' },
];

const DEVICES = [
  {
    icon: 'watch',
    name: '스마트 워치',
    sync: '마지막 동기화: 10분 전',
    connected: true,
    actionIcon: 'sync',
    actionLabel: '데이터 재동기화',
  },
  {
    icon: 'scale',
    name: '스마트 체중계',
    sync: '마지막 동기화: 오늘 오전 07:30',
    connected: true,
    actionIcon: 'sync',
    actionLabel: '데이터 재동기화',
  },
  {
    icon: 'monitor_heart',
    name: '혈압계',
    sync: '마지막 동기화: 3일 전',
    connected: false,
    actionIcon: 'add_link',
    actionLabel: '기기 연결',
  },
];

const LOGS = [
  { date: '2023.10.27 14:30', icon: 'directions_walk', type: '걸음 수', value: '8,432 보', source: '스마트 워치' },
  { date: '2023.10.27 07:30', icon: 'monitor_weight', type: '체중', value: '72.4 kg', source: '스마트 체중계' },
  { date: '2023.10.26 22:00', icon: 'favorite', type: '심박수', value: '68 bpm', source: '스마트 워치' },
  {
    date: '2023.10.24 08:00',
    icon: 'monitor_heart',
    type: '혈압',
    value: '120/80 mmHg',
    source: '혈압계 (수동입력)',
    dim: true,
  },
];

function SideNavBar() {
  const navigate = useNavigate();
  const go = (to) => () => to && navigate(to);

  const inactive =
    'flex w-full cursor-pointer items-center gap-md px-lg py-3 text-left text-on-surface-variant transition-colors duration-200 hover:bg-surface-container-highest hover:text-on-surface';

  return (
    <nav className="fixed left-0 top-0 z-40 hidden h-screen w-72 flex-col border-r border-outline-variant bg-surface-container-low shadow-sm lg:flex">
      {/* Brand header */}
      <div className="flex items-center gap-sm p-lg">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-headline-md text-on-primary">
          H
        </div>
        <div>
          <h1 className="font-headline-lg text-xl leading-none text-primary">Health Assistant</h1>
          <p className="font-label-md text-label-md text-on-surface-variant">AI-Driven Wellness</p>
        </div>
      </div>

      {/* CTA */}
      <div className="px-lg pb-md">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-body-md font-medium text-on-primary transition-colors duration-200 hover:bg-inverse-surface"
        >
          <span className="material-symbols-outlined fill-icon text-[20px]">add</span>
          새 상담 시작
        </button>
      </div>

      {/* Nav items */}
      <ul className="mt-md flex flex-1 flex-col font-body-md text-body-md">
        {SIDE_NAV.map(({ icon, label, to, active }) => (
          <li key={label}>
            <button
              type="button"
              onClick={go(to)}
              className={
                active
                  ? 'flex w-full scale-95 cursor-pointer items-center gap-md border-r-4 border-primary bg-surface-container-high px-lg py-3 text-left font-bold text-primary'
                  : inactive
              }
            >
              <span
                className={
                  active ? 'material-symbols-outlined fill-icon text-[24px]' : 'material-symbols-outlined text-[24px]'
                }
              >
                {icon}
              </span>
              {label}
            </button>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="mt-auto border-t border-surface-container-high py-md font-body-md text-body-md">
        <button type="button" className={inactive}>
          <span className="material-symbols-outlined text-[24px]">help</span>
          도움말
        </button>
        <button
          type="button"
          className="flex w-full cursor-pointer items-center gap-md px-lg py-3 text-left text-error transition-colors duration-200 hover:bg-error-container hover:text-on-error-container"
        >
          <span className="material-symbols-outlined text-[24px]">logout</span>
          로그아웃
        </button>
      </div>
    </nav>
  );
}

function TopAppBar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between bg-surface px-4 shadow-md md:px-lg lg:hidden">
      <div className="font-headline-md text-2xl font-bold text-primary">HealthAI</div>
      <div className="flex items-center gap-md">
        <button type="button" className="text-secondary transition-opacity hover:text-primary hover:opacity-80">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button type="button" className="text-secondary transition-opacity hover:text-primary hover:opacity-80">
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      </div>
    </header>
  );
}

function DeviceCard({ icon, name, sync, connected, actionIcon, actionLabel }) {
  return (
    <div
      className={`flex flex-col rounded-xl border border-outline-variant bg-surface-container-lowest p-lg ${
        connected ? '' : 'opacity-70'
      }`}
    >
      <div className="mb-md flex items-start justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-lg ${
            connected ? 'bg-surface-container text-primary' : 'bg-surface-container-high text-outline'
          }`}
        >
          <span className="material-symbols-outlined text-[28px]">{icon}</span>
        </div>
        <span
          className={`rounded px-2 py-1 font-label-sm ${
            connected
              ? 'bg-secondary-fixed text-on-secondary-fixed'
              : 'bg-surface-container text-on-surface-variant'
          }`}
        >
          {connected ? '연동됨' : '연결 끊김'}
        </span>
      </div>
      <h4 className="mb-1 font-body-lg text-body-lg font-semibold text-on-surface">{name}</h4>
      <p className="mb-auto font-body-sm text-body-sm text-on-surface-variant">{sync}</p>
      <button
        type="button"
        className={
          connected
            ? 'mt-lg flex w-full items-center justify-center gap-2 rounded border border-outline-variant bg-surface py-2 font-label-md text-on-surface transition-colors hover:bg-surface-container-low'
            : 'mt-lg flex w-full items-center justify-center gap-2 rounded bg-primary py-2 font-label-md text-on-primary transition-colors hover:bg-inverse-surface'
        }
      >
        <span className="material-symbols-outlined text-[16px]">{actionIcon}</span>
        {actionLabel}
      </button>
    </div>
  );
}

function DataManagement() {
  return (
    <div className="flex h-screen overflow-hidden bg-background font-body-md text-on-background antialiased">
      <SideNavBar />

      <div className="flex h-full w-full flex-1 flex-col lg:ml-72">
        <TopAppBar />

        <main className="flex-1 overflow-y-auto bg-background p-margin-mobile md:p-margin-desktop">
          <div className="mx-auto max-w-[1200px] space-y-xl">
            {/* Page header */}
            <section>
              <h2 className="mb-sm font-headline-lg-mobile text-headline-lg-mobile text-on-surface md:font-headline-lg md:text-headline-lg">
                데이터 관리
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                연동된 기기 정보와 수집된 건강 데이터를 관리하세요.
              </p>
            </section>

            {/* Connected devices */}
            <section className="space-y-md">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">연동된 기기</h3>
              <div className="grid grid-cols-1 gap-lg md:grid-cols-3">
                {DEVICES.map((device) => (
                  <DeviceCard key={device.name} {...device} />
                ))}
              </div>
            </section>

            {/* Recent data log */}
            <section className="space-y-md">
              <div className="flex items-end justify-between">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">최근 데이터 로그</h3>
                <button type="button" className="font-label-md text-label-md text-primary hover:underline">
                  모두 보기
                </button>
              </div>
              <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead className="border-b border-outline-variant bg-surface-container-low font-label-md text-label-md uppercase text-on-surface-variant">
                      <tr>
                        <th className="px-md py-3 font-medium">일시</th>
                        <th className="px-md py-3 font-medium">유형</th>
                        <th className="px-md py-3 font-medium">값</th>
                        <th className="px-md py-3 font-medium">출처</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-high font-body-sm text-body-sm text-on-surface">
                      {LOGS.map((log) => (
                        <tr key={`${log.date}-${log.type}`} className="transition-colors hover:bg-surface-container-low">
                          <td className="px-md py-3 text-on-surface-variant">{log.date}</td>
                          <td className="flex items-center gap-2 px-md py-3">
                            <span
                              className={`material-symbols-outlined text-[16px] ${
                                log.dim ? 'text-outline' : 'text-primary'
                              }`}
                            >
                              {log.icon}
                            </span>{' '}
                            {log.type}
                          </td>
                          <td className={`px-md py-3 font-medium ${log.dim ? 'text-outline' : ''}`}>{log.value}</td>
                          <td className="px-md py-3 text-on-surface-variant">{log.source}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Privacy & management */}
            <section className="grid grid-cols-1 gap-lg pb-xl md:grid-cols-2">
              {/* Export & sync */}
              <div className="space-y-lg rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
                <h3 className="font-body-lg text-body-lg font-semibold text-on-surface">
                  데이터 내보내기 및 동기화
                </h3>
                <div className="flex items-center justify-between border-b border-surface-container-high py-2">
                  <div>
                    <h4 className="font-body-md text-body-md text-on-surface">자동 동기화 설정</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      백그라운드에서 주기적으로 데이터를 가져옵니다.
                    </p>
                  </div>
                  {/* Toggle switch */}
                  <ToggleSwitch defaultChecked id="toggle-sync" aria-label="자동 동기화 설정" />
                </div>
                <div className="pt-2">
                  <h4 className="mb-2 font-body-md text-body-md text-on-surface">데이터 내보내기</h4>
                  <div className="flex gap-sm">
                    <button
                      type="button"
                      className="flex-1 rounded border border-outline-variant bg-surface py-2 font-label-md text-on-surface transition-colors hover:bg-surface-container-low"
                    >
                      CSV 다운로드
                    </button>
                    <button
                      type="button"
                      className="flex-1 rounded border border-outline-variant bg-surface py-2 font-label-md text-on-surface transition-colors hover:bg-surface-container-low"
                    >
                      JSON 다운로드
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger zone */}
              <div className="flex flex-col justify-between space-y-md rounded-xl border border-error-container bg-surface-container-lowest p-lg">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-error">
                    <span className="material-symbols-outlined text-[20px]">warning</span>
                    <h3 className="font-body-lg text-body-lg font-semibold">데이터 초기화</h3>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    모든 기기 연동 정보와 서버에 저장된 개인 건강 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수
                    없습니다.
                  </p>
                </div>
                <button
                  type="button"
                  className="mt-auto w-full rounded bg-error py-2 font-label-md text-on-error transition-opacity hover:opacity-90"
                >
                  모든 데이터 삭제
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default DataManagement;
