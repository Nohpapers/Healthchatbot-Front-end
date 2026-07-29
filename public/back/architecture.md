# Healthcare_BE 아키텍처 (MVP)

와이어프레임(`wirframe_main.png`, `wirframe_catbot.png`, `wirframe_chatbot_2.png`) 기반 설계.
MVP 목표는 기능 완성도가 아니라 **AI 서버 ↔ 백엔드 ↔ 프론트의 동작 관계 검증**이다.

## 1. 확정된 결정

| 항목 | 결정 |
|---|---|
| AI 서버 | 단일 서버, 요청의 `type`으로 코칭/영양 구분 |
| AI 응답 | 동기 JSON (스트리밍 없음) |
| 사용자 식별 | 구글 소셜 로그인 + JWT(Access/Refresh Token). `users`/`user_social_accounts`로 연동 |
| 저장 | 채팅 내역 + AI 생성 결과 모두 PostgreSQL DB |
| API 계약 | **백엔드가 정의**하고 AI/프론트가 맞춤 |
| 배포 | Railway |

## 2. 시스템 구성

```
[프론트 서버]  --HTTP/JSON-->  [백엔드 (이 레포)]  --HTTP/JSON-->  [AI 서버]
                                      |
                                      v
                              [PostgreSQL]
```

백엔드의 역할은 **컨텍스트 조립자(context assembler)** 다. AI 서버는 DB에 직접 접근하지 않는다.
AI가 필요로 하는 모든 컨텍스트(프로필·인바디·설정·대화 이력)를 백엔드가 DB에서 읽어 요청에 실어 보낸다.
→ AI 서버는 무상태(stateless)로 유지되고, 데이터 소유권은 백엔드에 남는다.

### 핵심 플로우 (채팅 1회)

```
1. FE  -> BE   POST /api/chat { type, message, settings, sessionId? }
2. BE  -> DB   로그인 유저 프로필 + 최신 인바디 + 세션 대화 이력 조회
3. BE  -> AI   POST /generate { type, message, profile, inbody, settings, history }
4. AI  -> BE   { reply, result }
5. BE  -> DB   사용자 메시지 + AI 응답 + result 저장
6. BE  -> FE   { sessionId, reply, result }
```

메인 화면 최초 진입 시에는 `POST /api/chat`(인사말 요청) + `GET /api/inbody/recent` 두 번을
호출한다. **별도 프로필 조회 API는 없다** — 상단 "ooo님 반갑습니다 / 지난 루틴을 기반하여
오늘은 상체 하시는 날입니다"도 AI가 생성하는 채팅의 일부이기 때문이다 (`api.md` 3.2). 즉 이전
설계와 달리 **첫 화면 로드 시점에도 AI 호출이 발생한다** — AI 서버 지연·장애가 첫 화면 표시에
바로 영향을 준다는 트레이드오프가 생긴다.

## 3. 백엔드 API (프론트 → 백엔드)

**요청/응답 스키마, 검증 규칙, 상태 코드, 에러 포맷은 [`api.md`](./api.md) 2~3장에 있다. 단일 출처는 그쪽이다.**

| 엔드포인트 | 역할 |
|---|---|
| `GET /api/inbody/recent` | My Recent Inbody Data 패널 |
| `POST /api/chat` | 코칭/영양 채팅 + 첫 인사말 (메인 입력창 포함, `type`으로 구분) |
| `GET /api/chat/sessions`, `/{sessionId}` | 좌측 "최근 채팅내역" |

메인 화면 하단 입력창도 `POST /api/chat`을 쓴다. 최초 진입 시 메인 채팅은 운동 AI이므로 `type`
기본값은 `COACHING`이고, 입력창의 "오늘의 루틴을 말씀해 주세요."는 placeholder일 뿐 실제
전송값이 아니다.

## 4. AI 서버 계약 (백엔드 → AI)

**요청/응답/`result` 스키마는 [`api.md`](./api.md) 4장에 있다. AI 서버와 실제로 연동되어 동작 중이다.**

DB에는 `result`를 통째로 저장하지 않고 정규화된 테이블(`routines`/`routine_exercises`,
`meal_plans`/`meal_plan_days`/`meal_plan_meals`)에 나눠 담는다 — 프론트/AI에 오가는 JSON 모양은
그대로이고, 백엔드가 저장 시 분해하고 조회 시 다시 조립한다.

