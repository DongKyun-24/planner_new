import { useMemo, useState } from "react"
import {
  REPEAT_DAILY,
  REPEAT_WEEKLY,
  REPEAT_YEARLY,
  REPEAT_MONTHLY,
  WEEKDAY_LABELS,
  formatDateRangeLabel,
  getRepeatLabel,
  isValidDateKey,
  normalizeRepeatDays,
  normalizeRepeatInterval,
  normalizeRepeatType
} from "../utils/recurringRules"
import { dayOfWeek, keyToYMD } from "../utils/dateUtils"
import { stripTaskSuffix } from "../utils/taskMarkers"

function getDefaultWeeklyDays(dateKey) {
  if (!isValidDateKey(dateKey)) return []
  const { y, m, d } = keyToYMD(dateKey)
  return [dayOfWeek(y, m, d)]
}

function buildEditableRecurringContent(rawLine) {
  const stripped = stripTaskSuffix(rawLine)
  if (!stripped.text) return ""
  return stripped.dday ? `${stripped.text};D` : stripped.text
}

function composeRecurringRawLine(rawLine, kind) {
  const stripped = stripTaskSuffix(rawLine)
  const baseText = String(stripped.text ?? "").trim()
  if (!baseText) return ""
  const withDday = stripped.dday ? `${baseText};D` : baseText
  return kind === "task" ? `${withDday};X` : withDday
}

function buildDraft({ initialDateKey, editingOccurrence, defaultCategoryTitle, defaultKind = "schedule" }) {
  if (editingOccurrence) {
    return {
      startDateKey: String(editingOccurrence.familyStartDateKey ?? editingOccurrence.dateKey ?? initialDateKey ?? "").trim(),
      untilDateKey: String(editingOccurrence.familyUntilDateKey ?? editingOccurrence.dateKey ?? initialDateKey ?? "").trim(),
      repeat: normalizeRepeatType(editingOccurrence.repeat),
      repeatInterval: normalizeRepeatInterval(editingOccurrence.repeatInterval),
      repeatDays: normalizeRepeatDays(editingOccurrence.repeatDays),
      rawLine: buildEditableRecurringContent(editingOccurrence.rawLine),
      kind: editingOccurrence.isTask ? "task" : "schedule",
      categoryTitle: String(editingOccurrence.title ?? defaultCategoryTitle ?? "").trim()
    }
  }

  return {
    startDateKey: String(initialDateKey ?? "").trim(),
    untilDateKey: String(initialDateKey ?? "").trim(),
    repeat: REPEAT_DAILY,
    repeatInterval: 1,
    repeatDays: getDefaultWeeklyDays(initialDateKey),
    rawLine: "",
    kind: defaultKind === "task" ? "task" : "schedule",
    categoryTitle: String(defaultCategoryTitle ?? "").trim()
  }
}

function normalizeComparableDraft(draft) {
  const repeat = normalizeRepeatType(draft?.repeat)
  const kind = draft?.kind === "task" ? "task" : "schedule"
  return {
    startDateKey: String(draft?.startDateKey ?? "").trim(),
    untilDateKey: String(draft?.untilDateKey ?? "").trim(),
    repeat,
    repeatInterval: normalizeRepeatInterval(draft?.repeatInterval),
    repeatDays: repeat === REPEAT_WEEKLY ? normalizeRepeatDays(draft?.repeatDays) : [],
    rawLine: composeRecurringRawLine(draft?.rawLine, kind),
    kind,
    categoryTitle: String(draft?.categoryTitle ?? "").trim()
  }
}

