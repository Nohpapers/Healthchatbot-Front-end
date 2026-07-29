import React, { useState } from 'react';
import Sidebar from './Sidebar';
import AiPanel from './AiPanel';
import { mono } from '../constants';

/* ─── 요약 통계 카드 데이터 ─── */
const STATS = [
  { icon: 'bar_chart', label: '총 운동 횟수', value: '24회', delta: '+12%', deltaLabel: '이전 기간 대비' },
  { icon: 'schedule', label: '총 운동 시간', value: '18시간 40분', delta: '+8%', deltaLabel: '이전 기간 대비' },
  { icon: 'fitness_center', label: '완료한 세트', value: '186세트', delta: '+15%', deltaLabel: '이전 기간 대비' },
  { icon: 'task_alt', label: '운동 완료율', value: '87%', delta: '+5%', deltaLabel: '이전 기간 대비' },
  { icon: 'local_fire_department', label: '연속 운동', value: '6일', delta: '최고 12일', deltaLabel: '' },
];

/* ─── 주간 운동 활동 (요일별 값) ─── */
const WEEKLY = [
  { day: '월', time: 62, sets: 24 },
  { day: '화', time: 84, sets: 31 },
  { day: '수', time: 48, sets: 18 },
  { day: '목', time: 100, sets: 38 },
  { day: '금', time: 72, sets: 27 },
  { day: '토', time: 40, sets: 15 },
  { day: '일', time: 26, sets: 9 },
];

/* ─── 부위별 운동 비율 ─── */
const PARTS = [
  { label: '등', pct: 24, color: '#ff1c1e' },
  { label: '가슴', pct: 20, color: '#e2231a' },
  { label: '하체', pct: 19, color: '#c81e16' },
  { label: '어깨', pct: 15, color: '#a01813' },
  { label: '팔', pct: 12, color: '#78120e' },
  { label: '코어', pct: 10, color: '#500c09' },
];

const INSIGHTS = [
  '지난달보다 주간 운동 횟수가 12% 증가했습니다.',
  '등과 가슴 운동 비중에 비해 하체 운동 비중이 낮습니다.',
  '최근 2주 동안 스쿼트 수행 횟수가 꾸준히 증가했습니다.',
  '회복을 위해 다음 운동은 코어 또는 가벼운 유산소 운동을 권장합니다.',
];

/* ─── 운동 캘린더 (2025년 7월, 강도 0~3) ─── */
const CAL_DAYS = [
  { d: null }, { d: null }, { d: 1, i: 2 }, { d: 2, i: 0 }, { d: 3, i: 3 }, { d: 4, i: 1 }, { d: 5, i: 0 },
  { d: 6, i: 0 }, { d: 7, i: 2 }, { d: 8, i: 3 }, { d: 9, i: 0 }, { d: 10, i: 2 }, { d: 11, i: 0 }, { d: 12, i: 1 },
  { d: 13, i: 0 }, { d: 14, i: 3 }, { d: 15, i: 2 }, { d: 16, i: 0 }, { d: 17, i: 1 }, { d: 18, i: 3 }, { d: 19, i: 0 },
  { d: 20, i: 1 }, { d: 21, i: 0 }, { d: 22, i: 3 }, { d: 23, i: 0 }, { d: 24, i: 3 }, { d: 25, i: 0 }, { d: 26, i: 0 },
  { d: 27, i: 0 }, { d: 28, i: 2 }, { d: 29, i: 1 }, { d: 30, i: 0 }, { d: 31, i: 0 }, { d: null }, { d: null },
];
const CAL_WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const INTENSITY = ['transparent', '#ffd6d5', '#ff8785', '#ff1c1e'];

/* ─── 최근 운동 기록 ─── */
const RECORDS = [
  { date: '07.24', routine: '등 집중 루틴', part: '등', time: '58분', sets: '21세트', rate: '100%', done: true },
  { date: '07.22', routine: '가슴·삼두 루틴', part: '가슴·팔', time: '46분', sets: '17세트', rate: '94%', done: true },
  { date: '07.20', routine: '하체 루틴', part: '하체', time: '39분', sets: '12세트', rate: '75%', done: false },
  { date: '07.18', routine: '어깨 루틴', part: '어깨', time: '42분', sets: '15세트', rate: '100%', done: true },
];

