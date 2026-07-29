/* 인증 모듈 — 구글/카카오 OAuth2 로그인 + JWT(Access/Refresh) 관리
 *
 * 흐름 (back/*.md 기준):
 *  1) 로그인 버튼 → 브라우저를 GET {backend}/oauth2/authorization/{provider}로 top-level 이동
 *  2) 성공 시 백엔드가 {front}/oauth/callback?code=xxx 로 리다이렉트
 *  3) 콜백에서 code(60초 TTL·1회용)를 POST /api/auth/exchange 로 교환 → { accessToken, refreshToken }
 *  4) 이후 모든 API 요청에 Authorization: Bearer {accessToken}
 *  5) accessToken(15분) 만료 시 POST /api/auth/refresh 로 갱신, refreshToken(14일) 무효면 재로그인
 *
 * 토큰 보관: localStorage (SPA·서버렌더 없음, 백엔드가 JSON 바디로 토큰을 내려주는 현재 계약에 맞춤).
 */

// OAuth 진입점은 /api 하위가 아니라 백엔드 루트(Spring Security 기본 경로)라서 오리진을 따로 둔다.
export const BACKEND_ORIGIN = 'https://healthcarebelee-production.up.railway.app';
const AUTH_BASE = `${BACKEND_ORIGIN}/api/auth`;

const ACCESS_KEY = 'apex_access_token';
const REFRESH_KEY = 'apex_refresh_token';

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}
export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}
export function isAuthenticated() {
  return Boolean(getAccessToken());
}

export function setTokens({ accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
}
export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

/** 소셜 로그인 시작 — fetch가 아니라 브라우저를 직접 이동시켜야 한다 (top-level navigation). */
export function loginWith(provider /* 'google' | 'kakao' */) {
  window.location.href = `${BACKEND_ORIGIN}/oauth2/authorization/${provider}`;
}

/** code → 토큰 교환. 401(만료/이미 소비/없음)이면 예외. */
export async function exchangeCode(code) {
  const res = await fetch(`${AUTH_BASE}/exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) {
    const problem = await res.json().catch(() => null);
    throw new AuthError(problem?.detail || '로그인 코드 교환에 실패했습니다.', res.status);
  }
  const tokens = await res.json(); // { accessToken, refreshToken }
  setTokens(tokens);
  return tokens;
}

/** refreshToken으로 accessToken 재발급. 무효/만료면 토큰을 비우고 예외 → 재로그인 유도. */
export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new AuthError('로그인이 필요합니다.', 401);

  const res = await fetch(`${AUTH_BASE}/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    clearTokens();
    throw new AuthError('세션이 만료되었습니다. 다시 로그인해 주세요.', res.status);
  }
  const { accessToken } = await res.json();
  setTokens({ accessToken });
  return accessToken;
}

/** 로그아웃 — 토큰 제거. (백엔드 무효화 엔드포인트가 생기면 여기서 호출) */
export function logout() {
  clearTokens();
}

export class AuthError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}
