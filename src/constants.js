/* 앱 전역에서 공유하는 상수 — 여러 컴포넌트에 흩어져 있던 하드코딩 값의 단일 출처 */

/** 공통 모노스페이스 폰트 스타일 (모든 컴포넌트에서 동일하게 사용) */
export const mono = { fontFamily: "'Anonymous Pro', monospace" };

/** 운동 부위/시간 프리셋 옵션 (ChatStart, CoachingAI 공용) */
export const UPPER_BODY_OPTIONS = ['이두·삼두', '가슴운동', '등 운동', '어깨운동', '코어 운동'];
export const LOWER_BODY_OPTIONS = ['엉덩이', '허벅지', '종아리'];
export const TIME_OPTIONS = ['30분', '60분', '90분', '120분', '150분', '180분'];

/** 시간 프리셋 라벨 → API의 durationMinutes 값 */
export const DURATION_MINUTES = { '30분': 30, '60분': 60, '90분': 90, '120분': 120, '150분': 150, '180분': 180 };

/** 식단표 요일/끼니 (api.md enum과 1:1) */
export const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
export const MEAL_SLOTS = ['BREAKFAST', 'LUNCH', 'DINNER'];

/** 채팅 타입 (api.md enum) */
export const CHAT_TYPE = { COACHING: 'COACHING', NUTRITION: 'NUTRITION' };

/** 선택한 프리셋들로 백엔드에 보낼 채팅 메시지를 만든다 (ChatStart, CoachingAI 공용) */
export function buildPresetMessage({ upperBody, lowerBody, duration }) {
  const parts = [];
  if (upperBody) parts.push(`상체운동은 ${upperBody}`);
  if (lowerBody) parts.push(`하체운동은 ${lowerBody}`);
  if (duration) parts.push(`운동시간은 ${duration}`);
  return `${parts.join(', ')}(으)로 설정했어. 이 설정에 맞는 운동루틴을 추천해줘.`;
}

/** 프리셋 선택값을 API의 settings 객체로 변환 */
export function toSettings({ upperBody, lowerBody, duration }) {
  return {
    upperBody: upperBody ?? null,
    lowerBody: lowerBody ?? null,
    durationMinutes: duration ? DURATION_MINUTES[duration] : null,
  };
}