## 5. DB 스키마 (PostgreSQL)

**DDL·인덱스·시드·설계 근거는 [`database.md`](./database.md)에 있다. 스키마의 단일 출처는 그쪽이다.**

| 테이블 | 역할 |
|---|---|
| `users` | 성명·성별·키·목표 증가량·전날 운동. MVP는 더미 1행 시드 |
| `user_social_accounts` | 소셜 로그인 연결 (구글, 추후 카카오 등). 유저 1명이 여러 provider 연결 가능 |
| `refresh_tokens` | JWT Refresh Token 저장소(JWT+DB 하이브리드로 즉시 무효화 가능). 로그인은 세션이 아니라 Access/Refresh Token 방식 |
| `inbody_records` | 체중·기초대사량·골격근량·체지방량의 측정 이력. 최신 1건을 메인 하단에 표시 |
| `chat_sessions` | 코칭/영양 대화 세션. 좌측 "최근 채팅내역" 목록 |
| `chat_messages` | 메시지 본문 (결과는 별도 테이블) |
| `routines` / `routine_exercises` | 코칭 결과 — 루틴 1개 : 운동 여러 개 |
| `meal_plans` / `meal_plan_days` / `meal_plan_meals` | 영양 결과 — 식단표 1개 : 요일 여러 개 : 끼니 여러 개 |

인바디는 시계열이고("Last Data 2026.06.20") 성명·성별은 측정마다 바뀌지 않으므로 프로필로 분리했다.
운동/식단 결과는 운동·끼니 단위 조회·집계("종합 데이터")를 위해 처음부터 정규화했다 — 트레이드오프는
`database.md` 5장 참고.

## 6. 패키지 구조

도메인별로 나누고, 각 도메인 안에서 `entity`/`repository`로 다시 나눈다.

```
com.example.Healthcare_BE
├── auth        # 구글 소셜 로그인 + JWT(CustomOAuth2UserService, JwtProvider, JwtAuthenticationFilter 등)
├── user        # User, UserSocialAccount, Gender, WorkoutType
├── inbody      # InbodyRecord
├── chat        # ChatSession, ChatMessage, ChatType, ChatRole
├── routine     # Routine(집합체 루트), RoutineExercise
└── mealplan    # MealPlan(집합체 루트) → MealPlanDay → MealPlanMeal
    각 도메인 = {도메인}/entity, {도메인}/repository
```

컨트롤러·서비스·AI 클라이언트·Security 설정은 구현이 끝났다 (각 도메인의 controller/service,
`chat/service/RestClientAiClient`, `config/SecurityConfig`).

프론트 서버가 별도 오리진(`https://healthchatbot-front-end-u557.vercel.app`)이므로
`SecurityConfig`에 해당 오리진을 허용하는 CORS 설정을 추가했다.
Spring Security의 `authorizeHttpRequests`는 여전히 permitAll이지만(토큰 없이도 요청 자체는
통과), `JwtAuthenticationFilter`가 `Authorization: Bearer` 헤더를 검증해 SecurityContext에
로그인 유저를 세팅하고, `UserService.getCurrentUser()`가 그 유저가 없으면 401을 던진다 —
실질적인 인증 요구는 이 지점에서 강제된다.

## 7. 미결 사항

API에 직접 영향을 주는 항목은 [`api.md`](./api.md) 5장에 정리했다 (인바디 쓰기 경로, 버튼 동작,
AI 서버 base URL 등). 그 외 항목:

- **막대 그래프 기준 구간**: 프론트 계산으로 가정함.
- **오늘의 추천 로직**: 더 이상 백엔드의 관심사가 아니다. AI가 `profile.previousWorkout`과
  `history`를 보고 스스로 정한다 (`api.md` 4.1) — 백엔드는 입력만 조립해서 넘긴다.
- **프로덕션 DB 호스팅**: Supabase 사용은 중단하기로 확정. 로컬 개발은 로컬 PostgreSQL로
  전환 완료했으나, Railway 배포 환경의 DB를 어디에 호스팅할지(Railway Postgres 플러그인 등)는
  아직 미결이다.
