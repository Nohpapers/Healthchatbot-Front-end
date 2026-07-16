/* API 클라이언트 — api.md 단일 출처 기준 (MVP: 인증 없음, 고정 더미 유저 1명) */

// 로컬 개발(npm start)에서는 package.json의 "proxy"를 통해 상대경로로 우회 호출한다
// (백엔드에 CORS가 아직 설정되지 않아, 배포된 빌드에서는 REACT_APP_API_BASE_URL로
// 실제 도메인을 지정하거나 배포 플랫폼의 리라이트/프록시로 우회해야 한다)
const BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === 'development' ? '/api' : 'https://healthcarebelee-production.up.railway.app/api');

/** RFC 7807 ProblemDetail을 그대로 담는 에러 */
export class ApiError extends Error {
  constructor(problem, status) {
    super(problem?.detail || problem?.title || `요청 실패 (${status})`);
    this.name = 'ApiError';
    this.status = status;
    this.problem = problem;
  }
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  } catch (networkError) {
    throw new ApiError({ title: '네트워크 오류', detail: '서버에 연결할 수 없습니다.' }, 0);
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

/** GET /api/chat/sessions?type=COACHING|NUTRITION */
export function getChatSessions(type) {
  return request(`/chat/sessions?type=${encodeURIComponent(type)}`, { method: 'GET' });
}

/** GET /api/chat/sessions/{sessionId} */
export function getChatSessionDetail(sessionId) {
  return request(`/chat/sessions/${encodeURIComponent(sessionId)}`, { method: 'GET' });
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
    res = await fetch(url, {
      method,
      headers: body != null ? { 'Content-Type': 'application/json' } : undefined,
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
