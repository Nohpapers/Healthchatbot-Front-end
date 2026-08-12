/* 화면의 한글 라벨 ↔ 백엔드 enum 매핑.
 * 값은 signup_profile_api_spec.md 2장의 검증 규칙과 1:1이다. 화면에서 고른 라벨을 그대로
 * 보내면 400(ProblemDetail)이 나므로, 요청을 만들 때 반드시 이 표를 통과시킨다.
 */

/** users.gender — api.md enum */
export const GENDER = { 남성: 'MALE', 여성: 'FEMALE', '선택 안 함': null };

/** users.goals[] ⊆ {MUSCLE_GAIN, FAT_LOSS, FITNESS, POSTURE, REHAB, HABIT} */
export const GOAL = {
  '근육량 증가': 'MUSCLE_GAIN',
  '체지방 감소': 'FAT_LOSS',
  '체력 향상': 'FITNESS',
  '자세 교정': 'POSTURE',
  '재활 및 회복': 'REHAB',
  '운동 습관 형성': 'HABIT',
  '운동습관 형성': 'HABIT', // Profile 화면의 표기 차이 흡수
};

/** users.experience_level ∈ {UNDER_6M, M6_1Y, Y1_2Y, OVER_2Y} */
export const EXPERIENCE_LEVEL = {
  '6개월 미만': 'UNDER_6M',
  '6개월 ~ 1년': 'M6_1Y',
  '1년 ~ 2년': 'Y1_2Y',
  '2년 이상': 'OVER_2Y',
};

/** users.workout_duration ∈ {UNDER_30, M60, M90, OVER_120} */
export const WORKOUT_DURATION = {
  '30분 이하': 'UNDER_30',
  '60분': 'M60',
  '90분': 'M90',
  '120분 이상': 'OVER_120',
};

/** user_preferences.preferred_workout_types[] */
export const WORKOUT_TYPE = {
  '웨이트 트레이닝': 'WEIGHT',
  '맨몸 운동': 'BODYWEIGHT',
  유산소: 'CARDIO',
  스트레칭: 'STRETCHING',
  '기능성 운동': 'FUNCTIONAL',
};

/** user_preferences.injury_parts[] */
export const INJURY_PART = {
  목: 'NECK',
  어깨: 'SHOULDER',
  팔꿈치: 'ELBOW',
  허리: 'WAIST',
  무릎: 'KNEE',
  손목: 'WRIST',
  발목: 'ANKLE',
  없음: 'NONE',
};

/** user_ai_settings.recommendation_style */
export const RECOMMENDATION_STYLE = {
  '안전성 강화형 우선': 'SAFETY',
  '운동 효과 우선': 'EFFECT',
  '짧고 간단한 운동 우선': 'SIMPLE',
  '새로운 운동 형태 우선': 'EXPLORE',
};

/** user_ai_settings.explanation_level */
export const EXPLANATION_LEVEL = { 간결하게: 'SIMPLE', 보통: 'STANDARD', 상세하게: 'DETAILED' };

/** user_ai_settings.coach_tone */
export const COACH_TONE = {
  '차분한 코치': 'CALM',
  '전문적인 트레이너': 'PRO',
  '동기부여 중심': 'MOTIVATION',
  '건조한 안내': 'CONCISE',
};

/** workout_logs.muscle_group — api.md 3.5 / database.md CHECK와 1:1. nullable(미분류 가능) */
export const MUSCLE_GROUP = {
  가슴: 'CHEST',
  등: 'BACK',
  어깨: 'SHOULDER',
  팔: 'ARM',
  하체: 'LOWER_BODY',
  코어: 'CORE',
  유산소: 'CARDIO',
};

/** workout_logs 조회 응답의 status (서버가 완료율 80% 기준으로 계산해 내려준다) */
export const WORKOUT_STATUS = { 완료: 'COMPLETED', 미완: 'INCOMPLETE' };

/** user_notification_settings.receive_channel */
export const RECEIVE_CHANNEL = { '앱 알림': 'APP', 이메일: 'EMAIL', '문자 알림': 'SMS' };

/** 주 N회 라벨 → workoutFrequencyPerWeek (1~7) */
export function toFrequency(label) {
  const n = Number(String(label).replace(/[^0-9]/g, ''));
  return n >= 1 && n <= 7 ? n : null;
}

/** 매핑 표를 뒤집어 enum → 한글 라벨로 되돌린다 (조회 응답을 화면에 채울 때). */
export function labelOf(table, enumValue) {
  if (enumValue == null) return null;
  return Object.keys(table).find((label) => table[label] === enumValue) ?? null;
}

/** 라벨 배열 → enum 배열. 매핑에 없는 값은 버린다(400 방지). */
export function toEnums(table, labels) {
  return (labels ?? []).map((l) => table[l]).filter(Boolean);
}

/** '1998.05.12' · '1998-05-12' · '19980512' → 'yyyy-MM-dd' (api.md 날짜 포맷). 실패 시 null */
export function toIsoDate(input) {
  if (!input) return null;
  const digits = String(input).replace(/[^0-9]/g, '');
  if (digits.length !== 8) return null;
  const iso = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  return Number.isNaN(new Date(iso).getTime()) ? null : iso;
}

/** 숫자 입력 문자열 → number. 빈 값·비숫자는 null (백엔드 검증에서 400 나는 걸 앞단에서 막는다) */
export function toNumber(input) {
  if (input == null || String(input).trim() === '') return null;
  const n = Number(String(input).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : null;
}
