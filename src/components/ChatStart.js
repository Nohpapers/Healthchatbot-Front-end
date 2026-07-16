import React, { useState } from 'react';
import Sidebar from './Sidebar';
import AiPanel from './AiPanel';

const mono = { fontFamily: "'Anonymous Pro', monospace" };

const CHIPS = ['식사량 추천', '운동 추천', '건강루틴 추천', '러닝 루틴'];
const WORKOUT_TYPES = ['상체', '하체', '유산소'];
const INBODY_ROWS = [
  { label: '체중 (kg)',     value: '00.0' },
  { label: '골격근량(kg)',  value: '00.0' },
  { label: '체지방량 (kg)', value: '00.0' },
];
const PROFILE_LINES = [
  '성명. 000', '성별. 남성', '키. 000cm',
  '체중. 000kg', '기초대사량. 000kcal',
  '목표. 0000 증가', '전날 운동. 상체 운동',
];
const BAR_HEIGHTS = [40, 65, 35, 70, 45, 55, 28];
const DATES = ['26.06.20','26.06.20','26.06.20','26.06.20','26.06.20','26.06.20','26.06.20'];

/* ─── APEXAI 로고 ─── */
function ApexLogo({ dark = false }) {
  const border = dark ? 'border-[#b7bac4]' : 'border-[#161415]';
  const text   = dark ? 'text-white'       : 'text-[#161415]';
  const sub    = dark ? 'text-[#b7bac4]'   : 'text-[#161415]';
  const dot    = dark ? 'bg-[#b7bac4]'     : 'bg-[#161415]';
  const size   = dark ? 44 : 66;
  const fs     = dark ? 22 : 34;
  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative border ${border} flex items-center justify-center`}
        style={{ width: size, height: size }}
      >
        <span className={`font-bold ${text}`} style={{ ...mono, fontSize: fs }}> A</span>
        <div className={`absolute top-0 right-0 w-1.5 h-1.5 ${dot} rounded-full -translate-y-0.5 translate-x-0.5`} />
      </div>
      <span className={`mt-1 tracking-[0.2em] ${sub}`}
        style={{ ...mono, fontSize: dark ? 7 : 10 }}>APEXAI</span>
    </div>
  );
}

/* ─── 막대 그래프 ─── */
function BarGraph() {
  return (
    <div className="flex-1 border border-[#b7bac4] px-1 py-1 h-[61px]">
      <div className="flex items-end justify-around h-full gap-[2px]">
        {BAR_HEIGHTS.map((h, i) => (
          <div key={i} className="flex flex-col items-center justify-end h-full">
            <div className="bg-[#4b4e59] w-[10px]" style={{ height: `${h}%` }} />
            <span style={{ ...mono, fontSize: '5px', color: '#b7bac4', marginTop: 2 }}>
              {DATES[i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── 인바디 한 행 ─── */
function InbodyRow({ label, value }) {
  return (
    <div className="flex gap-3 items-center">
      <div className="bg-[#161415] flex flex-col items-center justify-center gap-1 py-1 h-[61px] w-[110px] shrink-0">
        <span style={{ ...mono, fontSize: 7, fontWeight: 700, color: '#b7bac4', textAlign: 'center', padding: '0 4px' }}>
          {label}
        </span>
        <span style={{ ...mono, fontSize: 15, fontWeight: 700, color: '#fff' }}>{value}</span>
        <div className="border border-[#b7bac4] rounded-full px-2">
          <span style={{ ...mono, fontSize: 7, fontWeight: 700, color: '#fff' }}>표준</span>
        </div>
      </div>
      <BarGraph />
      <div className="flex flex-col justify-around w-8 shrink-0" style={{ height: 61 }}>
        {['68.0','66.0','64.0','62.0','60.0'].map(v => (
          <span key={v} className="text-right block" style={{ ...mono, fontSize: 6, color: '#b7bac4' }}>{v}</span>
        ))}
      </div>
    </div>
  );
}

/* ─── 메인 화면 ─── */
export default function ChatStart() {
  const [input, setInput] = useState('');

  return (
    <div className="page-chat flex h-screen bg-white overflow-hidden" style={{ minWidth: 1100 }}>
      <Sidebar />

      {/* 오른쪽 전체 영역 */}
      <div className="flex-1 flex overflow-hidden">

        {/* 스크롤 가능한 콘텐츠 */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pt-[93px]">
          {/* 콘텐츠를 가로 중앙 정렬 */}
          <div className="flex flex-col items-center w-full px-8">
            <div className="w-full max-w-[799px] flex flex-col">

              {/* ── 인사말 (중앙 정렬) ── */}
              <div className="flex flex-col items-center text-center gap-[25px]">
                <h1 className="font-bold text-black leading-tight"
                  style={{ ...mono, fontSize: 45 }}>
                  ooo님 반갑습니다.
                </h1>
                <p className="text-black"
                  style={{ ...mono, fontSize: 25 }}>
                  지난 루틴을 기반하여 오늘은 상체 하시는 날입니다.
                </p>
              </div>

              {/* ── 추천 반응형 버튼 ── */}
              <div className="flex gap-[25px] flex-wrap items-center mt-[15px] overflow-hidden"
                style={{ maxHeight: 36 }}>
                {CHIPS.map((chip) => (
                  <button
                    key={chip}
                    className="flex items-center justify-center gap-[15px] bg-[#f7f7f7]
                               border border-[rgba(183,186,196,0.45)] h-[36px] px-[20px]
                               shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
                               hover:bg-[#efefef] transition-colors shrink-0"
                    style={{ ...mono, fontSize: 13, color: '#000' }}
                  >
                    {chip}
                    <span className="material-symbols-outlined" style={{ fontSize: 12 }}>close</span>
                  </button>
                ))}
              </div>

              {/* ── 채팅 입력창 ── */}
              <div className="flex items-center bg-[#f7f7f7] mt-[15px]"
                style={{ border: '5px solid #161415', height: 60 }}>
                <div className="flex-1 flex items-center px-2 overflow-hidden h-full">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="오늘의 루틴을 말씀해 주세요."
                    className="w-full bg-transparent text-[#161415] outline-none
                               placeholder-[#161415]/40 overflow-hidden text-ellipsis px-2"
                    style={{ ...mono, fontSize: 15 }}
                  />
                </div>
                <button
                  className="w-[60px] h-full flex items-center justify-center shrink-0
                             bg-[#f7f7f7] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
                             hover:opacity-70 transition-opacity"
                >
                  <span className="material-symbols-outlined text-[#161415]" style={{ fontSize: 22 }}>send</span>
                </button>
              </div>

              {/* ── 운동 종류 버튼 ── */}
              <div className="grid grid-cols-3 gap-[85px] mt-[25px]">
                {WORKOUT_TYPES.map((type) => (
                  <button
                    key={type}
                    className="bg-[#161415] flex items-center justify-center gap-[20px]
                               h-[50px] p-[10px] hover:opacity-80 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-white" style={{ fontSize: 22 }}>
                      fitness_center
                    </span>
                    <span className="text-white font-bold" style={{ ...mono, fontSize: 14 }}>{type}</span>
                  </button>
                ))}
              </div>

              {/* ── My Recent Inbody Data ── */}
              <div className="mt-[80px] pb-8">
                {/* 헤더 */}
                <div className="flex items-baseline gap-[13px] mb-2">
                  <span className="font-bold text-black" style={{ ...mono, fontSize: 20 }}>
                    My Recent Inbody Data
                  </span>
                  <span className="text-black" style={{ ...mono, fontSize: 12 }}>
                    Last Data 2026.06.20
                  </span>
                </div>

                {/* 테두리 박스 */}
                <div className="border border-[#b7bac4] px-[14px] py-[9px] flex items-end gap-4">
                  {/* 프로필 카드 */}
                  <div className="bg-[#161415] px-[13px] pt-[15px] pb-[13px] w-[182px] shrink-0
                                  flex flex-col gap-[11px]" style={{ minHeight: 215 }}>
                    <span style={{ ...mono, fontSize: 12, color: '#fff' }}>My Profile</span>
                    {PROFILE_LINES.map((line) => (
                      <span key={line} className="font-bold" style={{ ...mono, fontSize: 12, color: '#fff' }}>
                        {line}
                      </span>
                    ))}
                    <span className="text-center mt-auto" style={{ ...mono, fontSize: 8, color: '#fff' }}>
                      APEX AI
                    </span>
                  </div>

                  {/* 3개 그래프 */}
                  <div className="flex-1 flex flex-col gap-4">
                    {INBODY_ROWS.map((row) => (
                      <InbodyRow key={row.label} label={row.label} value={row.value} />
                    ))}
                  </div>

                  {/* APEXAI 로고 카드 */}
                  <div className="bg-[#161415] w-[80px] shrink-0 flex flex-col items-center
                                  justify-end pb-4" style={{ min1Height: 217 }}>
                    <ApexLogo dark />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* AI 버튼 패널 */}
        <AiPanel />
      </div>
    </div>
  );
}
