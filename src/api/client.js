/* API 클라이언트 — api.md 단일 출처 기준. 인증은 구글/카카오 OAuth2 + JWT(Bearer). */

import { getAccessToken, refreshAccessToken, clearTokens } from './auth';

// 백엔드에 CORS가 없어 항상 같은 오리진의 상대경로로 호출하고, 프록시가 대신 전달한다:
//  - 로컬 개발(npm start): package.json의 "proxy"
//  - Vercel 배포: vercel.json의 rewrites (/api/* → Railway)
// 다른 환경에서 백엔드를 직접 가리켜야 하면 REACT_APP_API_BASE_URL로 덮어쓴다.
const BASE_URL = '/api';

/** RFC 7807 ProblemDetail을 그대로 담는 에러 */
export class ApiError extends Error {
  constructor(problem, status) {
    super(problem?.detail || problem?.title || `요청 실패 (${status})`);
    this.name = 'ApiError';
    this.status = status;
    this.problem = problem;
  }
}

/** accessToken을 실어 실제 fetch를 수행한다. */
function fetchWithAuth(path, options) {
  const token = getAccessToken();
  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}

/**
 * 인증이 필요한 API 호출. 401을 받으면 refreshToken으로 accessToken을 한 번 갱신하고
 * 원 요청을 재시도한다. 갱신까지 실패하면 토큰을 비우고 401을 그대로 던진다(재로그인 유도).
 */
async function request(path, options = {}, _retried = false) {
  let res;
  try {
    res = await fetchWithAuth(path, options);
  } catch (networkError) {
    throw new ApiError({ title: '네트워크 오류', detail: '서버에 연결할 수 없습니다.' }, 0);
  }

  // accessToken 만료로 401 → 조용히 갱신 후 1회 재시도
  if (res.status === 401 && !_retried) {
    try {
      await refreshAccessToken();
    } catch {
      clearTokens();
      throw new ApiError({ title: 'Unauthorized', detail: '세션이 만료되었습니다. 다시 로그인해 주세요.' }, 401);
    }
    return request(path, options, true);
  }

  if (res.status === 204) return null;

  const text = await res.text();
  const body = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new ApiError(body, res.status);
  }
  return body;
}

