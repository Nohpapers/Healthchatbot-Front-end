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

/** AI 응답 result.routine.exercises[].bodyPart — AI가 쓰는 9개 값 (백엔드 7개보다 세분화) */
export const AI_BODY_PART = {
  등: 'BACK',
  가슴: 'CHEST',
  이두: 'BICEPS',
  삼두: 'TRICEPS',
  어깨: 'SHOULDER',
  코어: 'CORE',
  엉덩이: 'GLUTES',
  허벅지: 'THIGH',
  종아리: 'CALF',
};

/**
 * AI 부위(9) → workout_logs.muscle_group(7).
 * DB CHECK가 7개라 AI 값을 그대로 저장하면 INSERT가 실패한다.
 * 원래는 백엔드가 routineId로 채우는 게 맞지만, 세션 상세 응답에 routine의 id가 없어
 * 프론트가 루틴을 기록으로 옮길 때는 직접 변환해 보낸다 (백엔드에 routineId 노출 요청 중).
 */
export const AI_BODY_PART_TO_MUSCLE_GROUP = {
  BACK: 'BACK',
  CHEST: 'CHEST',
  SHOULDER: 'SHOULDER',
  CORE: 'CORE',
  BICEPS: 'ARM',
  TRICEPS: 'ARM',
  GLUTES: 'LOWER_BODY',
  THIGH: 'LOWER_BODY',
  CALF: 'LOWER_BODY',
};

/** '3~4세트' · '8~12회' 처럼 범위로 오는 문자열에서 첫 숫자를 뽑는다.
 *  workout_logs의 plannedSets·reps는 integer라 변환이 필요하고, 범위의 하한을 택한다
 *  (상한을 계획으로 잡으면 정상 수행도 미달로 찍히기 때문). */
export function firstNumber(text) {
  const match = String(text ?? '').match(/\d+/);
  return match ? Number(match[0]) : null;
}

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

/**
 * 날짜 입력칸의 실시간 전처리 — 타이핑하는 동안 'yyyy-MM-dd' 모양을 유지한다.
 * 숫자만 남기고 4·6자리 뒤에 '-'를 넣으며, 8자리를 넘으면 자른다.
 * '1998.05.12'나 '1998/05/12'를 붙여넣어도 구분자가 정규화되고,
 * 지우기(백스페이스) 시에는 숫자가 줄어들면서 '-'도 자연히 사라진다.
 * 월/일은 두 자리가 채워진 순간에만 범위로 눌러준다(1~12, 1~31) — 입력 중에는 건드리지 않는다.
 */
export function formatDateInput(value) {
  const digits = String(value ?? '').replace(/\D/g, '').slice(0, 8);
  const year = digits.slice(0, 4);
  let month = digits.slice(4, 6);
  let day = digits.slice(6, 8);

  const clamp = (part, min, max) => {
    if (part.length < 2) return part;
    const n = Math.min(Math.max(Number(part), min), max);
    return String(n).padStart(2, '0');
  };
  month = clamp(month, 1, 12);
  day = clamp(day, 1, 31);

  if (digits.length <= 4) return year;
  if (digits.length <= 6) return `${year}-${month}`;
  return `${year}-${month}-${day}`;
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
