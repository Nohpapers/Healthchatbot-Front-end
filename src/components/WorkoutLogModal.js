import React, { useState } from 'react';
import { mono } from '../constants';
import { createWorkoutLog, ApiError } from '../api/client';
import { MUSCLE_GROUP, formatDateInput } from '../api/enums';

/* 운동 수행 기록 입력 (POST /api/workout-logs — api.md 3.5)
 * 종합 데이터의 '새 운동 기록'과 코칭 화면의 '기록에 추가'가 함께 쓴다.
 * initial로 AI 루틴의 운동명·부위·계획 세트를 미리 채워 넣을 수 있다.
 */

const MUSCLE_LABELS = Object.keys(MUSCLE_GROUP);

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function WorkoutLogModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    performedAt: todayKey(),
    exerciseName: '',
    muscleGroup: '가슴',
    plannedSets: '',
    completedSets: '',
    reps: '',
    weightKg: '',
    ...initial,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const num = (v) => (String(v ?? '').trim() === '' ? null : Number(v));

  async function handleSave() {
    if (saving) return;
    setError(null);

    if (!form.performedAt || !String(form.exerciseName).trim()) {
      setError('운동일과 운동명은 필수입니다.');
      return;
    }
    const completedSets = num(form.completedSets);
    if (completedSets == null || Number.isNaN(completedSets) || completedSets < 0) {
      setError('완료 세트를 0 이상의 숫자로 입력해 주세요.');
      return;
    }

    setSaving(true);
    try {
      await createWorkoutLog({
        performedAt: form.performedAt,
        exerciseName: String(form.exerciseName).trim(),
        muscleGroup: MUSCLE_GROUP[form.muscleGroup] ?? null,
        // 계획 세트를 비우면 서버가 완료율 100%·COMPLETED로 처리한다 (api.md 3.6)
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

  /** date: true면 타이핑 중 yyyy-mm-dd로 자동 정리 */
  const field = (label, key, { date, ...props } = {}) => (
    <label className="flex flex-col gap-2">
      <span style={{ ...mono, fontSize: 12, color: '#6b6f76' }}>{label}</span>
      <input value={form[key] ?? ''}
        onChange={(e) => set({ [key]: date ? formatDateInput(e.target.value) : e.target.value })}
        {...(date ? { inputMode: 'numeric', maxLength: 10 } : {})} {...props}
        className="border border-[#e5e7eb] h-[42px] px-3 outline-none focus:border-[#161415] transition-colors"
        style={{ ...mono, fontSize: 13, color: '#161415' }} />
    </label>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white w-full max-w-[520px] p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 style={{ ...mono, fontSize: 18, fontWeight: 700, color: '#161415' }}>운동 기록 추가</h2>
          <button onClick={onClose} className="material-symbols-outlined text-[#6b6f76]" style={{ fontSize: 20 }}>close</button>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-5">
          {field('운동일 *', 'performedAt', { date: true, placeholder: 'YYYY-MM-DD' })}
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