/** GET /api/inbody/recent — 기록 없으면 null (404는 정상 케이스) */
export async function getInbodyRecent() {
  try {
    return await request('/inbody/recent', { method: 'GET' });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

/**
 * POST /api/chat — 코칭/영양 채팅 공통, 인사말 요청도 동일 엔드포인트.
 * message/sessionId를 비우면(null) 인사말 요청.
 */
export function postChat({ type, message = null, sessionId = null, settings = null }) {
  return request('/chat', {
    method: 'POST',
    body: JSON.stringify({ type, message, sessionId, settings }),
  });
}

/**
 * GET /api/chat/sessions?type=&page=&size= — api.md 3.3.
 * 응답이 Spring Data의 Page 형식이라(content/totalPages/number) 화면이 쓰기 쉬운 모양으로 풀어준다.
 * 서버가 배열을 주던 이전 계약도 함께 받아준다(배포 시점 차이로 둘 중 하나가 올 수 있다).
 */
export async function getChatSessions(type, { page = 0, size = 20 } = {}) {
  const query = `type=${encodeURIComponent(type)}&page=${page}&size=${size}`;
  const body = await request(`/chat/sessions?${query}`, { method: 'GET' });

  if (Array.isArray(body)) {
    return { items: body, page: 0, totalPages: 1, total: body.length, hasNext: false };
  }
  const items = body?.content ?? [];
  const number = body?.number ?? page;
  const totalPages = body?.totalPages ?? 1;
  return {
    items,
    page: number,
    totalPages,
    total: body?.totalElements ?? items.length,
    // last가 오면 그걸 믿고, 없으면 페이지 번호로 판단한다
    hasNext: body?.last != null ? !body.last : number + 1 < totalPages,
  };
}

/** 세션 총 개수만 필요할 때 (대시보드 카드) — 첫 페이지의 totalElements만 읽고 끝낸다 */
export async function countChatSessions(type) {
  const res = await getChatSessions(type, { page: 0, size: 1 });
  return res.total;
}

/** GET /api/chat/sessions/{sessionId} */
export function getChatSessionDetail(sessionId) {
  return request(`/chat/sessions/${encodeURIComponent(sessionId)}`, { method: 'GET' });
}

/**
 * GET /api/inbody — 측정 이력 전체 (api.md 3.1b).
 * measuredAt 내림차순으로 오고, 기록이 없으면 404가 아니라 빈 배열이다(recent와 다름).
 * 추이 그래프는 과거→현재 순서가 필요해 오름차순으로 뒤집어 돌려준다.
 */
export async function getInbodyHistory() {
  const list = await request('/inbody', { method: 'GET' });
  return [...(list ?? [])].sort((a, b) => String(a.measuredAt).localeCompare(String(b.measuredAt)));
}

/** GET /api/workout-logs — 운동 수행 기록 전체, performedAt 내림차순 (api.md 3.6) */
export function getWorkoutLogs() {
  return request('/workout-logs', { method: 'GET' });
}

/** POST /api/workout-logs — 기록 저장. routineId가 있으면 AI 루틴 수행, 없으면 자유 입력 (3.5) */
export function createWorkoutLog(log) {
  return request('/workout-logs', { method: 'POST', body: JSON.stringify(log) });
}

/* ── 프로필 · 회원가입 (signup_profile_api_spec.md 2장) ── */

/** GET /api/users/me — 프로필 전체 + profileCompleted */
export function getMe() {
  return request('/users/me', { method: 'GET' });
}

/** PUT /api/users/me — 회원가입1 통째 저장. gender·heightCm가 필수(없으면 400) */
export function putMe(profile) {
  return request('/users/me', { method: 'PUT', body: JSON.stringify(profile) });
}

/** PATCH /api/users/me — 프로필 부분 수정. 보낸 키만 갱신된다 */
export function patchMe(partial) {
  return request('/users/me', { method: 'PATCH', body: JSON.stringify(partial) });
}

/** POST /api/inbody — 인바디 1건 저장(회원가입2 · 재측정). 201 + 저장 결과 */
export function postInbody(record) {
  return request('/inbody', { method: 'POST', body: JSON.stringify(record) });
}

/* ── 설정 3종. GET은 미생성 유저에서 404가 날 수 있어 null로 접는다 ── */

async function getSettings(path) {
  try {
    return await request(path, { method: 'GET' });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

/** GET · PUT /api/users/me/preferences — 운동 선호 (PUT은 upsert) */
export function getPreferences() {
  return getSettings('/users/me/preferences');
}
export function putPreferences(prefs) {
  return request('/users/me/preferences', { method: 'PUT', body: JSON.stringify(prefs) });
}

/** GET · PUT /api/users/me/ai-settings — AI 맞춤 설정 */
export function getAiSettings() {
  return getSettings('/users/me/ai-settings');
}
export function putAiSettings(settings) {
  return request('/users/me/ai-settings', { method: 'PUT', body: JSON.stringify(settings) });
}

/** GET · PUT /api/users/me/notification-settings — 알림 설정 */
export function getNotificationSettings() {
  return getSettings('/users/me/notification-settings');
}
export function putNotificationSettings(settings) {
  return request('/users/me/notification-settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}

export function apiBaseUrl() {
  return BASE_URL;
}

/**
 * 임의 메서드/경로/바디로 직접 호출하고, 예외를 던지지 않고 상태 코드와 바디를
 * 그대로 반환한다 (API 테스트 페이지용 — 200/404/에러 응답 전부 결과로 확인해야 하므로
 * request()의 throw-on-error 동작을 쓰지 않는다).
 */
export async function rawRequest(path, { method = 'GET', body } = {}) {
  const url = `${BASE_URL}${path}`;
  const startedAt = performance.now();

  let res;
  try {
    const token = getAccessToken();
    res = await fetch(url, {
      method,
      // 인증이 필요한 엔드포인트를 테스트 페이지에서도 그대로 찔러볼 수 있게 토큰을 실어 보낸다.
      // (없으면 백엔드가 401 "로그인이 필요합니다"를 돌려준다 — 그 자체도 확인 대상이다)
      headers: {
        ...(body != null ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body != null ? body : undefined,
    });
  } catch (networkError) {
    return {
      url,
      ok: false,
      status: 0,
      statusText: '네트워크 오류',
      body: null,
      raw: String(networkError),
      durationMs: Math.round(performance.now() - startedAt),
    };
  }

  const durationMs = Math.round(performance.now() - startedAt);
  const text = await res.text();
  let parsed = null;
  let parseError = false;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
      parseError = true;
    }
  }

  return {
    url,
    ok: res.ok,
    status: res.status,
    statusText: res.statusText,
    body: parseError ? text : parsed,
    raw: text,
    durationMs,
  };
}
