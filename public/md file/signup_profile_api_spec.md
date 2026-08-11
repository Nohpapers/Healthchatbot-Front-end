# 회원가입 / 프로필 API 명세

> 기준 브랜치: **`feature-v3-login`** (구글 로그인 + JWT 완비 + 프로필 확장 스키마)
> 작업 브랜치: `feature/signup-profile-api`
> 이 문서는 `api.md`에 없는 회원가입·프로필 쓰기 API를 새로 정의한다. 확정되면 `api.md` 3장에 병합한다.

---

## 0. 전제 · 공통 규약

**회원가입 흐름 (로그인이 유저를 먼저 만든다)**

1. 구글 소셜 로그인 → 백엔드가 `users`에 최소 row(`name`만) 생성 + `user_social_accounts` 연동 → JWT 발급 *(이미 구현됨)*
2. **회원가입1** (기본정보 · 운동목표 · 운동환경) → `PUT /api/users/me` 로 프로필 채움
3. **회원가입2** (인바디 측정 입력) → `POST /api/inbody` 로 저장

→ 따라서 회원가입 API는 유저를 새로 INSERT하는 게 아니라 **이미 존재하는 유저를 UPDATE**한다.
`users.gender` · `users.height_cm` 이 nullable인 이유가 이것 — 소셜 로그인 직후엔 비어 있다.

**공통 규약** (`api.md` 1장 그대로)

| 항목 | 규칙 |
|---|---|
| Base path | `/api` |
| Content-Type | `application/json` |
| 인증 | `Authorization: Bearer <accessToken>` → 컨트롤러에서 `userService.getCurrentUser()` 로 현재 유저 조회 |
| ID | UUID 문자열 |
| 날짜 | `date` = `yyyy-MM-dd`, timestamp = ISO-8601 offset |
| 필드 표기 | JSON camelCase ↔ DB snake_case (JPA 매핑) |
| enum | Java enum 대문자 그대로 JSON 노출 |
| 응답 | record DTO 직접 반환 (ResponseEntity·공통 래퍼 없음 — 기존 컨트롤러 스타일) |
| 에러 | RFC 7807 `ProblemDetail`, `@RestControllerAdvice` 에서 예외별 처리. 검증실패 `400` / 리소스 없음 `404` |

---

## 1. 선행 작업 — 엔티티 정합 (⚠️ API보다 먼저)

현재 스키마(`schema.sql`)는 확장됐는데 JPA 엔티티가 옛 상태다. `ddl-auto=validate` 로 Supabase에 붙이면
엔티티가 스키마와 정확히 맞아야 서버가 뜬다. 아래를 먼저 맞추지 않으면 **컴파일 에러 또는 구동 실패**.

### 1-1. `User` 엔티티 확장 (`user/entity/User.java`)

**추가 필드 (13)** — 모두 nullable (회원가입 스텝을 나중에 채우거나 미설정 상태 존재)

| 필드 (Java) | 컬럼 | 타입 | 비고 |
|---|---|---|---|
| `nickname` | `nickname` | `String` | |
| `birthDate` | `birth_date` | `LocalDate` | |
| `email` | `email` | `String` | 표시용 (인증은 추후) |
| `phone` | `phone` | `String` | |
| `bio` | `bio` | `String` | 자기소개 |
| `profileImageUrl` | `profile_image_url` | `String` | |
| `goals` | `goals` | `List<Goal>` | **Postgres `text[]`** — 매핑 주의(아래) |
| `experienceLevel` | `experience_level` | `ExperienceLevel` (enum) | |
| `workoutFrequencyPerWeek` | `workout_frequency_per_week` | `Integer` | 1~7 |
| `workoutDuration` | `workout_duration` | `WorkoutDuration` (enum) | |
| `targetWeightKg` | `target_weight_kg` | `BigDecimal` | |
| `targetMuscleKg` | `target_muscle_kg` | `BigDecimal` | |
| `goalTargetDate` | `goal_target_date` | `LocalDate` | |

