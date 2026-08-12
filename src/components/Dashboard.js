import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Sidebar from './Sidebar';
import AiPanel from './AiPanel';
import { mono, CHAT_TYPE } from '../constants';
import {
  getMe, getInbodyHistory, getWorkoutLogs, createWorkoutLog,
  countChatSessions, ApiError,
} from '../api/client';
import { MUSCLE_GROUP, GOAL, labelOf } from '../api/enums';

/* 종합 데이터 (api.md 3.1b / 3.6 계약 기준)
 *   GET /api/workout-logs   → 전체 반환·페이징 없음 → 연속일·이전 기간 대비까지 여기서 계산 가능
 *   GET /api/inbody         → 측정 이력 (client가 오름차순으로 정렬해준다) → 추이 그래프
 *   GET /api/users/me       → 목표(주당 횟수·목표 체중 등)
 *   GET /api/chat/sessions  → AI 요청 활동량 (Page 응답을 client가 풀어준다)
 *
 * 와이어프레임의 '운동 시간'·'메모'·'운동 루틴 이름'은 workout_logs에 컬럼이 없어 표시할 수 없다
 * (database.md workout_logs 참고). 해당 컬럼은 넣지 않고 화면 하단에 사유를 밝혔다.
 */

const PERIODS = [['7', '최근 7일'], ['30', '최근 30일'], ['90', '최근 90일'], ['all', '전체 기간']];
const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const INTENSITY = ['#f0f0f0', '#ffd6d5', '#ff8785', '#ff1c1e'];
const DONUT_COLORS = ['#ff1c1e', '#e2231a', '#c81e16', '#a01813', '#78120e', '#500c09', '#2d0705'];

const MUSCLE_LABELS = Object.keys(MUSCLE_GROUP);
const STATUS_FILTERS = [['ALL', '전체'], ['COMPLETED', '완료'], ['INCOMPLETE', '미완']];

