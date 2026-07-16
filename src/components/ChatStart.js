import React, { useState } from 'react';
import Sidebar from './Sidebar';
import AiPanel from './AiPanel';
import PresetDropdown from './PresetDropdown';

const mono = { fontFamily: "'Anonymous Pro', monospace" };

const UPPER_BODY_OPTIONS = ['이두·삼두', '가슴운동', '등 운동', '어깨운동', '코어 운동'];
const LOWER_BODY_OPTIONS = ['엉덩이', '허벅지', '종아리'];

const INBODY_ROWS = [
  { label: '체중 (kg)', value: '00.0' },
  { label: '골격근량(kg)', value: '00.0' },
  { label: '체지방량 (kg)', value: '00.0' },
];
const PROFILE_LINES = [
  '성명. 000', '성별. 남성', '키. 000cm',
  '체중. 000kg', '기초대사량. 000kcal',
  '목표. 0000 증가', '전날 운동. 상체 운동',
];
const BAR_HEIGHTS = [40, 65, 35, 70, 45, 55, 28];
const DATES = ['26.06.20', '26.06.20', '26.06.20', '26.06.20', '26.06.20', '26.06.20', '26.06.20'];
const SCALE_VALUES = ['55.0', '54.0', '53.0', '52.0', '51.0'];

/* ─── 막대 그래프 ─── */
function BarGraph() {
  return (
    <div className="flex-1 relative border border-[#b7bac4] px-1 py-1 h-[88px]">
      <div className="absolute inset-1 flex flex-col justify-between pointer-events-none">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="border-t border-[#ececec]" />
        ))}
      </div>
      <div className="relative flex items-end justify-around h-full gap-[2px]">
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
    <div className="flex gap-3 items-stretch">
      <div className="bg-[#161415] flex flex-col items-center justify-center gap-1 px-2 h-[88px] w-[125px] shrink-0">
        <span
          className="text-center leading-tight whitespace-nowrap"
          style={{ ...mono, fontSize: 10, fontWeight: 700, color: '#e5e7eb' }}
        >
          {label}
        </span>
        <span style={{ ...mono, fontSize: 19, fontWeight: 700, color: '#fff' }}>{value}</span>
        <div className="border border-[#b7bac4] rounded-full px-2 py-[1px]">
          <span style={{ ...mono, fontSize: 9, fontWeight: 700, color: '#fff' }}>표준</span>
        </div>
      </div>
      <BarGraph />
      <div className="flex flex-col justify-between w-8 shrink-0" style={{ height: 88 }}>
        {SCALE_VALUES.map((v) => (
          <span key={v} className="text-right block" style={{ ...mono, fontSize: 7, color: '#b7bac4' }}>{v}</span>
        ))}
      </div>
    </div>
  );
}

/* ─── 메인 화면 ─── */
export default function ChatStart() {
  const [input, setInput] = useState('');

  return (
    <div className="flex h-screen bg-white overflow-hidden" style={{ minWidth: 1100 }}>
      <Sidebar />

      <div className="flex-1 flex overflow-hidden pt-[70px]">
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="flex flex-col items-center w-full px-8">
            <div className="w-full max-w-[799px] flex flex-col">

              {/* 인사말 */}
              <div className="flex flex-col items-center text-center gap-[25px]">
                <h1 className="font-bold text-black leading-tight" style={{ ...mono, fontSize: 45 }}>
                  ooo님 반갑습니다.
                </h1>
                <p className="text-black" style={{ ...mono, fontSize: 25 }}>
                  지난 루틴을 기반하여 오늘은 상체 하시는 날입니다.
                </p>
              </div>

              {/* 채팅 입력창 */}
              <div className="flex items-center border-2 border-[#161415] mt-[35px]" style={{ height: 52 }}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="오늘의 루틴을 말씀해 주세요."
                  className="flex-1 h-full bg-transparent text-[#161415] outline-none px-4 placeholder-[#161415]/40"
                  style={{ ...mono, fontSize: 15 }}
                />
                <button
                  className="w-[52px] h-full flex items-center justify-center shrink-0 border-l-2 border-[#161415]
                             hover:bg-[#f7f7f7] transition-colors"
                >
                  <span className="material-symbols-outlined text-[#161415]" style={{ fontSize: 20 }}>send</span>
                </button>
              </div>

              {/* 운동 부위 프리셋 + 초기화 */}
              <div className="flex items-center gap-6 mt-[20px]">
                <PresetDropdown label="상체운동설정" options={UPPER_BODY_OPTIONS} />
                <PresetDropdown label="하체운동설정" options={LOWER_BODY_OPTIONS} />
                <button
                  type="button"
                  className="ml-auto bg-[#161415] text-white h-[42px] px-5 hover:opacity-80 transition-opacity"
                  style={{ ...mono, fontSize: 13, fontWeight: 700 }}
                >
                  설정 초기화
                </button>
              </div>

              {/* My Recent Inbody Data */}
              <div className="mt-[100px] pb-8">
                <div className="flex items-baseline gap-[13px] mb-2">
                  <span className="font-bold text-black" style={{ ...mono, fontSize: 20 }}>
                    My Recent Inbody Data
                  </span>
                  <span className="text-black" style={{ ...mono, fontSize: 12 }}>
                    Last Data 2026.06.20
                  </span>
                </div>

                <div className="border border-[#b7bac4] px-[14px] py-[9px] flex items-stretch gap-4">
                  <div className="bg-[#161415] px-[13px] pt-[15px] pb-[13px] w-[182px] shrink-0
                                  flex flex-col gap-[11px]">
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

                  <div className="flex-1 flex flex-col gap-4 justify-between">
                    {INBODY_ROWS.map((row) => (
                      <InbodyRow key={row.label} label={row.label} value={row.value} />
                    ))}
                  </div>

                  <div className="bg-[#161415] w-[80px] shrink-0 flex flex-col items-center justify-end gap-1 pb-4">
                    <div className="relative border border-[#b7bac4] flex items-center justify-center" style={{ width: 44, height: 44 }}>
                      <span className="font-bold text-white" style={{ ...mono, fontSize: 22 }}> A</span>
                      <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-[#b7bac4] rounded-full -translate-y-0.5 translate-x-0.5" />
                    </div>
                    <span className="tracking-[0.2em] text-[#b7bac4]" style={{ ...mono, fontSize: 7 }}>APEXAI</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <AiPanel />
      </div>
    </div>
  );
}