**제거**: `targetGainKg` 필드
→ `UserProfileDto` 와 `UserService.toDto()` 가 `getTargetGainKg()` 를 참조 중이므로, 필드만 지우면 컴파일 에러.
`UserProfileDto` 의 `targetGainKg` 도 함께 제거하고(또는 `targetWeightKg`·`targetMuscleKg` 로 교체),
`toDto()` 매핑을 수정한다. ※ `UserProfileDto` 는 **AI 서버 컨텍스트용**(`api.md` 4.1)이라, 프론트 프로필
응답과는 별개 DTO를 새로 만든다(아래 2-1).

**신설 enum** (`user/entity/` — `database.md` CHECK와 1:1)

- `Goal`: `MUSCLE_GAIN`, `FAT_LOSS`, `FITNESS`, `POSTURE`, `REHAB`, `HABIT`
- `ExperienceLevel`: `UNDER_6M`, `M6_1Y`, `Y1_2Y`, `OVER_2Y`
- `WorkoutDuration`: `UNDER_30`, `M60`, `M90`, `OVER_120`

**`goals` (text[]) 매핑 주의** — Hibernate 6(Spring Boot 4.1)에서 `List<Enum>` ↔ Postgres `text[]` 매핑은
기본 지원이 아니다. 다음 중 하나로 처리:
- (권장) `List<String>` 으로 두고 `@JdbcTypeCode(SqlTypes.ARRAY)` + `@Column(columnDefinition = "text[]")`,
  enum 검증은 서비스단에서 (배열 CHECK를 백엔드에서 한다는 설계와 일치)
- 또는 `hypersistence-utils-hibernate-63` 의존성 추가 후 커스텀 타입
→ Claude Code에 위임 시 "빌드/구동으로 매핑 방식 검증"을 명시할 것.

**UPDATE용 도메인 메서드** — 엔티티가 `@NoArgsConstructor(PROTECTED)` + setter 없는 불변 스타일이므로,
`updateProfile(...)`(회원가입1 통째 채움)과 부분수정용 메서드를 엔티티에 추가한다.

### 1-2. `InbodyRecord` 엔티티 (`inbody/entity/InbodyRecord.java`)

- **추가**: `bodyFatPct` → `@Column(name = "body_fat_pct")` `BigDecimal` (nullable — 스키마상 not null 아님)
- `InbodyRecentResponse` 에도 `bodyFatPct` 추가 (GET/recent 응답 + AI 컨텍스트 재사용)
- 생성자에 `bodyFatPct` 파라미터 추가

### 1-3. 신설 엔티티 3개 + Repository

각각 `user_id` 에 `unique` (유저당 1행), `@OneToOne` 또는 `user_id` UUID 보관. `findByUserId(UUID)` 리포지토리.

- `UserPreferences` — `preferredWorkoutTypes List<String>`(`text[]`), `injuryParts List<String>`(`text[]`)
- `UserAiSettings` — `recommendationStyle`, `explanationLevel`, `coachTone` (각 enum 또는 String+검증) + 토글 5개(boolean)
- `UserNotificationSettings` — 알림 토글 7개(boolean) + `receiveChannel`

---

## 2. 엔드포인트

### 2-1. `GET /api/users/me` — 프로필 조회

로그인 유저의 프로필 전체 + 회원가입 완료 여부.

**응답 200**
```json
{
  "profileCompleted": true,
  "name": "홍길동",
  "nickname": "길동이",
  "gender": "MALE",
  "birthDate": "1998-03-21",
  "email": "hong@example.com",
  "phone": "010-1234-5678",
  "bio": "3대 400 목표",
  "profileImageUrl": "https://...",
  "heightCm": 175.0,
  "goals": ["MUSCLE_GAIN", "FAT_LOSS"],
  "experienceLevel": "M6_1Y",
  "workoutFrequencyPerWeek": 4,
  "workoutDuration": "M60",
  "targetWeightKg": 72.0,
  "targetMuscleKg": 35.0,
  "goalTargetDate": "2026-12-31"
}
```
- `profileCompleted` = 필수 항목(`gender`, `heightCm`)이 채워졌는지. 프론트가 회원가입 화면으로 보낼지 판단.
- 응답 DTO는 신설(`UserMeResponse`). `UserProfileDto`(AI용)와 분리.

