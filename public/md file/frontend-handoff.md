# 프론트엔드 전달 사항

프론트 개발자에게 전달할 배포 정보와 API 사용 안내. 엔드포인트별 요청/응답 스키마의 단일
출처는 여전히 [`api.md`](./api.md)이며, 이 문서는 그것을 대체하지 않고 "지금 붙여서 쓸 때
필요한 것"만 요약한다.

## 1. 배포 정보

| 항목 | 값 |
|---|---|
| Base URL | `https://healthcarebelee-production.up.railway.app` |
| Base path | `/api` (예: `https://healthcarebelee-production.up.railway.app/api/inbody/recent`) |
| 인증 | 없음 (MVP, 고정 더미 유저 1명) |

**동작 확인**: 인증이 없으므로 아래처럼 바로 호출해서 응답이 오면 서버가 정상 기동된 것이다.

```
GET /api/inbody/recent
```

인바디 기록이 없는 상태라면 `404`가 정상 응답이다 (아래 3장 참고). 500이나 응답 자체가
없는 경우만 장애로 본다.

## 2. 엔드포인트 요약

전체 요청/응답 스키마·검증 규칙·에러 포맷은 [`api.md`](./api.md) 2~3장 참고.

| 메서드 | 경로 | 용도 |
|---|---|---|
| GET | `/api/inbody/recent` | 메인 하단 인바디 패널 |
| POST | `/api/chat` | 코칭/영양 채팅. 최초 진입 시 인사말 요청(`message: null`)도 이 엔드포인트 |
| GET | `/api/chat/sessions?type=COACHING\|NUTRITION` | 좌측 최근 채팅내역 목록 |
| GET | `/api/chat/sessions/{sessionId}` | 세션 상세 (메시지 + 결과) |

## 3. 지금 붙일 때 주의할 점

- **메인 화면 진입 시 두 번 호출**: `POST /api/chat`(인사말, `sessionId`/`message` 모두 null)과
  `GET /api/inbody/recent`를 각각 호출해야 한다. 상단 인사말은 별도 프로필 API가 아니라
  채팅 응답의 `reply`다 (`api.md` 3.2).
- **`/api/inbody/recent`는 404가 정상 케이스**: 인바디 기록이 없는 유저는 항상 404를
  반환한다. 프론트는 "데이터 없음" 화면을 준비해야 한다.
- **CORS 미설정**: 백엔드에 CORS 설정이 아직 없다. 프론트가 별도 오리진(예:
  `localhost:3000`, Vercel 도메인 등)에서 브라우저로 직접 호출하면 현재는 막힌다. 프론트
  배포 도메인이 정해지면 알려달라 — `SecurityConfig`에 CORS 허용 오리진을 추가하겠다.
- **AI 응답은 동기 호출**: `POST /api/chat`은 AI 서버 응답을 기다렸다가 반환한다
  (스트리밍 없음). 읽기 타임아웃 30초로 걸려 있어 느릴 수 있으니 로딩 상태를 표시해야 한다.
- **`sessionId` 관리**: `POST /api/chat` 응답의 `sessionId`를 프론트가 상태로 들고 있어야 한다.
  같은 대화를 이어가려면 다음 요청에 이 값을 그대로 실어 보내고, `null`로 보내면 새 세션이
  생성된다. 좌측 최근 채팅내역에서 항목을 클릭해 상세를 조회할 때(`GET
  /api/chat/sessions/{sessionId}`)도 동일한 값을 쓴다. 로그인 세션이 아니라 채팅 세션 식별자이며,
  MVP는 인증 자체가 없다(1장).
- **에러 포맷은 RFC 7807**: 모든 에러가 `{ type, title, status, detail, instance }` 형태의
  `application/problem+json`이다. 커스텀 에러 바디는 없다 (`api.md` 1장).

## 4. 아직 없는 것 (프론트가 기대하면 안 되는 기능)

`api.md` 5장 미결 사항과 동일. 특히 프론트 화면에 버튼으로 보이지만 백엔드 엔드포인트가
없는 것들:

- 인바디 데이터 입력/등록 API (현재 조회만 가능)
- "진행시켜", "설정 초기화", "7월 식단표 제작", "식단표 수정", "종합 데이터" 버튼의 API
- 로그인/회원가입 (더미 유저 고정)

이 목록에 있는 버튼은 프론트에서 UI만 두고 동작은 보류하거나, 필요 순서를 알려주면
백엔드에서 우선순위를 맞추겠다.
