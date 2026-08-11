import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiBaseUrl, rawRequest } from '../api/client';
import { isAuthenticated } from '../api/auth';
import { mono } from '../constants';

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

const PRESETS = [
  {
    label: 'GET 인바디 조회',
    method: 'GET',
    path: '/inbody/recent',
    body: '',
  },
  {
    label: 'POST 인사말 요청',
    method: 'POST',
    path: '/chat',
    body: JSON.stringify(
      { type: 'COACHING', message: null, sessionId: null, settings: null },
      null,
      2
    ),
  },
  {
    label: 'POST 일반 대화',
    method: 'POST',
    path: '/chat',
    body: JSON.stringify(
      {
        type: 'COACHING',
        message: '오늘 가슴 위주로 하고 싶어',
        sessionId: null,
        settings: { upperBody: '가슴', lowerBody: null, durationMinutes: 60 },
      },
      null,
      2
    ),
  },
  {
    label: 'GET 세션 목록',
    method: 'GET',
    path: '/chat/sessions?type=COACHING',
    body: '',
  },
  {
    label: 'GET 세션 상세',
    method: 'GET',
    path: '/chat/sessions/{sessionId}',
    body: '',
  },
  { label: 'GET 내 프로필', method: 'GET', path: '/users/me', body: '' },
  {
    label: 'PUT 회원가입1 저장',
    method: 'PUT',
    path: '/users/me',
    body: JSON.stringify(
      {
        nickname: '길동이',
        gender: 'MALE',
        birthDate: '1998-03-21',
        email: 'hong@example.com',
        phone: '010-1234-5678',
        heightCm: 175.0,
        goals: ['MUSCLE_GAIN'],
        experienceLevel: 'M6_1Y',
        workoutFrequencyPerWeek: 4,
        workoutDuration: 'M60',
        targetWeightKg: 72.0,
        targetMuscleKg: 35.0,
        goalTargetDate: '2026-12-31',
      },
      null,
      2
    ),
  },
  {
    label: 'PATCH 프로필 부분수정',
    method: 'PATCH',
    path: '/users/me',
    body: JSON.stringify({ nickname: '홍반장', targetWeightKg: 70.0 }, null, 2),
  },
  {
    label: 'POST 인바디 저장',
    method: 'POST',
    path: '/inbody',
    body: JSON.stringify(
      {
        measuredAt: '2026-07-16',
        weightKg: 74.5,
        bmrKcal: 1620,
        skeletalMuscleMassKg: 33.2,
        bodyFatMassKg: 14.1,
        bodyFatPct: 18.9,
      },
      null,
      2
    ),
  },
  { label: 'GET 운동 선호', method: 'GET', path: '/users/me/preferences', body: '' },
  {
    label: 'PUT 운동 선호',
    method: 'PUT',
    path: '/users/me/preferences',
    body: JSON.stringify({ preferredWorkoutTypes: ['WEIGHT', 'CARDIO'], injuryParts: ['NONE'] }, null, 2),
  },
  { label: 'GET AI 설정', method: 'GET', path: '/users/me/ai-settings', body: '' },
  { label: 'GET 알림 설정', method: 'GET', path: '/users/me/notification-settings', body: '' },
];

function statusColor(status, ok) {
  if (status === 0) return '#e2231a';
  if (ok) return '#1a8f3c';
  if (status >= 400 && status < 500) return '#b8860b';
  return '#e2231a';
}