### 2-2. `PUT /api/users/me` — 회원가입1 저장 (통째)

회원가입1(기본정보 + 운동목표 + 운동환경)을 **마지막에 한 번에** 저장. 전체 표현 교체(UPDATE).

**요청 바디**
```json
{
  "nickname": "길동이",
  "gender": "MALE",
  "birthDate": "1998-03-21",
  "email": "hong@example.com",
  "phone": "010-1234-5678",
  "bio": "3대 400 목표",
  "profileImageUrl": "https://...",
  "heightCm": 175.0,
  "goals": ["MUSCLE_GAIN", "FAT_LOSS"],
  "experienceLevel": "M6_1Y",
  "workoutFrequencyPerWeek": 4,
  "workoutDuration": "M60",
  "targetWeightKg": 72.0,
  "targetMuscleKg": 35.0,
  "goalTargetDate": "2026-12-31"
}
```

**검증**
- `gender` ∈ {MALE, FEMALE}, `heightCm` > 0 (회원가입 완료의 필수값)
- `goals[]` ⊆ {MUSCLE_GAIN, FAT_LOSS, FITNESS, POSTURE, REHAB, HABIT}
- `experienceLevel` ∈ {UNDER_6M, M6_1Y, Y1_2Y, OVER_2Y}
- `workoutDuration` ∈ {UNDER_30, M60, M90, OVER_120}
- `workoutFrequencyPerWeek` ∈ 1~7
- 위반 시 `400` ProblemDetail

**로직**: `getCurrentUser()` → `user.updateProfile(...)` → 저장(더티체킹). `name` 은 로그인 시 채워진 값 유지(요청에 포함하지 않음).
**응답**: `200` + 2-1과 동일한 `UserMeResponse`

> ※ **미결**: 회원가입1 화면의 정확한 필드 구성(특히 `name` 수정 허용 여부, `bio`/`profileImageUrl` 이 회원가입 단계인지 프로필수정 전용인지)은 프론트 와이어프레임(`frontend-handoff.md`) 확정 필요. 위 목록은 `database.md` 기준 초안.

### 2-3. `PATCH /api/users/me` — 프로필 부분 수정

프로필 수정 화면에서 일부 필드만 변경. 요청에 **포함된 필드만** 갱신(누락 필드는 유지).

**요청 바디 (예: 닉네임·목표체중만)**
```json
{ "nickname": "홍반장", "targetWeightKg": 70.0 }
```
- 부분 갱신이라 모든 필드 optional. 포함된 필드에 한해 2-2와 동일한 enum·범위 검증.
- `null` 을 "값 비우기"로 볼지 "변경 안 함"으로 볼지 구분 필요 → **미결**: MVP에선 "요청에 있는 키만 갱신, null은 비우기"로 단순화 제안.

**응답**: `200` + `UserMeResponse`

### 2-4. `POST /api/inbody` — 회원가입2 인바디 저장 (담당: 동규)

인바디 측정값 1건 저장. 회원가입2 + 이후 재측정에도 사용.

**요청 바디**
```json
{
  "measuredAt": "2026-07-16",
  "weightKg": 74.5,
  "bmrKcal": 1620,
  "skeletalMuscleMassKg": 33.2,
  "bodyFatMassKg": 14.1,
  "bodyFatPct": 18.9
}
```

**검증**
- `measuredAt` not null, `weightKg` > 0, `bmrKcal` > 0, `skeletalMuscleMassKg` > 0, `bodyFatMassKg` ≥ 0
- `bodyFatPct` optional, ≥ 0
- `unique (user_id, measured_at)` — 같은 날 재저장 시 처리 방식 결정 필요(아래 미결)

**로직**: `getCurrentUser()` → `new InbodyRecord(user, ...)` → 저장.
**응답**: `201 Created` + 저장 결과(`InbodyRecentResponse` 형태 재사용 가능).

> ※ **미결**: 같은 `measured_at` 재입력 시 → (a) `409 Conflict` (b) 기존 레코드 UPSERT 수정. 하루 여러 번
> 측정 허용하려면 `unique` 제약을 빼고 `measured_at` 을 `timestamptz` 로 변경해야 함(`database.md` 7장).