export default function RecurringRuleModal({
  open,
  ui,
  editingOccurrence = null,
  initialDateKey = "",
  defaultCategoryTitle = "",
  defaultKind = "schedule",
  onClose,
  onCreate,
  onSave,
  onDelete
}) {
  const [draft, setDraft] = useState(() =>
    buildDraft({ initialDateKey, editingOccurrence, defaultCategoryTitle, defaultKind })
  )
  const [pendingAction, setPendingAction] = useState(null)

  const isEditing = Boolean(editingOccurrence)
  const originalComparable = useMemo(
    () => normalizeComparableDraft(buildDraft({ initialDateKey, editingOccurrence, defaultCategoryTitle, defaultKind })),
    [initialDateKey, editingOccurrence, defaultCategoryTitle, defaultKind]
  )
  const currentComparable = useMemo(() => normalizeComparableDraft(draft), [draft])
  const isDirty = JSON.stringify(originalComparable) !== JSON.stringify(currentComparable)

  if (!open) return null

  function closeAll() {
    setPendingAction(null)
    onClose?.()
  }

  function handleRepeatChange(nextRepeat) {
    const repeat = normalizeRepeatType(nextRepeat)
    setDraft((prev) => ({
      ...prev,
      repeat,
      repeatDays:
        repeat === REPEAT_WEEKLY
          ? normalizeRepeatDays(prev.repeatDays).length > 0
            ? normalizeRepeatDays(prev.repeatDays)
            : getDefaultWeeklyDays(prev.startDateKey)
          : []
    }))
  }

  function toggleRepeatDay(dayIndex) {
    setDraft((prev) => {
      const current = normalizeRepeatDays(prev.repeatDays)
      if (current.includes(dayIndex)) {
        const next = current.filter((item) => item !== dayIndex)
        return { ...prev, repeatDays: next.length > 0 ? next : current }
      }
      return { ...prev, repeatDays: normalizeRepeatDays([...current, dayIndex]) }
    })
  }

  function handleSaveClick() {
    if (!currentComparable.rawLine) return
    if (!isEditing) {
      onCreate?.(currentComparable)
      closeAll()
      return
    }
    if (!isDirty) {
      closeAll()
      return
    }
    setPendingAction("save")
  }

  function handleDeleteClick() {
    if (!isEditing) return
    setPendingAction("delete")
  }

  function runScopedAction(scope) {
    if (pendingAction === "save") {
      onSave?.(currentComparable, scope)
      closeAll()
      return
    }
    if (pendingAction === "delete") {
      onDelete?.(scope)
      closeAll()
    }
  }

  const repeatLabel = getRepeatLabel(draft.repeat, draft.repeatInterval)
  const rangeLabel = formatDateRangeLabel(draft.startDateKey, draft.untilDateKey)

  return (
    <div
      onClick={closeAll}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 220
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(640px, 94vw)",
          maxHeight: "86vh",
          overflowY: "auto",
          position: "relative",
          background: ui.surface,
          color: ui.text,
          borderRadius: 14,
          border: `1px solid ${ui.border}`,
          boxShadow: ui.shadow,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>{isEditing ? "반복 수정" : "반복 추가"}</div>
            <div style={{ color: ui.text2, fontSize: 12 }}>
              {repeatLabel} {rangeLabel}
            </div>
          </div>
          <button
            type="button"
            onClick={closeAll}
            style={{
              height: 40,
              padding: "0 14px",
              borderRadius: 12,
              border: `1px solid ${ui.border}`,
              background: ui.surface2,
              color: ui.text,
              cursor: "pointer",
              fontWeight: 800
            }}
          >
            Close
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 800 }}>시작 날짜</span>
            <input
              type="date"
              value={draft.startDateKey}
              onChange={(e) => {
                const nextDate = e.target.value
                setDraft((prev) => ({
                  ...prev,
                  startDateKey: nextDate,
                  untilDateKey:
                    !isValidDateKey(prev.untilDateKey) || prev.untilDateKey < nextDate ? nextDate : prev.untilDateKey,
                  repeatDays:
                    prev.repeat === REPEAT_WEEKLY && normalizeRepeatDays(prev.repeatDays).length === 0
                      ? getDefaultWeeklyDays(nextDate)
                      : prev.repeatDays
                }))
              }}
              style={{
                height: 44,
                borderRadius: 12,
                border: `1px solid ${ui.border}`,
                background: ui.surface2,
                color: ui.text,
                padding: "0 12px",
                fontWeight: 700
              }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 800 }}>종료 날짜</span>
            <input
              type="date"
              value={draft.untilDateKey}
              onChange={(e) => setDraft((prev) => ({ ...prev, untilDateKey: e.target.value }))}
              style={{
                height: 44,
                borderRadius: 12,
                border: `1px solid ${ui.border}`,
                background: ui.surface2,
                color: ui.text,
                padding: "0 12px",
                fontWeight: 700
              }}
            />
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 800 }}>종류</span>
            <select
              value={draft.kind}
              onChange={(e) => setDraft((prev) => ({ ...prev, kind: e.target.value === "task" ? "task" : "schedule" }))}
              style={{
                height: 44,
                borderRadius: 12,
                border: `1px solid ${ui.border}`,
                background: ui.surface2,
                color: ui.text,
                padding: "0 12px",
                fontWeight: 700
              }}
            >
              <option value="schedule">일정</option>
              <option value="task">Task</option>
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 800 }}>반복</span>
            <select
              value={draft.repeat}
              onChange={(e) => handleRepeatChange(e.target.value)}
              style={{
                height: 44,
                borderRadius: 12,
                border: `1px solid ${ui.border}`,
                background: ui.surface2,
                color: ui.text,
                padding: "0 12px",
                fontWeight: 700
              }}
            >
              <option value={REPEAT_DAILY}>매일</option>
              <option value={REPEAT_WEEKLY}>매주</option>
              <option value={REPEAT_MONTHLY}>매월</option>
              <option value={REPEAT_YEARLY}>매년</option>
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 800 }}>간격</span>
            <input
              value={draft.repeatInterval}
              onChange={(e) => {
                const next = e.target.value
                setDraft((prev) => ({ ...prev, repeatInterval: next === "" ? "" : normalizeRepeatInterval(next) }))
              }}
              onBlur={() =>
                setDraft((prev) => ({ ...prev, repeatInterval: normalizeRepeatInterval(prev.repeatInterval) }))
              }
              inputMode="numeric"
              style={{
                height: 44,
                borderRadius: 12,
                border: `1px solid ${ui.border}`,
                background: ui.surface2,
                color: ui.text,
                padding: "0 12px",
                fontWeight: 700
              }}
            />
          </label>
        </div>

        {draft.repeat === REPEAT_WEEKLY ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 800 }}>요일</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {WEEKDAY_LABELS.map((label, dayIndex) => {
                const active = normalizeRepeatDays(draft.repeatDays).includes(dayIndex)
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleRepeatDay(dayIndex)}
                    style={{
                      height: 34,
                      minWidth: 34,
                      padding: "0 12px",
                      borderRadius: 999,
                      border: `1px solid ${active ? ui.accent : ui.border}`,
                      background: active ? ui.accentSoft : ui.surface2,
                      color: active ? ui.accent : ui.text2,
                      cursor: "pointer",
                      fontWeight: 800
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 800 }}>내용</span>
          <textarea
            value={draft.rawLine}
            onChange={(e) => setDraft((prev) => ({ ...prev, rawLine: e.target.value }))}
            placeholder={
              draft.kind === "task"
                ? defaultCategoryTitle
                  ? `예: @${defaultCategoryTitle};논문, 시물 설계`
                  : "예: @공부;논문, 시물 설계"
                : defaultCategoryTitle
                  ? `예: 13:00;회의 (${defaultCategoryTitle} 탭에서는 @ 없이 입력 가능)`
                  : "예: 13:00;@공부;복습"
            }
            style={{
              width: "100%",
              minHeight: 140,
              borderRadius: 12,
              border: `1px solid ${ui.border}`,
              background: ui.surface2,
              color: ui.text,
              padding: "12px",
              resize: "vertical",
              fontFamily: "inherit",
              fontSize: 14,
              lineHeight: 1.5
            }}
          />
        </label>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          {isEditing ? (
            <button
              type="button"
              onClick={handleDeleteClick}
              style={{
                height: 42,
                padding: "0 18px",
                borderRadius: 12,
                border: "1px solid #ef4444",
                background: ui.surface,
                color: "#dc2626",
                cursor: "pointer",
                fontWeight: 800
              }}
            >
              삭제
            </button>
          ) : (
            <div />
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              onClick={closeAll}
              style={{
                height: 42,
                padding: "0 18px",
                borderRadius: 12,
                border: `1px solid ${ui.border}`,
                background: ui.surface,
                color: ui.text,
                cursor: "pointer",
                fontWeight: 800
              }}
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSaveClick}
              style={{
                height: 42,
                padding: "0 18px",
                borderRadius: 12,
                border: "1px solid transparent",
                background: ui.accent,
                color: "#fff",
                cursor: "pointer",
                fontWeight: 800
              }}
            >
              저장
            </button>
          </div>
        </div>

        {pendingAction ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(15, 23, 42, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16
            }}
          >
            <div
              style={{
                width: "min(420px, 88vw)",
                borderRadius: 14,
                border: `1px solid ${ui.border}`,
                background: ui.surface,
                color: ui.text,
                boxShadow: ui.shadow,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 18 }}>
                {pendingAction === "delete" ? "삭제 범위 선택" : "수정 범위 선택"}
              </div>
              <div style={{ color: ui.text2, lineHeight: 1.5 }}>
                기준 날짜 {editingOccurrence?.dateKey ?? initialDateKey}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[
                  { id: "single", label: "이 날짜만" },
                  { id: "future", label: "이 날짜 포함 이후" },
                  { id: "all", label: "전체" }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => runScopedAction(item.id)}
                    style={{
                      height: 40,
                      padding: "0 14px",
                      borderRadius: 12,
                      border: `1px solid ${ui.border}`,
                      background: ui.surface2,
                      color: ui.text,
                      cursor: "pointer",
                      fontWeight: 800
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                style={{
                  alignSelf: "flex-end",
                  height: 36,
                  padding: "0 12px",
                  borderRadius: 10,
                  border: `1px solid ${ui.border}`,
                  background: ui.surface,
                  color: ui.text,
                  cursor: "pointer",
                  fontWeight: 700
                }}
              >
                취소
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
