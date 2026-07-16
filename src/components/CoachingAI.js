import React, { useState } from 'react';
import Sidebar from './Sidebar';
import AiPanel from './AiPanel';
import PresetDropdown from './PresetDropdown';
import { AiAvatar, MessageBubble, UserBubble, QuickReplyChip } from './AiChatWidgets';

const mono = { fontFamily: "'Anonymous Pro', monospace" };

const UPPER_BODY_OPTIONS = ['이두·삼두', '가슴운동', '등 운동', '어깨운동', '코어 운동'];
const LOWER_BODY_OPTIONS = ['엉덩이', '허벅지', '종아리'];
const TIME_OPTIONS = ['30분', '60분', '90분', '120분', '150분', '180분'];

const ROUTINE_STEPS = [
  '어깨너비보다 약간 넓게 바를 잡고 매달립니다. 가슴을 살짝 들어 올리고 복부와 엉덩이에 힘을 줍니다.',
  '어깨를 아래로 내린 뒤 팔꿈치를 옆구리 방향으로 당기면서 가슴을 바 쪽으로 올립니다. 턱이 바 높이까지 올라오면 천천히 내려옵니다.',
  '올라갈 때 숨을 내쉬고 내려갈 때 몸을 흔들거나 반동을 사용하지 말고, 어깨가 귀 쪽으로 올라가지 않게 합니다.',
];

export default function CoachingAI() {
  const [input, setInput] = useState('');
  const [progressed, setProgressed] = useState(false);

  return (
    <div className="flex h-screen bg-white overflow-hidden" style={{ minWidth: 1100 }}>
      <Sidebar />

      <div className="flex-1 flex overflow-hidden pt-[70px]">
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="flex flex-col items-center w-full px-8">
            <div className="w-full max-w-[900px] flex flex-col pb-8">

              {/* AI 메시지 1 */}
              <div className="flex gap-3 items-stretch">
                <AiAvatar icon="smart_toy" tag="COACHING" />
                <MessageBubble>
                  안녕하세요! OOO님! 오늘의 운동루틴을 선택해주세요. 스타일에 맞는 맞춤형 코칭을 추천해드리겠습니다.
                  지난 루틴을 보아 오늘 상체운동을 진행하시는 것을 추천드립니다. 관련된 운동 플랜을 만들까요?
                </MessageBubble>
              </div>
              {progressed ? (
                <UserBubble>진행시켜</UserBubble>
              ) : (
                <QuickReplyChip label="진행시켜" onClick={() => setProgressed(true)} />
              )}

              {progressed && (
                <>
                  {/* AI 메시지 2 */}
                  <div className="flex gap-3 items-stretch mt-6">
                    <AiAvatar icon="smart_toy" tag="COACHING" />
                    <MessageBubble>
                      말씀하신대로 상체루틴 운동루틴을 추천하여 제작하겠습니다.
                    </MessageBubble>
                  </div>

                  {/* 운동 루틴 카드 */}
                  <div className="border border-[#b7bac4] p-4 mt-4">
                    <h3 className="text-center font-bold" style={{ ...mono, fontSize: 16, color: '#161415' }}>
                      COACHING AI 운동루틴
                    </h3>

                    <div className="border border-[#161415] mt-3 p-5 flex gap-8">
                      {/* 왼쪽: 상세 설명 */}
                      <div className="flex-1">
                        <p className="text-center font-bold" style={{ ...mono, fontSize: 13, color: '#161415' }}>
                          COACHING AI 등운동 운동루틴
                        </p>
                        <p className="font-bold mt-4" style={{ ...mono, fontSize: 13, color: '#161415' }}>
                          운동 상세 설명
                        </p>
                        <ol className="mt-2 flex flex-col gap-3">
                          {ROUTINE_STEPS.map((step, i) => (
                            <li key={i} style={{ ...mono, fontSize: 11, color: '#161415', lineHeight: 1.7 }}>
                              {i + 1}. {step}
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* 오른쪽: 운동 이미지 */}
                      <div className="w-[170px] shrink-0 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="bg-[#e2231a] text-white rounded-full w-5 h-5 flex items-center justify-center font-bold shrink-0"
                            style={{ ...mono, fontSize: 11 }}
                          >
                            1
                          </span>
                          <span className="font-bold" style={{ ...mono, fontSize: 14, color: '#161415' }}>풀업</span>
                        </div>
                        <div className="w-full h-[140px] bg-[#f2f2f2] border border-[#e5e7eb] flex items-center justify-center">
                          <span className="material-symbols-outlined text-[#b7bac4]" style={{ fontSize: 40 }}>
                            fitness_center
                          </span>
                        </div>
                        <span className="text-center font-bold" style={{ ...mono, fontSize: 11, color: '#161415' }}>
                          3~4세트 | 8~12회
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* 운동 부위 / 시간 프리셋 + 초기화 */}
              <div className="flex items-center gap-6 mt-6 flex-wrap">
                <PresetDropdown label="상체운동설정" options={UPPER_BODY_OPTIONS} width={200} />
                <PresetDropdown label="하체운동설정" options={LOWER_BODY_OPTIONS} width={190} />
                <PresetDropdown label="시간설정" options={TIME_OPTIONS} width={160} />
                <button
                  type="button"
                  className="ml-auto bg-[#161415] text-white h-[42px] px-5 hover:opacity-80 transition-opacity"
                  style={{ ...mono, fontSize: 13, fontWeight: 700 }}
                >
                  설정 초기화
                </button>
              </div>

              {/* 채팅 입력창 */}
              <div className="flex items-center border-2 border-[#161415] mt-6" style={{ height: 52 }}>
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

            </div>
          </div>
        </div>

        <AiPanel />
      </div>
    </div>
  );
}