### 2-5. `GET · PUT /api/users/me/preferences` — 운동 선호 설정

**GET 응답 / PUT 요청** (없으면 GET은 기본값/`null`, PUT은 upsert)
```json
{
  "preferredWorkoutTypes": ["WEIGHT", "CARDIO"],
  "injuryParts": ["KNEE", "WRIST"]
}
```
- `preferredWorkoutTypes[]` ⊆ {WEIGHT, BODYWEIGHT, CARDIO, STRETCHING, FUNCTIONAL}
- `injuryParts[]` ⊆ {NECK, SHOULDER, ELBOW, WAIST, KNEE, WRIST, ANKLE, NONE}
- PUT 로직: `findByUserId` 있으면 수정, 없으면 생성(upsert). 응답 `200`.

### 2-6. `GET · PUT /api/users/me/ai-settings` — AI 맞춤 설정

```json
{
  "recommendationStyle": "EFFECT",
  "explanationLevel": "STANDARD",
  "coachTone": "MOTIVATION",
  "autoDailyRoutine": true,
  "autoIntensityAdjust": true,
  "autoWeakpartAlert": true,
  "autoRestdaySuggest": false,
  "autoPostureTip": true
}
```
- `recommendationStyle` ∈ {SAFETY, EFFECT, SIMPLE, EXPLORE}
- `explanationLevel` ∈ {SIMPLE, STANDARD, DETAILED}
- `coachTone` ∈ {CALM, PRO, MOTIVATION, CONCISE}
- 토글 5개 boolean. PUT upsert. 응답 `200`.

### 2-7. `GET · PUT /api/users/me/notification-settings` — 알림 설정

```json
{
  "notifyWorkoutStart": true,
  "notifyWeeklyGoal": true,
  "notifyLongAbsence": true,
  "notifyAiRecommend": false,
  "notifyBodyUpdate": true,
  "notifyWorkoutSummary": true,
  "notifyServiceEvent": false,
  "receiveChannel": "APP"
}
```
- `receiveChannel` ∈ {APP, EMAIL, SMS}
- 토글 7개 boolean. PUT upsert. 응답 `200`.

---

## 3. 구현 순서 (Claude Code 위임 단위)

1. **enum 3개 신설** (`Goal`, `ExperienceLevel`, `WorkoutDuration`)
2. **`User` 엔티티 확장** + `targetGainKg` 제거 + `UserProfileDto`/`UserService.toDto()` 수정 → **빌드 통과 확인**
3. **`InbodyRecord` + `InbodyRecentResponse`** 에 `bodyFatPct` 추가 → 빌드
4. **신설 엔티티 3개 + Repository** → 빌드
5. **`GET`/`PUT`/`PATCH /api/users/me`** (DTO·서비스·컨트롤러) → 빌드
6. **`POST /api/inbody`** → 빌드
7. **설정 3종 GET·PUT** → 빌드
8. `@RestControllerAdvice` 에 검증 예외 → `400` ProblemDetail 매핑 (없으면 신설)

각 단계 후 **빌드/구동 검증** 필수(`ddl-auto=validate` 정합성 + `goals` 배열 매핑 확인).

---

## 4. 미결 사항 (결정 필요)

- **회원가입1 필드 구성** — `name` 수정 허용?, `bio`/`profileImageUrl` 회원가입 단계 포함? → `frontend-handoff.md` 확인
- **PATCH의 null 시맨틱** — "비우기" vs "변경 안 함" → MVP는 "키 있으면 갱신(null=비우기)" 제안
- **인바디 같은 날 재저장** — `409` vs UPSERT → 결정 후 `unique` 제약 유지/변경
- **설정 3종 GET 시 미생성 유저** — 기본값 반환 vs `null` vs 최초 접근 시 생성
- **`ddl-auto`** — 커밋된 `application.properties` 는 `create` + `localhost`. Supabase 붙일 땐 `validate` + `application-local.properties`(gitignore)에 접속정보. 실행 전 확인.