/** 'yyyy-MM-dd' 를 로컬 자정 Date로. new Date('2026-08-12')는 UTC로 해석돼 하루 밀릴 수 있어 직접 만든다 */
function parseLocalDate(value) {
  if (!value) return null;
  const [y, m, d] = String(value).slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

/** ISO-8601 offset 문자열(createdAt) → Date */
function parseInstant(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function todayLocal() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatMonthDay(value) {
  const d = parseLocalDate(value) ?? parseInstant(value);
  if (!d) return '--';
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function pct(value) {
  return `${Math.round(value * 100)}%`;
}

/** 증감률 — 이전 기간이 0이면 비율을 낼 수 없어 null */
function delta(current, previous) {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 100);
}

/* ─── 도넛 ─── */
function Donut({ data }) {
  const R = 70, STROKE = 26, C = 2 * Math.PI * R;
  const total = data.reduce((sum, s) => sum + s.value, 0);
  let offset = 0;
  return (
    <svg width={180} height={180} viewBox="0 0 180 180">
      <g transform="translate(90,90) rotate(-90)">
        {total === 0 ? (
          <circle r={R} fill="none" stroke="#f0f0f0" strokeWidth={STROKE} />
        ) : data.map((s) => {
          const len = (s.value / total) * C;
          const arc = (
            <circle key={s.label} r={R} fill="none" stroke={s.color} strokeWidth={STROKE}
              strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset} />
          );
          offset += len;
          return arc;
        })}
      </g>
      <text x="90" y="88" textAnchor="middle" style={{ ...mono, fontSize: 20, fontWeight: 700, fill: '#161415' }}>{total}</text>
      <text x="90" y="104" textAnchor="middle" style={{ ...mono, fontSize: 10, fill: '#6b6f76' }}>세트</text>
    </svg>
  );
}

/* ─── 인바디 추이 라인차트 ─── */
function TrendChart({ points, unit }) {
  const W = 900, H = 220, PAD_X = 44, PAD_Y = 24;
  if (points.length === 0) return null;

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  // 값이 모두 같으면 선이 위/아래로 붙어버리므로 여유 폭을 준다
  const span = max - min || Math.max(max * 0.1, 1);
  const lo = min - span * 0.2;
  const hi = max + span * 0.2;

  const x = (i) => (points.length === 1
    ? W / 2
    : PAD_X + (i / (points.length - 1)) * (W - PAD_X * 2));
  const y = (v) => H - PAD_Y - ((v - lo) / (hi - lo)) * (H - PAD_Y * 2);

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.value)}`).join(' ');
  const area = `${line} L ${x(points.length - 1)} ${H - PAD_Y} L ${x(0)} ${H - PAD_Y} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none">
      {[lo, (lo + hi) / 2, hi].map((v, i) => (
        <g key={i}>
          <line x1={PAD_X} x2={W - PAD_X} y1={y(v)} y2={y(v)} stroke="#f0f0f0" strokeWidth={1} />
          <text x={4} y={y(v) + 4} style={{ ...mono, fontSize: 11, fill: '#b7bac4' }}>{v.toFixed(1)}</text>
        </g>
      ))}
      <path d={area} fill="#ff1c1e" opacity={0.08} />
      <path d={line} fill="none" stroke="#ff1c1e" strokeWidth={2} />
      {points.map((p, i) => (
        <g key={p.label}>
          <circle cx={x(i)} cy={y(p.value)} r={4} fill="#fff" stroke="#ff1c1e" strokeWidth={2} />
          <text x={x(i)} y={y(p.value) - 12} textAnchor="middle"
            style={{ ...mono, fontSize: 11, fontWeight: 700, fill: '#161415' }}>
            {p.value.toFixed(1)}{unit}
          </text>
          <text x={x(i)} y={H - 6} textAnchor="middle" style={{ ...mono, fontSize: 10, fill: '#6b6f76' }}>
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function StatCard({ icon, label, value, sub, subAccent }) {
  return (
    <div className="border border-[rgba(183,186,196,0.6)] p-4 flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <span className="material-symbols-outlined text-[#161415]" style={{ fontSize: 15 }}>{icon}</span>
        <span style={{ ...mono, fontSize: 11, color: '#6b6f76' }}>{label}</span>
      </div>
      <div style={{ ...mono, fontSize: 20, fontWeight: 700, color: '#161415' }}>{value}</div>
      <div style={{ ...mono, fontSize: 10, color: subAccent ? '#ff1c1e' : '#6b6f76', fontWeight: subAccent ? 700 : 400 }}>
        {sub || ' '}
      </div>
    </div>
  );
}

function Panel({ title, right, children }) {
  return (
    <div className="border border-[rgba(183,186,196,0.6)] p-6 mt-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 style={{ ...mono, fontSize: 16, fontWeight: 700, color: '#161415' }}>{title}</h2>
        {right}
      </div>
      {children}
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="flex items-center justify-center h-[120px]">
      <span style={{ ...mono, fontSize: 12, color: '#b7bac4' }}>{text}</span>
    </div>
  );
}

/* ─── 새 운동 기록 입력 (POST /api/workout-logs) ─── */
const EMPTY_LOG = {
  performedAt: toKey(todayLocal()),
  exerciseName: '',
  muscleGroup: '가슴',
  plannedSets: '',
  completedSets: '',
  reps: '',
  weightKg: '',
};

function NewLogModal({ onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY_LOG);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const num = (v) => (String(v).trim() === '' ? null : Number(v));

  async function handleSave() {
    if (saving) return;
    setError(null);

    if (!form.performedAt || !form.exerciseName.trim()) {
      setError('측정일과 운동명은 필수입니다.');
      return;
    }
    const completedSets = num(form.completedSets);
    if (completedSets == null || completedSets < 0) {
      setError('완료 세트를 0 이상의 숫자로 입력해 주세요.');
      return;
    }

    setSaving(true);
    try {
      await createWorkoutLog({
        performedAt: form.performedAt,
        exerciseName: form.exerciseName.trim(),
        muscleGroup: MUSCLE_GROUP[form.muscleGroup] ?? null,
        // 자유 입력은 계획이 없다 → 비우면 서버가 완료율 100%·COMPLETED로 처리한다 (api.md 3.6)
        plannedSets: num(form.plannedSets),
        completedSets,
        reps: num(form.reps),
        weightKg: num(form.weightKg),
        routineId: null,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError && err.status === 401
        ? '로그인이 필요합니다.'
        : err?.message || '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  const field = (label, key, props = {}) => (
    <label className="flex flex-col gap-2">
      <span style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>{label}</span>
      <input value={form[key]} onChange={(e) => set({ [key]: e.target.value })} {...props}
        className="border border-[#e5e7eb] h-[42px] px-3 outline-none focus:border-[#161415] transition-colors"
        style={{ ...mono, fontSize: 13, color: '#161415' }} />
    </label>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white w-full max-w-[520px] p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 style={{ ...mono, fontSize: 18, fontWeight: 700, color: '#161415' }}>새 운동 기록</h2>
          <button onClick={onClose} className="material-symbols-outlined text-[#6b6f76]" style={{ fontSize: 20 }}>close</button>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-5">
          {field('운동일 *', 'performedAt', { placeholder: 'YYYY-MM-DD' })}
          {field('운동명 *', 'exerciseName', { placeholder: '벤치프레스' })}
        </div>

        <div className="mt-4">
          <span style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>운동 부위</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {MUSCLE_LABELS.map((label) => (
              <button key={label} onClick={() => set({ muscleGroup: label })}
                className="h-[34px] px-3 border transition-colors"
                style={{
                  ...mono, fontSize: 12, fontWeight: 700,
                  borderColor: form.muscleGroup === label ? '#ff1c1e' : '#e5e7eb',
                  background: form.muscleGroup === label ? '#ffd6d5' : '#fff',
                  color: form.muscleGroup === label ? '#e2231a' : '#161415',
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          {field('완료 세트 *', 'completedSets', { placeholder: '4', inputMode: 'numeric' })}
          {field('계획 세트 (선택)', 'plannedSets', { placeholder: '5', inputMode: 'numeric' })}
          {field('반복 횟수 (선택)', 'reps', { placeholder: '10', inputMode: 'numeric' })}
          {field('중량 kg (선택)', 'weightKg', { placeholder: '60', inputMode: 'decimal' })}
        </div>

        <p className="mt-3" style={{ ...mono, fontSize: 11, color: '#6b6f76', lineHeight: 1.6 }}>
          계획 세트를 비우면 완료율 100%·완료 상태로 저장됩니다. 계획 세트를 넣으면
          완료 세트와 비교해 서버가 완료율과 상태(80% 기준)를 계산합니다.
        </p>

        {error && (
          <div className="border border-[#ffb3b1] bg-[#fff2f1] px-4 py-3 mt-4">
            <p style={{ ...mono, fontSize: 12, color: '#e2231a' }}>{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onClose} disabled={saving}
            className="border border-[#b7bac4] h-[42px] px-5 hover:bg-[#f7f7f7] transition-colors disabled:opacity-40"
            style={{ ...mono, fontSize: 13, color: '#161415' }}>취소</button>
          <button onClick={handleSave} disabled={saving}
            className="bg-[#161415] text-white h-[42px] px-5 hover:opacity-80 transition-opacity disabled:opacity-40"
            style={{ ...mono, fontSize: 13, fontWeight: 700 }}>
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [me, setMe] = useState(null);
  const [inbodyHistory, setInbodyHistory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [sessionCounts, setSessionCounts] = useState({ coaching: 0, nutrition: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [period, setPeriod] = useState('30');
  const [muscleFilter, setMuscleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [trendMetric, setTrendMetric] = useState('weightKg');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      getMe(),
      getInbodyHistory(),
      getWorkoutLogs(),
      countChatSessions(CHAT_TYPE.COACHING),
      countChatSessions(CHAT_TYPE.NUTRITION),
    ])
      .then(([meRes, inbodyRes, logRes, coachingCount, nutritionCount]) => {
        if (cancelled) return;
        setMe(meRes);
        setInbodyHistory(inbodyRes ?? []);
        setLogs(logRes ?? []);
        setSessionCounts({ coaching: coachingCount, nutrition: nutritionCount });
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError && err.status === 401
          ? '로그인이 필요합니다. 구글 로그인 후 다시 시도해 주세요.'
          : err?.message || '데이터를 불러오지 못했습니다.');
      })
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [reloadKey]);

  const periodDays = period === 'all' ? null : Number(period);

  /** 기간 시작일 (오늘 포함 N일) */
  const cutoff = useMemo(() => {
    if (!periodDays) return null;
    const d = todayLocal();
    d.setDate(d.getDate() - (periodDays - 1));
    return d;
  }, [periodDays]);

  /** 이전 동일 기간 — "이전 기간 대비" 계산용 */
  const prevRange = useMemo(() => {
    if (!periodDays || !cutoff) return null;
    const end = new Date(cutoff);
    end.setDate(end.getDate() - 1);
    const start = new Date(end);
    start.setDate(start.getDate() - (periodDays - 1));
    return { start, end };
  }, [periodDays, cutoff]);

  /** 부위·상태 필터는 표와 도넛에만 적용하고, 기간 필터는 모든 집계에 적용한다 */
  const applyFilters = useCallback((list) => list.filter((log) => {
    if (muscleFilter !== 'ALL' && log.muscleGroup !== muscleFilter) return false;
    if (statusFilter !== 'ALL' && log.status !== statusFilter) return false;
    return true;
  }), [muscleFilter, statusFilter]);

  const inRange = useCallback((list, start, end) => list.filter((log) => {
    const d = parseLocalDate(log.performedAt);
    if (!d) return false;
    if (start && d < start) return false;
    if (end && d > end) return false;
    return true;
  }), []);

  const periodLogs = useMemo(() => applyFilters(inRange(logs, cutoff, null)), [logs, cutoff, applyFilters, inRange]);
  const prevLogs = useMemo(
    () => (prevRange ? applyFilters(inRange(logs, prevRange.start, prevRange.end)) : []),
    [logs, prevRange, applyFilters, inRange]
  );

  /** 집계 — 총 운동 횟수는 '운동한 날 수'(performedAt distinct) 기준 */
  const summarize = useCallback((list) => {
    const days = new Set(list.map((l) => l.performedAt));
    const completedSets = list.reduce((sum, l) => sum + (l.completedSets ?? 0), 0);
    const plannedSets = list.reduce((sum, l) => sum + (l.plannedSets ?? l.completedSets ?? 0), 0);
    return {
      dayCount: days.size,
      exerciseCount: list.length,
      completedSets,
      completionRate: plannedSets ? completedSets / plannedSets : 0,
    };
  }, []);

  const current = useMemo(() => summarize(periodLogs), [periodLogs, summarize]);
  const previous = useMemo(() => summarize(prevLogs), [prevLogs, summarize]);

  /** 연속 운동일 — 전체 로그로 계산한다(기간 필터를 무시). 기간만 보면 경계에서 끊긴 것으로 오판한다 */
  const streak = useMemo(() => {
    const days = [...new Set(logs.map((l) => l.performedAt))].sort();
    if (days.length === 0) return { current: 0, best: 0 };

    let best = 1;
    let run = 1;
    for (let i = 1; i < days.length; i += 1) {
      const prev = parseLocalDate(days[i - 1]);
      const curr = parseLocalDate(days[i]);
      const gap = Math.round((curr - prev) / 86400000);
      run = gap === 1 ? run + 1 : 1;
      best = Math.max(best, run);
    }

    // 오늘 또는 어제까지 이어졌을 때만 '현재 연속'으로 인정한다
    const last = parseLocalDate(days[days.length - 1]);
    const gapFromToday = Math.round((todayLocal() - last) / 86400000);
    return { current: gapFromToday <= 1 ? run : 0, best };
  }, [logs]);

  /** 주간 활동 — 최근 7일 요일별 완료 세트 수 */
  const weekly = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i -= 1) {
      const day = todayLocal();
      day.setDate(day.getDate() - i);
      days.push({ key: toKey(day), label: WEEKDAY_LABELS[day.getDay()], sets: 0 });
    }
    applyFilters(logs).forEach((log) => {
      const slot = days.find((d) => d.key === String(log.performedAt).slice(0, 10));
      if (slot) slot.sets += log.completedSets ?? 0;
    });
    return days;
  }, [logs, applyFilters]);

  /** 부위별 완료 세트 비율 */
  const byMuscle = useMemo(() => {
    const counts = {};
    periodLogs.forEach((log) => {
      const key = log.muscleGroup ?? 'UNCLASSIFIED';
      counts[key] = (counts[key] ?? 0) + (log.completedSets ?? 0);
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([code, value], i) => ({
        label: code === 'UNCLASSIFIED' ? '미분류' : (labelOf(MUSCLE_GROUP, code) ?? code),
        value,
        color: DONUT_COLORS[i % DONUT_COLORS.length],
      }));
  }, [periodLogs]);

  /** 활동 캘린더 — 이번 달, 그날 완료 세트 수로 농도 */
  const calendar = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const perDay = {};
    applyFilters(logs).forEach((log) => {
      const d = parseLocalDate(log.performedAt);
      if (!d || d.getFullYear() !== year || d.getMonth() !== month) return;
      perDay[d.getDate()] = (perDay[d.getDate()] ?? 0) + (log.completedSets ?? 0);
    });

    const cells = Array.from({ length: new Date(year, month, 1).getDay() }, () => ({ day: null }));
    const lastDate = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= lastDate; day += 1) {
      const sets = perDay[day] ?? 0;
      const level = sets === 0 ? 0 : sets <= 5 ? 1 : sets <= 12 ? 2 : 3;
      cells.push({ day, level, sets });
    }
    return { cells, year, month: month + 1 };
  }, [logs, applyFilters]);

  /** 인바디 추이 — 오름차순으로 정렬되어 온다 */
  const trendPoints = useMemo(() => inbodyHistory
    .filter((r) => r[trendMetric] != null)
    .map((r) => ({ label: formatMonthDay(r.measuredAt), value: Number(r[trendMetric]) })), [inbodyHistory, trendMetric]);

  const latestInbody = inbodyHistory[inbodyHistory.length - 1] ?? null;
  const maxWeeklySets = Math.max(1, ...weekly.map((w) => w.sets));
  const periodLabel = PERIODS.find(([v]) => v === period)?.[1] ?? '';

  const dayDelta = delta(current.dayCount, previous.dayCount);
  const setDelta = delta(current.completedSets, previous.completedSets);

  const TREND_METRICS = [
    ['weightKg', '체중', 'kg'],
    ['skeletalMuscleMassKg', '골격근량', 'kg'],
    ['bodyFatPct', '체지방률', '%'],
    ['bmrKcal', '기초대사량', ''],
  ];
  const trendUnit = TREND_METRICS.find(([k]) => k === trendMetric)?.[2] ?? '';

  return (
    <div className="flex h-screen bg-white overflow-hidden" style={{ minWidth: 1100 }}>
      <Sidebar />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full max-w-[1000px] mx-auto px-8 pt-10 pb-12">

            {/* 헤더 */}
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 style={{ ...mono, fontSize: 30, fontWeight: 700, color: '#161415' }}>종합 데이터</h1>
                <p className="mt-1" style={{ ...mono, fontSize: 13, color: '#6b6f76' }}>
                  {me?.name ? `${me.name}님의 ` : ''}운동 수행 기록과 인바디 추이
                </p>
              </div>
              <button onClick={() => setModalOpen(true)}
                className="flex items-center gap-1 bg-[#161415] text-white h-[42px] px-4 hover:opacity-80 transition-opacity"
                style={{ ...mono, fontSize: 13, fontWeight: 700 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                새 운동 기록
              </button>
            </div>

            {/* 필터 */}
            <div className="flex items-center gap-2 mt-8 flex-wrap">
              {PERIODS.map(([value, label]) => (
                <button key={value} onClick={() => setPeriod(value)}
                  className="h-[38px] px-3 border transition-colors"
                  style={{
                    ...mono, fontSize: 12, fontWeight: 700, color: '#161415',
                    borderColor: period === value ? '#161415' : '#e5e7eb',
                    background: period === value ? '#f0f0f0' : '#fff',
                  }}>
                  {label}
                </button>
              ))}
              <span className="w-px h-[24px] bg-[#e5e7eb] mx-2" />
              <select value={muscleFilter} onChange={(e) => setMuscleFilter(e.target.value)}
                className="h-[38px] px-3 border border-[#e5e7eb] bg-white"
                style={{ ...mono, fontSize: 12, fontWeight: 700, color: '#161415' }}>
                <option value="ALL">운동 부위: 전체</option>
                {MUSCLE_LABELS.map((label) => (
                  <option key={label} value={MUSCLE_GROUP[label]}>{label}</option>
                ))}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="h-[38px] px-3 border border-[#e5e7eb] bg-white"
                style={{ ...mono, fontSize: 12, fontWeight: 700, color: '#161415' }}>
                {STATUS_FILTERS.map(([value, label]) => (
                  <option key={value} value={value}>기록 상태: {label}</option>
                ))}
              </select>
              {(muscleFilter !== 'ALL' || statusFilter !== 'ALL') && (
                <button onClick={() => { setMuscleFilter('ALL'); setStatusFilter('ALL'); }}
                  className="ml-auto" style={{ ...mono, fontSize: 12, color: '#ff1c1e', fontWeight: 700 }}>
                  필터 초기화
                </button>
              )}
            </div>

            {loading && <p className="mt-6" style={{ ...mono, fontSize: 13, color: '#6b6f76' }}>데이터를 불러오는 중...</p>}
            {error && (
              <div className="border border-[#ffb3b1] bg-[#fff2f1] px-4 py-3 mt-6">
                <p style={{ ...mono, fontSize: 12, color: '#e2231a' }}>{error}</p>
              </div>
            )}

            {!loading && !error && (
              <>
                {/* 요약 카드 */}
                <div className="grid grid-cols-5 gap-4 mt-6">
                  <StatCard icon="bar_chart" label="총 운동 횟수" value={`${current.dayCount}회`}
                    sub={dayDelta != null ? `${dayDelta > 0 ? '+' : ''}${dayDelta}% 이전 기간 대비` : periodLabel}
                    subAccent={dayDelta != null && dayDelta > 0} />
                  <StatCard icon="fitness_center" label="완료한 세트" value={`${current.completedSets}세트`}
                    sub={setDelta != null ? `${setDelta > 0 ? '+' : ''}${setDelta}% 이전 기간 대비` : periodLabel}
                    subAccent={setDelta != null && setDelta > 0} />
                  <StatCard icon="task_alt" label="운동 완료율" value={pct(current.completionRate)}
                    sub={`기록 ${current.exerciseCount}건 기준`} />
                  <StatCard icon="local_fire_department" label="연속 운동"
                    value={`${streak.current}일`} sub={`최고 ${streak.best}일`} subAccent={streak.current > 0} />
                  <StatCard icon="forum" label="AI 요청"
                    value={`${sessionCounts.coaching + sessionCounts.nutrition}회`}
                    sub={`코칭 ${sessionCounts.coaching} · 영양 ${sessionCounts.nutrition}`} />
                </div>

                {/* 인바디 추이 */}
                <Panel
                  title="인바디 추이"
                  right={
                    <div className="flex flex-wrap">
                      {TREND_METRICS.map(([key, label]) => (
                        <button key={key} onClick={() => setTrendMetric(key)}
                          className="h-[34px] px-3 border transition-colors"
                          style={{
                            ...mono, fontSize: 12, fontWeight: 700, color: '#161415',
                            borderColor: trendMetric === key ? '#161415' : '#e5e7eb',
                            background: trendMetric === key ? '#f0f0f0' : '#fff',
                          }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  }
                >
                  {trendPoints.length ? (
                    <>
                      <div className="mt-6 overflow-x-auto">
                        <TrendChart points={trendPoints} unit={trendUnit} />
                      </div>
                      <p className="mt-2" style={{ ...mono, fontSize: 11, color: '#6b6f76' }}>
                        측정 {trendPoints.length}건 · 최근 측정일 {latestInbody?.measuredAt ?? '--'}
                        {me?.targetWeightKg != null && trendMetric === 'weightKg' && ` · 목표 ${me.targetWeightKg}kg`}
                      </p>
                    </>
                  ) : (
                    <Empty text="인바디 측정 기록이 없습니다. 회원가입에서 입력하거나 재측정 값을 등록해 주세요." />
                  )}
                </Panel>

                {/* 주간 활동 */}
                <Panel title="주간 활동 (최근 7일 · 완료 세트)">
                  <div className="flex items-end justify-between gap-4 h-[200px] mt-8 px-2">
                    {weekly.map((w) => (
                      <div key={w.key} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                        <span style={{ ...mono, fontSize: 11, color: '#161415', fontWeight: 700 }}>{w.sets || ''}</span>
                        <div className="w-full max-w-[46px] transition-all"
                          style={{
                            height: `${(w.sets / maxWeeklySets) * 100}%`,
                            minHeight: w.sets ? 4 : 2,
                            background: w.sets ? '#161415' : '#f0f0f0',
                          }} />
                        <span style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>{w.label}</span>
                      </div>
                    ))}
                  </div>
                </Panel>

                {/* 부위별 비율 + 목표 */}
                <Panel title="부위별 운동 비율">
                  {byMuscle.length ? (
                    <div className="flex items-center gap-10 mt-4 flex-wrap">
                      <Donut data={byMuscle} />
                      <div className="flex flex-col gap-2">
                        {byMuscle.map((p) => (
                          <div key={p.label} className="flex items-center gap-2">
                            <span className="inline-block w-3 h-3 shrink-0" style={{ background: p.color }} />
                            <span style={{ ...mono, fontSize: 12, color: '#161415', minWidth: 60 }}>{p.label}</span>
                            <span style={{ ...mono, fontSize: 12, color: '#161415', fontWeight: 700 }}>{p.value}세트</span>
                          </div>
                        ))}
                      </div>
                      {me?.goals?.length ? (
                        <div className="flex-1 min-w-[240px]">
                          <div style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>설정한 운동 목표</div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {me.goals.map((g) => (
                              <span key={g} className="px-3 py-1"
                                style={{ ...mono, fontSize: 12, fontWeight: 700, background: '#ffd6d5', color: '#e2231a' }}>
                                {labelOf(GOAL, g) ?? g}
                              </span>
                            ))}
                          </div>
                          {me.workoutFrequencyPerWeek && (
                            <p className="mt-3" style={{ ...mono, fontSize: 11, color: '#6b6f76', lineHeight: 1.6 }}>
                              목표 주 {me.workoutFrequencyPerWeek}회 · 최근 7일 운동일{' '}
                              {weekly.filter((w) => w.sets > 0).length}일
                            </p>
                          )}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <Empty text={`${periodLabel} 동안 기록된 운동이 없습니다.`} />
                  )}
                </Panel>

                {/* 활동 캘린더 */}
                <Panel title="운동 캘린더"
                  right={<span style={{ ...mono, fontSize: 13, fontWeight: 700, color: '#161415' }}>
                    {calendar.year}년 {calendar.month}월
                  </span>}
                >
                  <div className="grid grid-cols-7 gap-2 mt-6">
                    {WEEKDAY_LABELS.map((w) => (
                      <div key={w} className="text-center pb-2" style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>{w}</div>
                    ))}
                    {calendar.cells.map((c, i) => (
                      <div key={i} className="h-[34px] flex items-center justify-center rounded-full"
                        title={c.day ? `${c.sets}세트` : ''}
                        style={{ background: c.day ? INTENSITY[c.level] : 'transparent' }}>
                        {c.day && (
                          <span style={{
                            ...mono, fontSize: 12,
                            fontWeight: c.level >= 2 ? 700 : 400,
                            color: c.level >= 2 ? '#fff' : '#161415',
                          }}>{c.day}</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="mt-4" style={{ ...mono, fontSize: 11, color: '#6b6f76' }}>
                    색이 진할수록 그날 완료한 세트가 많습니다.
                  </p>
                </Panel>

                {/* 최근 운동 기록 */}
                <Panel title="최근 운동 기록">
                  {periodLogs.length ? (
                    <table className="w-full mt-6" style={mono}>
                      <thead>
                        <tr className="border-b border-[#e5e7eb]" style={{ fontSize: 12, color: '#6b6f76' }}>
                          {['날짜', '운동명', '부위', '세트', '반복', '중량', '완료율', '상태', '출처'].map((h) => (
                            <th key={h} className="text-left font-normal pb-3 px-2">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {periodLogs.map((log) => (
                          <tr key={log.id} className="border-b border-[#f0f0f0]" style={{ fontSize: 12, color: '#161415' }}>
                            <td className="py-4 px-2">{formatMonthDay(log.performedAt)}</td>
                            <td className="py-4 px-2">{log.exerciseName}</td>
                            <td className="py-4 px-2">{labelOf(MUSCLE_GROUP, log.muscleGroup) ?? '미분류'}</td>
                            <td className="py-4 px-2">
                              {log.completedSets ?? '--'}
                              {log.plannedSets != null && <span style={{ color: '#b7bac4' }}> / {log.plannedSets}</span>}
                            </td>
                            <td className="py-4 px-2">{log.reps != null ? `${log.reps}회` : '--'}</td>
                            <td className="py-4 px-2">{log.weightKg != null ? `${log.weightKg}kg` : '--'}</td>
                            <td className="py-4 px-2">{log.completionRate != null ? pct(log.completionRate) : '--'}</td>
                            <td className="py-4 px-2">
                              <span className="inline-block px-3 py-1" style={{
                                fontWeight: 700,
                                background: log.status === 'COMPLETED' ? '#e5f6ea' : '#fde8e8',
                                color: log.status === 'COMPLETED' ? '#1f9d55' : '#e2231a',
                              }}>
                                {log.status === 'COMPLETED' ? '완료' : '미완'}
                              </span>
                            </td>
                            <td className="py-4 px-2" style={{ color: '#6b6f76' }}>
                              {log.routineId ? 'AI 루틴' : '직접 입력'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <Empty text={`${periodLabel} 동안 기록된 운동이 없습니다. '새 운동 기록'으로 추가해 보세요.`} />
                  )}
                </Panel>

                {/* 백엔드 미구현 항목 */}
                <div className="border border-[#e5e7eb] bg-[#f7f7f7] p-5 mt-6">
                  <div style={{ ...mono, fontSize: 12, fontWeight: 700, color: '#161415' }}>아직 표시할 수 없는 항목</div>
                  <p className="mt-2" style={{ ...mono, fontSize: 11, color: '#6b6f76', lineHeight: 1.7 }}>
                    <span style={{ fontWeight: 700 }}>운동 시간 · 메모 · 루틴 이름</span>은
                    workout_logs에 컬럼이 없어 저장·표시할 수 없습니다 (database.md 참고).
                    표의 &apos;출처&apos; 열은 routineId 유무로만 구분합니다.
                    부위가 &apos;미분류&apos;로 나오는 기록은 muscleGroup이 비어 있는 경우이며,
                    AI 추천 루틴을 수행 기록으로 옮길 때 AI 응답에 부위 필드가 없으면 발생합니다.
                  </p>
                </div>
              </>
            )}

          </div>
        </div>

        <AiPanel />
      </div>

      {modalOpen && (
        <NewLogModal
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); setReloadKey((k) => k + 1); }}
        />
      )}
    </div>
  );
}