export default function ApiTester() {
  const navigate = useNavigate();
  const [method, setMethod] = useState('GET');
  const [path, setPath] = useState('/inbody/recent');
  const [body, setBody] = useState('');
  const [bodyError, setBodyError] = useState(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  // 인사말 요청(sessionId:null) 응답에 담겨오는 sessionId를 붙잡아뒀다가,
  // 이어지는 대화 요청에 그대로 실어 보낼 수 있게 한다 (세션 생성 ↔ 재사용 흐름 확인용).
  const [capturedSessionId, setCapturedSessionId] = useState(null);

  const bodyAllowed = method !== 'GET' && method !== 'DELETE';
  const loggedIn = isAuthenticated();

  function applyPreset(preset) {
    setMethod(preset.method);
    setPath(preset.path);
    setBody(preset.body);
    setBodyError(null);
    setResult(null);
  }

  async function handleSend() {
    if (sending) return;
    setBodyError(null);

    let payload;
    if (bodyAllowed && body.trim()) {
      try {
        JSON.parse(body);
        payload = body;
      } catch {
        setBodyError('본문이 올바른 JSON 형식이 아닙니다.');
        return;
      }
    } else {
      payload = undefined;
    }

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    setSending(true);
    setResult(null);
    try {
      const res = await rawRequest(normalizedPath, { method, body: payload });
      setResult(res);
      if (res.body && typeof res.body === 'object' && res.body.sessionId) {
        setCapturedSessionId(res.body.sessionId);
      }
    } finally {
      setSending(false);
    }
  }

  function applySessionIdToBody() {
    if (!capturedSessionId) return;
    try {
      const parsed = JSON.parse(body || '{}');
      parsed.sessionId = capturedSessionId;
      setBody(JSON.stringify(parsed, null, 2));
      setBodyError(null);
    } catch {
      setBodyError('본문이 올바른 JSON 형식이 아니라 sessionId를 채울 수 없습니다.');
    }
  }

  function applySessionIdToPath() {
    if (!capturedSessionId) return;
    setPath((p) => p.replace('{sessionId}', capturedSessionId));
  }

  async function copySessionId() {
    if (!capturedSessionId) return;
    try {
      await navigator.clipboard.writeText(capturedSessionId);
    } catch {
      /* 클립보드 접근 불가 시 조용히 무시 */
    }
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[860px] mx-auto px-8 py-10 flex flex-col gap-6">

          <div className="flex items-center justify-between">
            <h1 className="font-bold text-black" style={{ ...mono, fontSize: 24 }}>API 테스트</h1>
            <button
              onClick={() => navigate('/chat')}
              className="border border-[#161415] px-4 h-[36px] hover:bg-[#f7f7f7] transition-colors"
              style={{ ...mono, fontSize: 12, fontWeight: 700, color: '#161415' }}
            >
              메인으로
            </button>
          </div>

          <p style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>
            Base URL: <span style={{ fontWeight: 700 }}>{apiBaseUrl()}</span>
            {' · '}
            토큰:{' '}
            <span style={{ fontWeight: 700, color: loggedIn ? '#1a8f3c' : '#e2231a' }}>
              {loggedIn ? '있음' : '없음'}
            </span>
          </p>

          {/* 토큰이 없으면 대부분의 엔드포인트가 401(또는 바디 검증이 먼저 걸려 400)을 준다.
              테스트 결과를 오해하지 않도록 원인을 먼저 알려준다. */}
          {!loggedIn && (
            <div className="border border-[#ffb3b1] bg-[#fff2f1] px-4 py-3">
              <p style={{ ...mono, fontSize: 12, color: '#e2231a' }}>
                로그인 토큰이 없습니다. 인증이 필요한 엔드포인트는 401을 반환하고,
                <span style={{ fontWeight: 700 }}> PUT /users/me · POST /inbody</span>는 바디 검증이 먼저
                걸려 400 &quot;Invalid request content.&quot;로 보입니다. 먼저 구글 로그인을 해주세요.
              </p>
            </div>
          )}

          {/* 프리셋 */}
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset)}
                className="border border-[#b7bac4] px-3 h-[32px] hover:bg-[#f7f7f7] transition-colors"
                style={{ ...mono, fontSize: 11, color: '#161415' }}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* 세션 ID 추적 — 인사말 응답의 sessionId를 이어지는 요청에 재사용하기 위함 */}
          <div className="border border-[#b7bac4] px-4 py-3 flex items-center gap-3 flex-wrap">
            <span style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>마지막으로 받은 sessionId:</span>
            <span
              className="flex-1 min-w-[200px] truncate"
              style={{ ...mono, fontSize: 12, color: capturedSessionId ? '#161415' : '#b7bac4', fontWeight: 700 }}
            >
              {capturedSessionId || '아직 없음 (인사말 요청을 먼저 보내보세요)'}
            </span>
            <button
              onClick={copySessionId}
              disabled={!capturedSessionId}
              className="border border-[#161415] px-3 h-[28px] hover:bg-[#f7f7f7] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ ...mono, fontSize: 11, fontWeight: 700, color: '#161415' }}
            >
              복사
            </button>
            <button
              onClick={applySessionIdToBody}
              disabled={!capturedSessionId}
              className="border border-[#161415] px-3 h-[28px] hover:bg-[#f7f7f7] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ ...mono, fontSize: 11, fontWeight: 700, color: '#161415' }}
            >
              본문에 채우기
            </button>
            <button
              onClick={applySessionIdToPath}
              disabled={!capturedSessionId || !path.includes('{sessionId}')}
              className="border border-[#161415] px-3 h-[28px] hover:bg-[#f7f7f7] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ ...mono, fontSize: 11, fontWeight: 700, color: '#161415' }}
            >
              경로에 채우기
            </button>
          </div>

          {/* 요청 폼 */}
          <div className="border border-[#161415] p-5 flex flex-col gap-4">
            <div className="flex gap-3">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="border border-[#161415] px-3 h-[42px] bg-white"
                style={{ ...mono, fontSize: 14, fontWeight: 700, color: '#161415' }}
              >
                {METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              <div className="flex-1 flex items-center border border-[#161415] h-[42px] px-3">
                <span style={{ ...mono, fontSize: 12, color: '#b7bac4' }} className="shrink-0">
                  {apiBaseUrl()}
                </span>
                <input
                  type="text"
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  placeholder="/inbody/recent"
                  className="flex-1 h-full bg-transparent outline-none px-1"
                  style={{ ...mono, fontSize: 13, color: '#161415' }}
                />
              </div>

              <button
                onClick={handleSend}
                disabled={sending}
                className="bg-[#161415] text-white px-6 h-[42px] hover:opacity-80 transition-opacity disabled:opacity-40"
                style={{ ...mono, fontSize: 13, fontWeight: 700 }}
              >
                {sending ? '전송 중...' : '전송'}
              </button>
            </div>

            <div>
              <label className="block mb-1" style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>
                요청 본문 (JSON){!bodyAllowed && ' — 이 메서드는 본문을 보내지 않습니다'}
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                disabled={!bodyAllowed}
                rows={8}
                placeholder='{ "type": "COACHING", "message": null, "sessionId": null, "settings": null }'
                className="w-full border border-[#b7bac4] p-3 outline-none disabled:bg-[#f7f7f7] disabled:text-[#b7bac4]"
                style={{ ...mono, fontSize: 12, color: '#161415', lineHeight: 1.6 }}
              />
              {bodyError && (
                <p className="mt-1" style={{ ...mono, fontSize: 12, color: '#e2231a' }}>{bodyError}</p>
              )}
            </div>
          </div>

          {/* 응답 */}
          {result && (
            <div className="border border-[#161415] p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className="px-3 py-1 font-bold text-white"
                  style={{ ...mono, fontSize: 13, backgroundColor: statusColor(result.status, result.ok) }}
                >
                  {result.status === 0 ? 'ERROR' : result.status} {result.statusText}
                </span>
                <span style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>{result.durationMs}ms</span>
                <span style={{ ...mono, fontSize: 12, color: '#6b6f76' }} className="truncate">{result.url}</span>
              </div>

              <pre
                className="border border-[#e5e7eb] bg-[#f7f7f7] p-4 overflow-x-auto whitespace-pre-wrap break-words"
                style={{ ...mono, fontSize: 12, color: '#161415', maxHeight: 420 }}
              >
                {result.body != null
                  ? (typeof result.body === 'string' ? result.body : JSON.stringify(result.body, null, 2))
                  : '(빈 응답 본문)'}
              </pre>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