/* ─── 도넛 차트 (SVG) ─── */
function Donut({ data }) {
  const R = 70, STROKE = 26, C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <svg width={180} height={180} viewBox="0 0 180 180">
      <g transform="translate(90,90) rotate(-90)">
        {data.map((s) => {
          const len = (s.pct / 100) * C;
          const dash = <circle
            key={s.label}
            r={R} fill="none" stroke={s.color} strokeWidth={STROKE}
            strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset}
          />;
          offset += len;
          return dash;
        })}
      </g>
      <text x="90" y="95" textAnchor="middle" style={{ ...mono, fontSize: 13, fontWeight: 700, fill: '#161415' }}>
        Total
      </text>
    </svg>
  );
}

export default function Dashboard() {
  const [chartMode, setChartMode] = useState('time'); // 'time' | 'sets'
  const key = chartMode === 'time' ? 'time' : 'sets';
  const maxVal = Math.max(...WEEKLY.map((w) => w[key]));

  return (
    <div className="flex h-screen bg-white overflow-hidden" style={{ minWidth: 1100 }}>
      <Sidebar />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full max-w-[1000px] mx-auto px-8 pt-10 pb-12">

            {/* 헤더 */}
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 style={{ ...mono, fontSize: 30, fontWeight: 700, color: '#161415' }}>종합 데이터</h1>
                <p className="mt-1" style={{ ...mono, fontSize: 13, color: '#6b6f76' }}>최근 운동 기록을 종합 정리</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 border border-[#b7bac4] h-[42px] px-4 hover:bg-[#f7f7f7] transition-colors"
                  style={{ ...mono, fontSize: 13, fontWeight: 700, color: '#161415' }}>
                  최근 30일
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>expand_more</span>
                </button>
                <button className="border border-[#b7bac4] h-[42px] px-4 hover:bg-[#f7f7f7] transition-colors"
                  style={{ ...mono, fontSize: 13, color: '#161415' }}>
                  데이터 내보내기
                </button>
                <button className="flex items-center gap-1 bg-[#161415] text-white h-[42px] px-4 hover:opacity-80 transition-opacity"
                  style={{ ...mono, fontSize: 13, fontWeight: 700 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                  새 운동 기록
                </button>
              </div>
            </div>

            {/* 필터 */}
            <div className="flex items-center gap-4 mt-8">
              <button className="flex items-center gap-2 bg-[#f7f7f7] border border-[rgba(183,186,196,0.45)] h-[40px] px-4"
                style={{ ...mono, fontSize: 12, color: '#161415', fontWeight: 700 }}>
                운동 부위: 전체
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>expand_more</span>
              </button>
              <button className="flex items-center gap-2 bg-[#f7f7f7] border border-[rgba(183,186,196,0.45)] h-[40px] px-4"
                style={{ ...mono, fontSize: 12, color: '#161415', fontWeight: 700 }}>
                기록 상태: 전체
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>expand_more</span>
              </button>
              <button className="ml-auto" style={{ ...mono, fontSize: 12, color: '#ff1c1e', fontWeight: 700 }}>
                필터 초기화
              </button>
            </div>

            {/* 요약 통계 카드 */}
            <div className="grid grid-cols-5 gap-4 mt-6">
              {STATS.map((s) => (
                <div key={s.label} className="border border-[rgba(183,186,196,0.6)] p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[#161415]" style={{ fontSize: 15 }}>{s.icon}</span>
                    <span style={{ ...mono, fontSize: 11, color: '#6b6f76' }}>{s.label}</span>
                  </div>
                  <div style={{ ...mono, fontSize: 20, fontWeight: 700, color: '#161415' }}>{s.value}</div>
                  <div style={{ ...mono, fontSize: 10 }}>
                    <span style={{ color: '#ff1c1e', fontWeight: 700 }}>{s.delta}</span>
                    {s.deltaLabel && <span style={{ color: '#6b6f76' }}> {s.deltaLabel}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* 주간 운동 활동 */}
            <div className="border border-[rgba(183,186,196,0.6)] p-6 mt-6">
              <div className="flex items-center justify-between">
                <h2 style={{ ...mono, fontSize: 16, fontWeight: 700, color: '#161415' }}>주간 운동 활동</h2>
                <div className="flex">
                  {[['time', '운동 시간'], ['sets', '세트 수']].map(([mode, label]) => (
                    <button key={mode} onClick={() => setChartMode(mode)}
                      className={`h-[34px] px-4 border transition-colors ${chartMode === mode
                        ? 'bg-[#f0f0f0] border-[#161415]' : 'bg-white border-[#e5e7eb] hover:bg-[#f7f7f7]'}`}
                      style={{ ...mono, fontSize: 12, fontWeight: 700, color: '#161415' }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-end justify-between gap-4 h-[200px] mt-8 px-2">
                {WEEKLY.map((w) => (
                  <div key={w.day} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                    <div className="w-full max-w-[46px] bg-[#161415] transition-all"
                      style={{ height: `${(w[key] / maxVal) * 100}%` }} />
                    <span style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>{w.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 부위별 운동 비율 + 인사이트 */}
            <div className="border border-[rgba(183,186,196,0.6)] p-6 mt-6">
              <h2 style={{ ...mono, fontSize: 16, fontWeight: 700, color: '#161415' }}>부위별 운동 비율</h2>
              <div className="flex items-center gap-10 mt-4 flex-wrap">
                <Donut data={PARTS} />
                <div className="flex flex-col gap-2">
                  {PARTS.map((p) => (
                    <div key={p.label} className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3" style={{ background: p.color }} />
                      <span style={{ ...mono, fontSize: 12, color: '#161415', width: 44 }}>{p.label}</span>
                      <span style={{ ...mono, fontSize: 12, color: '#161415', fontWeight: 700 }}>{p.pct}%</span>
                    </div>
                  ))}
                </div>
                <ul className="flex-1 min-w-[280px] flex flex-col gap-3">
                  {INSIGHTS.map((t) => (
                    <li key={t} className="flex gap-2">
                      <span style={{ color: '#161415' }}>•</span>
                      <span style={{ ...mono, fontSize: 12, color: '#161415', lineHeight: 1.6 }}>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 운동 캘린더 */}
            <div className="border border-[rgba(183,186,196,0.6)] p-6 mt-6">
              <div className="flex items-center justify-between">
                <h2 style={{ ...mono, fontSize: 16, fontWeight: 700, color: '#161415' }}>운동 캘린더</h2>
                <span style={{ ...mono, fontSize: 13, fontWeight: 700, color: '#161415' }}>2025년 7월</span>
              </div>
              <div className="grid grid-cols-7 gap-2 mt-6">
                {CAL_WEEKDAYS.map((w) => (
                  <div key={w} className="text-center pb-2" style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>{w}</div>
                ))}
                {CAL_DAYS.map((c, i) => (
                  <div key={i} className="h-[34px] flex items-center justify-center rounded-full"
                    style={{ background: c.d ? INTENSITY[c.i] : 'transparent' }}>
                    {c.d && (
                      <span style={{ ...mono, fontSize: 12, fontWeight: c.i >= 2 ? 700 : 400, color: c.i >= 2 ? '#fff' : '#161415' }}>
                        {c.d}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 최근 운동 기록 */}
            <div className="border border-[rgba(183,186,196,0.6)] p-6 mt-6">
              <h2 style={{ ...mono, fontSize: 16, fontWeight: 700, color: '#161415' }}>최근 운동 기록</h2>
              <table className="w-full mt-6" style={mono}>
                <thead>
                  <tr className="border-b border-[#e5e7eb]" style={{ fontSize: 12, color: '#6b6f76' }}>
                    {['날짜', '운동 루틴', '운동 부위', '운동 시간', '완료 세트', '완료율', '상태', '메모'].map((h) => (
                      <th key={h} className="text-left font-normal pb-3 px-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RECORDS.map((r) => (
                    <tr key={r.date} className="border-b border-[#f0f0f0]" style={{ fontSize: 12, color: '#161415' }}>
                      <td className="py-5 px-2">{r.date}</td>
                      <td className="py-5 px-2">{r.routine}</td>
                      <td className="py-5 px-2">{r.part}</td>
                      <td className="py-5 px-2">{r.time}</td>
                      <td className="py-5 px-2">{r.sets}</td>
                      <td className="py-5 px-2">{r.rate}</td>
                      <td className="py-5 px-2">
                        <span className="inline-block px-3 py-1" style={{
                          fontWeight: 700,
                          background: r.done ? '#e5f6ea' : '#fde8e8',
                          color: r.done ? '#1f9d55' : '#e2231a',
                        }}>
                          {r.done ? '완료' : '미완'}
                        </span>
                      </td>
                      <td className="py-5 px-2">
                        <button className="hover:opacity-70" style={{ color: '#6b6f76' }}>노트</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>

        <AiPanel />
      </div>
    </div>
  );
}
