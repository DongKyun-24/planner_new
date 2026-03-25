import { useEffect, useMemo, useRef, useState } from "react"
import { formatDateRangeLabel, getRepeatLabel, parseRecurringRawLine } from "../utils/recurringRules"
import { parseTaskSuffix } from "../utils/taskMarkers"

const TASK_RING_BLUE = "#3b82f6"
const DDAY_ACCENT = "#f59e0b"
const TASK_CONTROL_SIZE = 18
const TASK_ROW_GAP = 6
const TASK_ROW_PADDING = "3px 0"
const REGULAR_TASK_TEXT_OFFSET = 4
const REPEAT_META_TEXT_STYLE = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: 20,
  fontSize: 11,
  color: "inherit",
  fontWeight: 700,
  lineHeight: 1,
  flexShrink: 0
}
const TASK_TEXT_STYLE = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: 20,
  lineHeight: 1.15,
  fontWeight: 500
}
const REPEAT_BADGE_STYLE = {
  height: 18,
  padding: "0 7px",
  borderRadius: 999,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 10,
  fontWeight: 800,
  lineHeight: 1,
  flexShrink: 0
}

function getTaskControlSize(memoFontPx = 13) {
  return Math.max(15, Math.min(20, Math.round(memoFontPx + 1)))
}

function getTaskCheckFontSize(controlSize) {
  return Math.max(8, Math.min(10, Math.round(controlSize * 0.52)))
}

function DdayRow({ item, ui, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen?.(item)}
      style={{
        width: "100%",
        textAlign: "left",
        border: "none",
        outline: "none",
        boxShadow: "none",
        background: "transparent",
        color: ui.text,
        borderRadius: 0,
        padding: "3px 0",
        display: "flex",
        alignItems: "center",
        gap: 7,
        cursor: "pointer"
      }}
    >
      <span
        style={{
          minHeight: 20,
          padding: "0 8px",
          borderRadius: 999,
          background: "#fff7ed",
          color: DDAY_ACCENT,
          border: "1px solid rgba(245, 158, 11, 0.26)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 900,
          lineHeight: 1,
          flexShrink: 0
        }}
      >
        {item.ddayLabel}
      </span>
      <span
        style={{
          fontSize: 11,
          color: ui.text2,
          fontWeight: 800,
          lineHeight: 1,
          flexShrink: 0
        }}
      >
        {item.shortDateLabel}
      </span>
      <span
        style={{
          minWidth: 0,
          fontWeight: 700,
          lineHeight: 1.2,
          whiteSpace: "normal",
          overflowWrap: "anywhere",
          wordBreak: "break-word"
        }}
      >
        {item.display}
      </span>
    </button>
  )
}

function SectionBox({ ui, empty = false, onClick, children }) {
  const clickable = typeof onClick === "function"
  return (
    <div
      data-keep-edit={clickable ? "true" : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? onClick : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
      style={{
        width: "100%",
        minHeight: empty ? 54 : undefined,
        padding: empty ? "10px 12px" : "8px 12px",
        borderRadius: 10,
        border: `1px solid ${ui.border}`,
        background: ui.surface2,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        boxSizing: "border-box",
        cursor: clickable ? "pointer" : "default"
      }}
    >
      {children}
    </div>
  )
}

function RecurringScheduleRow({ item, ui, memoFontPx, onOpen }) {
  return (
    <button
      type="button"
      data-keep-edit="true"
      onClick={() => onOpen?.(item)}
      style={{
        width: "100%",
        textAlign: "left",
        border: "none",
        outline: "none",
        boxShadow: "none",
        background: "transparent",
        color: ui.text,
        borderRadius: 0,
        padding: TASK_ROW_PADDING,
        display: "flex",
        alignItems: "center",
        gap: TASK_ROW_GAP,
        flexWrap: "nowrap",
        cursor: "pointer"
      }}
    >
      <span
        style={{
          ...REPEAT_BADGE_STYLE,
          border: `1px solid ${ui.border}`,
          background: ui.surface,
          color: ui.text2
        }}
      >
        {item.repeatLabel}
      </span>
      <span
        style={{
          ...REPEAT_META_TEXT_STYLE,
          color: ui.text2
        }}
      >
        {item.dateLabel}
      </span>
      <span
        style={{
          ...TASK_TEXT_STYLE,
          minWidth: 0,
          fontSize: memoFontPx
        }}
      >
        {item.display}
      </span>
    </button>
  )
}

function RecurringTaskRow({ item, ui, memoFontPx, onOpen, onToggle }) {
  const controlSize = getTaskControlSize(memoFontPx)
  const checkFontSize = getTaskCheckFontSize(controlSize)
  return (
    <div
      data-keep-edit="true"
      onClick={() => onOpen?.(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onOpen?.(item)
        }
      }}
      role="button"
      tabIndex={0}
      style={{
        width: "100%",
        textAlign: "left",
        border: "none",
        background: "transparent",
        color: ui.text,
        borderRadius: 0,
        padding: TASK_ROW_PADDING,
        display: "flex",
        alignItems: "center",
        gap: TASK_ROW_GAP,
        cursor: "pointer",
        outline: "none",
        boxShadow: "none"
      }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onToggle?.(item)
        }}
        style={{
          width: controlSize,
          height: controlSize,
          borderRadius: 999,
          border: `1.25px solid ${item.completed ? ui.accent : TASK_RING_BLUE}`,
          background: item.completed ? ui.accent : ui.surface,
          color: item.completed ? "#fff" : "transparent",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          cursor: "pointer",
          fontWeight: 900,
          fontSize: checkFontSize,
          lineHeight: 1,
          padding: 0,
          alignSelf: "center",
          margin: 0
        }}
      >
        ??      </button>
      <span
        style={{
          ...REPEAT_BADGE_STYLE,
          border: `1px solid ${ui.border}`,
          background: ui.surface,
          color: ui.text2
        }}
      >
        {item.repeatLabel}
      </span>
      <span style={{ fontSize: 11, color: ui.text2, fontWeight: 700, lineHeight: 1.2, flexShrink: 0 }}>
        {item.dateLabel}
      </span>
      <span
        style={{
          ...TASK_TEXT_STYLE,
          minWidth: 0,
          fontSize: memoFontPx,
          color: item.completed ? ui.text2 : ui.text,
          textDecoration: item.completed ? "line-through" : "none"
        }}
      >
        {item.display}
      </span>
    </div>
  )
}

function getMentionContext(value, caret) {
  if (caret < 0) return null
  const lineStart = value.lastIndexOf("\n", Math.max(0, caret - 1)) + 1
  const linePrefix = value.slice(lineStart, caret)
  const atOffset = linePrefix.lastIndexOf("@")
  if (atOffset === -1) return null

  const anchorPos = lineStart + atOffset
  const beforeChar = anchorPos > 0 ? value[anchorPos - 1] : ""
  if (beforeChar && beforeChar !== ";" && !/\s/.test(beforeChar)) return null

  const query = value.slice(anchorPos + 1, caret)
  if (/[\s;@]/.test(query)) return null

  let tokenEnd = anchorPos + 1
  while (tokenEnd < value.length) {
    const ch = value[tokenEnd]
    if (ch === ";" || /\s/.test(ch) || ch === "@") break
    tokenEnd += 1
  }
  if (tokenEnd < caret) return null

  return { anchorPos, tokenEnd, query }
}

function buildMentionMatches(editableWindows, query) {
  const q = String(query ?? "").trim().toLowerCase()
  if (!q) return editableWindows
  return editableWindows.filter((w) => String(w?.title ?? "").toLowerCase().includes(q))
}

function splitDayListSections(sourceText) {
  const normalized = String(sourceText ?? "").replace(/\r\n/g, "\n")
  const lines = normalized.split("\n")
  const scheduleLines = []
  const taskLines = []
  const taskLineMap = []

  lines.forEach((line, index) => {
    if (parseTaskSuffix(String(line ?? "").trim())) {
      taskLines.push(String(line ?? ""))
      taskLineMap.push(index)
      return
    }
    scheduleLines.push(String(line ?? ""))
  })

  return {
    scheduleText: scheduleLines.join("\n").trim(),
    taskText: taskLines.join("\n").trim(),
    taskLineMap
  }
}

function normalizeTaskDraftLine(line) {
  const raw = String(line ?? "")
  const trimmed = raw.trim()
  if (!trimmed) return ""
  if (parseTaskSuffix(trimmed)) return trimmed
  return `${trimmed};X`
}

function joinDayListSections(scheduleText, taskText) {
  const schedule = String(scheduleText ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => String(line ?? "").trim())
    .filter(Boolean)
    .join("\n")
  const task = String(taskText ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map(normalizeTaskDraftLine)
    .filter(Boolean)
    .join("\n")
  return [schedule, task].filter(Boolean).join("\n")
}

function getDraftTextareaHeight(text, { minLines = 3, maxLines = 10 } = {}) {
  const normalized = String(text ?? "").replace(/\r\n/g, "\n")
  const lineCount = normalized ? normalized.split("\n").length : 0
  const visibleLines = Math.max(minLines, Math.min(maxLines, lineCount + 1))
  return visibleLines * 24 + 22
}

export default function DayListModal({
  open,
  onClose,
  readOnly = false,
  ui,
  highlightTokens,
  dayListTitle,
  isToday = false,
  dayListMode,
  setDayListMode,
  dayListEditText,
  setDayListEditText,
  applyDayListEdit,
  dayListReadItems,
  memoFontPx,
  editableWindows = [],
  ddayItems = [],
  recurringItems = [],
  taskItems = [],
  onTaskToggle,
  onDdayOpen,
  onRecurringCreate,
  onRecurringSelect
}) {
  const scheduleTextareaRef = useRef(null)
  const taskTextareaRef = useRef(null)
  const activeTextareaRef = useRef(null)
  const mentionOptionRefs = useRef(new Map())
  const backdropPressStartedRef = useRef(false)
  const [pendingTaskLineIndex, setPendingTaskLineIndex] = useState(null)
  const [scheduleDraftText, setScheduleDraftText] = useState("")
  const [taskDraftText, setTaskDraftText] = useState("")
  const [mentionState, setMentionState] = useState({
    visible: false,
    query: "",
    anchorPos: -1,
    tokenEnd: -1
  })
  const [mentionHoverId, setMentionHoverId] = useState(null)

  const effectiveMode = readOnly ? "read" : dayListMode
  const mentionMatches = useMemo(
    () => buildMentionMatches(editableWindows, mentionState.query),
    [editableWindows, mentionState.query]
  )
  const splitSections = useMemo(() => splitDayListSections(dayListEditText), [dayListEditText])
  const readIsAll = Boolean(dayListReadItems?.isAll)
  const readOrderedItems = useMemo(() => {
    if (Array.isArray(dayListReadItems?.orderedItems)) {
      return dayListReadItems.orderedItems
        .map((item) => ({
          time: String(item?.time ?? "").trim(),
          text: String(item?.text ?? "").trim(),
          title: String(item?.title ?? "").trim()
        }))
        .filter((item) => item.text)
    }

    const timed = Array.isArray(dayListReadItems?.timedItems) ? dayListReadItems.timedItems : []
    const noTime = Array.isArray(dayListReadItems?.noTimeItems) ? dayListReadItems.noTimeItems : []
    const ordered = []

    for (const item of timed) {
      if (item && typeof item === "object") {
        ordered.push({
          time: String(item.time ?? "").trim(),
          text: String(item.text ?? "").trim(),
          title: String(item.title ?? "").trim()
        })
      } else {
        ordered.push({ time: "", text: String(item ?? "").trim(), title: "" })
      }
    }
    for (const item of noTime) {
      if (item && typeof item === "object") {
        ordered.push({
          time: "",
          text: String(item.text ?? "").trim(),
          title: String(item.title ?? "").trim()
        })
      } else {
        ordered.push({ time: "", text: String(item ?? "").trim(), title: "" })
      }
    }
    return ordered.filter((item) => item.text)
  }, [dayListReadItems])
  const recurringScheduleCards = useMemo(() => {
    return (Array.isArray(recurringItems) ? recurringItems : [])
      .map((item) => {
        const parsed = parseRecurringRawLine(item?.rawLine, item?.title ?? "")
        if (parsed.isTask) return null
        return {
          ...item,
          display: parsed.display || item?.display || "",
          repeatLabel: getRepeatLabel(item?.repeat, item?.repeatInterval),
          dateLabel: formatDateRangeLabel(item?.familyStartDateKey, item?.familyUntilDateKey)
        }
      })
      .filter((item) => item?.display)
  }, [recurringItems])
  const taskCards = useMemo(() => {
    return (Array.isArray(taskItems) ? taskItems : []).filter((item) => String(item?.display ?? "").trim())
  }, [taskItems])
  const regularTaskCards = useMemo(
    () => taskCards.filter((item) => item?.sourceType !== "recurring"),
    [taskCards]
  )
  const recurringTaskCards = useMemo(
    () =>
      taskCards
        .filter((item) => item?.sourceType === "recurring")
        .map((item) => ({
          ...item,
          repeatLabel: getRepeatLabel(item?.repeat, item?.repeatInterval),
          dateLabel: formatDateRangeLabel(item?.familyStartDateKey, item?.familyUntilDateKey)
        })),
    [taskCards]
  )
  const todayDdayCards = useMemo(() => {
    return (Array.isArray(ddayItems) ? ddayItems : []).filter((item) => String(item?.display ?? "").trim())
  }, [ddayItems])
  const scheduleDraftHeight = useMemo(
    () => getDraftTextareaHeight(scheduleDraftText, { minLines: 4, maxLines: 12 }),
    [scheduleDraftText]
  )
  const taskDraftHeight = useMemo(
    () => getDraftTextareaHeight(taskDraftText, { minLines: 3, maxLines: 8 }),
    [taskDraftText]
  )
  const taskControlSize = getTaskControlSize(memoFontPx)
  const taskCheckFontSize = getTaskCheckFontSize(taskControlSize)

  function hideMentionMenu() {
    setMentionState((prev) =>
      prev.visible || prev.query || prev.anchorPos !== -1 || prev.tokenEnd !== -1
        ? { visible: false, query: "", anchorPos: -1, tokenEnd: -1 }
        : prev
    )
  }

  function refreshMentionMenu() {
    if (readOnly || effectiveMode !== "edit") {
      hideMentionMenu()
      return
    }
    const ta = activeTextareaRef.current
    if (!ta) return
    if (document.activeElement !== ta || ta.selectionStart !== ta.selectionEnd) {
      hideMentionMenu()
      return
    }

    const value = ta.value ?? ""
    const caret = ta.selectionStart ?? 0
    const context = getMentionContext(value, caret)
    if (!context) {
      hideMentionMenu()
      return
    }

    const nextMatches = buildMentionMatches(editableWindows, context.query)
    if (nextMatches.length === 0) {
      hideMentionMenu()
      return
    }

    setMentionState({
      visible: true,
      query: context.query,
      anchorPos: context.anchorPos,
      tokenEnd: context.tokenEnd
    })
    setMentionHoverId((prev) => (nextMatches.some((item) => item.id === prev) ? prev : nextMatches[0]?.id ?? null))
  }

  function updateDayListText(nextText) {
    setDayListEditText(nextText)
    applyDayListEdit(nextText)
  }

  function updateSplitDrafts(nextScheduleText, nextTaskText) {
    setScheduleDraftText(nextScheduleText)
    setTaskDraftText(nextTaskText)
    updateDayListText(joinDayListSections(nextScheduleText, nextTaskText))
  }

  function beginEditMode(taskLineIndex = null) {
    const nextSplit = splitDayListSections(dayListEditText)
    setScheduleDraftText(nextSplit.scheduleText)
    setTaskDraftText(nextSplit.taskText)
    setPendingTaskLineIndex(Number.isInteger(taskLineIndex) ? taskLineIndex : null)
    setDayListMode("edit")
  }

  function handleEditShellPointerDownCapture(e) {
    if (readOnly || effectiveMode !== "edit") return
    const target = e.target instanceof Element ? e.target : null
    if (!target) return
    if (target.closest("textarea, button, input, select, option, [data-keep-edit='true']")) return
    setDayListMode("read")
  }

  function scrollMentionOptionIntoView(optionId) {
    if (!optionId) return
    const target = mentionOptionRefs.current.get(optionId)
    if (!target) return
    target.scrollIntoView({ block: "nearest" })
  }

  function handleMentionPick(title) {
    const ta = activeTextareaRef.current
    if (!ta) return
    const value = ta.value ?? ""
    const caret = ta.selectionStart ?? 0
    const context =
      getMentionContext(value, caret) ??
      (mentionState.anchorPos >= 0 && mentionState.tokenEnd >= mentionState.anchorPos
        ? { anchorPos: mentionState.anchorPos, tokenEnd: mentionState.tokenEnd }
        : null)
    if (!context) return

    // Only replace the full token when it is already a category mention like "@title;...".
    // If the user inserted "@" in front of existing text, keep that trailing text intact.
    const replaceFullToken = value[context.tokenEnd] === ";"
    const replaceEnd = replaceFullToken
      ? Math.max(context.tokenEnd, context.anchorPos + 1)
      : Math.max(caret, context.anchorPos + 1)
    const nextChar = value[replaceEnd] ?? ""
    const insert = `@${title}${nextChar === ";" ? "" : ";"}`
    const nextText = value.slice(0, context.anchorPos) + insert + value.slice(replaceEnd)
    const nextCaret = context.anchorPos + insert.length
    const isTaskEditor = ta === taskTextareaRef.current
    const nextScheduleDraft = isTaskEditor ? scheduleDraftText : nextText
    const nextTaskDraft = isTaskEditor ? nextText : taskDraftText

    updateSplitDrafts(nextScheduleDraft, nextTaskDraft)
    hideMentionMenu()
    requestAnimationFrame(() => {
      const el = activeTextareaRef.current
      if (!el) return
      el.focus()
      el.setSelectionRange(nextCaret, nextCaret)
      refreshMentionMenu()
    })
  }

  useEffect(() => {
    if (!open || effectiveMode !== "edit") {
      const rafId = requestAnimationFrame(() => {
        hideMentionMenu()
      })
      return () => cancelAnimationFrame(rafId)
    }
  }, [open, effectiveMode])

  useEffect(() => {
    if (!mentionState.visible || !mentionHoverId) return
    const rafId = requestAnimationFrame(() => {
      scrollMentionOptionIntoView(mentionHoverId)
    })
    return () => cancelAnimationFrame(rafId)
  }, [mentionState.visible, mentionHoverId])

  useEffect(() => {
    if (!open || effectiveMode !== "edit") return
    if (!Number.isInteger(pendingTaskLineIndex) || pendingTaskLineIndex < 0) return

    const taskEditorIndex = splitSections.taskLineMap.indexOf(pendingTaskLineIndex)
    const lines = String(taskDraftText ?? "").replace(/\r\n/g, "\n").split("\n")
    const targetIndex = Math.max(0, Math.min(taskEditorIndex >= 0 ? taskEditorIndex : 0, Math.max(0, lines.length - 1)))

    let caretPos = 0
    for (let i = 0; i < targetIndex; i += 1) {
      caretPos += String(lines[i] ?? "").length + 1
    }

    const rafId = requestAnimationFrame(() => {
      const ta = taskTextareaRef.current
      if (!ta) return
      activeTextareaRef.current = ta
      ta.focus()
      ta.setSelectionRange(caretPos, caretPos)
      refreshMentionMenu()
      setPendingTaskLineIndex(null)
    })

    return () => cancelAnimationFrame(rafId)
  }, [open, effectiveMode, pendingTaskLineIndex, splitSections.taskLineMap, taskDraftText])

  if (!open) return null

  return (
    <div
      onPointerDown={(e) => {
        backdropPressStartedRef.current = e.target === e.currentTarget
      }}
      onPointerUp={(e) => {
        const shouldClose = backdropPressStartedRef.current && e.target === e.currentTarget
        backdropPressStartedRef.current = false
        if (shouldClose) onClose()
      }}
      onPointerCancel={() => {
        backdropPressStartedRef.current = false
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 200
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onPointerDownCapture={handleEditShellPointerDownCapture}
        style={{
          width: "min(520px, 92vw)",
          maxHeight: "80vh",
          background: ui.surface,
          color: ui.text,
          borderRadius: 12,
          border: `1px solid ${ui.border}`,
          boxShadow: ui.shadow,
          padding: 14,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          overflowY: "auto"
        }}
        >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <div
              style={{
                fontWeight: 900,
                display: "inline-flex",
                alignItems: "center",
                lineHeight: 1.1
              }}
            >
              {dayListTitle}
            </div>
            {isToday ? (
              <span
                style={{
                  minHeight: 24,
                  padding: "0 8px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 900,
                  lineHeight: 1,
                  color: highlightTokens?.today?.pillText ?? ui.accent,
                  border: `1px solid ${highlightTokens?.today?.pillText ?? ui.accent}`,
                  background: highlightTokens?.today?.soft ?? ui.surface2,
                  flexShrink: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxSizing: "border-box"
                }}
              >
                Today
              </span>
            ) : null}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              onClick={() => setDayListMode("read")}
              style={{
                height: 28,
                padding: "0 10px",
                borderRadius: 8,
                border: `1px solid ${ui.border}`,
                background: effectiveMode === "read" ? ui.accent : ui.surface,
                color: effectiveMode === "read" ? "#fff" : ui.text,
                cursor: "pointer",
                fontWeight: 800
              }}
            >
              Read
            </button>
            {!readOnly && (
              <button
                type="button"
                onClick={() => beginEditMode()}
                style={{
                  height: 28,
                  padding: "0 10px",
                  borderRadius: 8,
                  border: `1px solid ${ui.border}`,
                  background: effectiveMode === "edit" ? ui.accent : ui.surface,
                  color: effectiveMode === "edit" ? "#fff" : ui.text,
                  cursor: "pointer",
                  fontWeight: 800
                }}
              >
                Edit
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                height: 28,
                padding: "0 10px",
                borderRadius: 8,
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
        </div>

        {effectiveMode === "edit" ? (
          <div style={{ position: "relative", marginTop: 10 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: ui.text2 }}>일정</span>
                  <textarea
                  ref={scheduleTextareaRef}
                  value={scheduleDraftText}
                  onFocus={() => {
                    activeTextareaRef.current = scheduleTextareaRef.current
                    refreshMentionMenu()
                  }}
                  onChange={(e) => {
                    updateSplitDrafts(e.target.value, taskDraftText)
                    requestAnimationFrame(refreshMentionMenu)
                  }}
                  onClick={refreshMentionMenu}
                  onSelect={refreshMentionMenu}
                  onKeyUp={refreshMentionMenu}
                  onBlur={hideMentionMenu}
                  onKeyDown={(e) => {
                    if (!mentionState.visible || mentionMatches.length === 0) return
                    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                      e.preventDefault()
                      setMentionHoverId((prev) => {
                        const currentIndex = mentionMatches.findIndex((item) => item.id === prev)
                        const delta = e.key === "ArrowDown" ? 1 : -1
                        const baseIndex = currentIndex >= 0 ? currentIndex : delta > 0 ? -1 : 0
                        const nextIndex = (baseIndex + delta + mentionMatches.length) % mentionMatches.length
                        return mentionMatches[nextIndex]?.id ?? null
                      })
                      return
                    }
                    if (e.key === "Enter" || e.key === "Tab") {
                      e.preventDefault()
                      const target =
                        mentionMatches.find((item) => item.id === mentionHoverId) ?? mentionMatches[0]
                      if (target) handleMentionPick(target.title)
                      return
                    }
                    if (e.key === "Escape") {
                      e.preventDefault()
                      hideMentionMenu()
                    }
                  }}
                  placeholder="예: 10:00-13:00;@연애;IPR"
                  style={{
                    width: "100%",
                    height: scheduleDraftHeight,
                    maxHeight: "40vh",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: `1px solid ${ui.border2}`,
                    background: ui.surface2,
                    color: ui.text,
                    fontSize: memoFontPx,
                    lineHeight: 1.6,
                    fontFamily: "inherit",
                    fontWeight: 600,
                    resize: "vertical"
                  }}
                />
              </label>
            </div>
            {mentionState.visible && mentionMatches.length > 0 ? (
              <div
                style={{
                  position: "absolute",
                  right: 12,
                  top: 12,
                  minWidth: 120,
                  maxHeight: 170,
                  overflowY: "auto",
                  borderRadius: 8,
                  border: `1px solid ${ui.border}`,
                  background: ui.surface,
                  boxShadow: ui.shadow,
                  zIndex: 4,
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                {mentionMatches.map((w) => (
                  <button
                    key={w.id}
                    ref={(el) => {
                      if (el) mentionOptionRefs.current.set(w.id, el)
                      else mentionOptionRefs.current.delete(w.id)
                    }}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      handleMentionPick(w.title)
                    }}
                    onMouseEnter={() => setMentionHoverId(w.id)}
                    style={{
                      height: 30,
                      padding: "0 10px",
                      textAlign: "left",
                      cursor: "pointer",
                      color: ui.text,
                      fontWeight: 700,
                      border: mentionHoverId === w.id ? `2px solid ${ui.accent}` : "2px solid transparent",
                      background: mentionHoverId === w.id ? ui.surface2 : "transparent",
                      boxSizing: "border-box"
                    }}
                  >
                    {w.title}
                  </button>
                ))}
              </div>
            ) : null}
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              <SectionBox
                ui={ui}
                empty={recurringScheduleCards.length === 0}
                onClick={recurringScheduleCards.length === 0 ? () => onRecurringCreate?.("schedule") : undefined}
              >
                {recurringScheduleCards.length === 0 ? (
                  <div style={{ color: ui.text2, fontSize: 12, lineHeight: 1.45 }}>
                    반복일정을 추가하려면 이 영역을 누르세요.
                  </div>
                ) : (
                  recurringScheduleCards.map((item) => (
                    <RecurringScheduleRow
                      key={`day-recurring-edit-${item.id}`}
                      item={item}
                      ui={ui}
                      memoFontPx={memoFontPx}
                      onOpen={onRecurringSelect}
                    />
                  ))
                )}
              </SectionBox>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: ui.text2 }}>Task</span>
                  <textarea
                  ref={taskTextareaRef}
                  value={taskDraftText}
                  onFocus={() => {
                    activeTextareaRef.current = taskTextareaRef.current
                    refreshMentionMenu()
                  }}
                  onChange={(e) => {
                    updateSplitDrafts(scheduleDraftText, e.target.value)
                    requestAnimationFrame(refreshMentionMenu)
                  }}
                  onClick={refreshMentionMenu}
                  onSelect={refreshMentionMenu}
                  onKeyUp={refreshMentionMenu}
                  onBlur={hideMentionMenu}
                  onKeyDown={(e) => {
                    if (!mentionState.visible || mentionMatches.length === 0) return
                    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                      e.preventDefault()
                      setMentionHoverId((prev) => {
                        const currentIndex = mentionMatches.findIndex((item) => item.id === prev)
                        const delta = e.key === "ArrowDown" ? 1 : -1
                        const baseIndex = currentIndex >= 0 ? currentIndex : delta > 0 ? -1 : 0
                        const nextIndex = (baseIndex + delta + mentionMatches.length) % mentionMatches.length
                        return mentionMatches[nextIndex]?.id ?? null
                      })
                      return
                    }
                    if (e.key === "Enter" || e.key === "Tab") {
                      e.preventDefault()
                      const target =
                        mentionMatches.find((item) => item.id === mentionHoverId) ?? mentionMatches[0]
                      if (target) handleMentionPick(target.title)
                      return
                    }
                    if (e.key === "Escape") {
                      e.preventDefault()
                      hideMentionMenu()
                    }
                  }}
                  placeholder="예: @공부;논문, 시물 설계;X"
                  style={{
                    width: "100%",
                    height: taskDraftHeight,
                    maxHeight: "24vh",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: `1px solid ${ui.border2}`,
                    background: ui.surface2,
                    color: ui.text,
                    fontSize: memoFontPx,
                    lineHeight: 1.6,
                    fontFamily: "inherit",
                    fontWeight: 600,
                    resize: "vertical"
                  }}
                />
              </label>
              <SectionBox
                ui={ui}
                empty={recurringTaskCards.length === 0}
                onClick={recurringTaskCards.length === 0 ? () => onRecurringCreate?.("task") : undefined}
              >
                {recurringTaskCards.length === 0 ? (
                  <div style={{ color: ui.text2, fontSize: 12, lineHeight: 1.45 }}>
                    반복 Task를 추가하려면 이 영역을 누르세요.
                  </div>
                ) : (
                  recurringTaskCards.map((item) => (
                    <RecurringTaskRow
                      key={`day-recurring-task-edit-${item.id}`}
                      item={item}
                      ui={ui}
                      memoFontPx={memoFontPx}
                      onOpen={onRecurringSelect}
                      onToggle={onTaskToggle}
                    />
                  ))
                )}
              </SectionBox>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 12 }}>
            {isToday && todayDdayCards.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {todayDdayCards.map((item) => (
                  <DdayRow key={`day-dday-${item.id}`} item={item} ui={ui} onOpen={onDdayOpen} />
                ))}
              </div>
            ) : null}
            <div style={{ fontSize: 12, fontWeight: 800, color: ui.text2 }}>일정</div>
            <SectionBox
              ui={ui}
              empty={readOrderedItems.length === 0}
              onClick={!readOnly ? () => beginEditMode() : undefined}
            >
              {readIsAll ? (
                <>
                  {readOrderedItems.map((item, idx) => (
                    <div
                      key={`daylist-all-${idx}`}
                      style={{ color: ui.text, lineHeight: 1.25, fontSize: memoFontPx }}
                    >
                      {item.time ? `${item.time} ` : ""}
                      {item.title ? `[${item.title}] ` : ""}
                      {item.text}
                    </div>
                  ))}
                  {readOrderedItems.length === 0 &&
                  regularTaskCards.length === 0 &&
                  recurringScheduleCards.length === 0 &&
                  recurringTaskCards.length === 0 ? (
                    <div style={{ color: ui.text2 }}>No content.</div>
                  ) : null}
                </>
              ) : (
                <>
                  {readOrderedItems.map((item, idx) => (
                    <div
                      key={`daylist-tab-${idx}`}
                      style={{ color: ui.text, lineHeight: 1.25, fontSize: memoFontPx }}
                    >
                      {item.time ? `${item.time} ` : ""}
                      {item.text}
                    </div>
                  ))}
                  {readOrderedItems.length === 0 &&
                  regularTaskCards.length === 0 &&
                  recurringScheduleCards.length === 0 &&
                  recurringTaskCards.length === 0 ? (
                    <div style={{ color: ui.text2 }}>No content.</div>
                  ) : null}
                </>
              )}
            </SectionBox>
            <SectionBox
              ui={ui}
              empty={recurringScheduleCards.length === 0}
              onClick={recurringScheduleCards.length === 0 ? () => onRecurringCreate?.("schedule") : undefined}
            >
              {recurringScheduleCards.length === 0 ? (
                <div style={{ color: ui.text2, fontSize: 12, lineHeight: 1.45 }}>
                  반복일정을 추가하려면 이 영역을 누르세요.
                </div>
              ) : (
                recurringScheduleCards.map((item) => (
                  <RecurringScheduleRow
                    key={`day-recurring-read-${item.id}`}
                    item={item}
                    ui={ui}
                    memoFontPx={memoFontPx}
                    onOpen={onRecurringSelect}
                  />
                ))
              )}
            </SectionBox>
            <div style={{ fontSize: 12, fontWeight: 800, color: ui.text2 }}>Task</div>
            <SectionBox
              ui={ui}
              empty={regularTaskCards.length === 0}
              onClick={regularTaskCards.length === 0 && !readOnly ? () => beginEditMode() : undefined}
            >
            {regularTaskCards.map((item) => (
              <div
                key={`day-task-read-${item.id}`}
                onClick={() => {
                  if (readOnly) return
                  beginEditMode(Number.isInteger(item?.lineIndex) ? item.lineIndex : 0)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    if (readOnly) return
                    beginEditMode(Number.isInteger(item?.lineIndex) ? item.lineIndex : 0)
                  }
                }}
                role="button"
                tabIndex={0}
                style={{
                  width: "100%",
                  textAlign: "left",
                  color: ui.text,
                  padding: TASK_ROW_PADDING,
                  boxSizing: "border-box",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: TASK_ROW_GAP,
                  outline: "none",
                  boxShadow: "none"
                }}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onTaskToggle?.(item)
                  }}
                  style={{
                    width: taskControlSize,
                    height: taskControlSize,
                    borderRadius: 999,
                    border: `1.25px solid ${item.completed ? ui.accent : TASK_RING_BLUE}`,
                    background: item.completed ? ui.accent : ui.surface,
                    color: item.completed ? "#fff" : "transparent",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    cursor: "pointer",
                    fontWeight: 900,
                    fontSize: taskCheckFontSize,
                    lineHeight: 1,
                    padding: 0,
                    alignSelf: "center",
                    margin: 0
                  }}
                >
                  ??                </button>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    minHeight: 20,
                    minWidth: 0,
                    lineHeight: 1.15,
                    paddingLeft: REGULAR_TASK_TEXT_OFFSET
                  }}
                >
                  <span
                    style={{
                      ...TASK_TEXT_STYLE,
                      fontSize: memoFontPx,
                      color: item.completed ? ui.text2 : ui.text,
                      textDecoration: item.completed ? "line-through" : "none"
                    }}
                  >
                    {item.display}
                  </span>
                </div>
              </div>
            ))}
            </SectionBox>
            <SectionBox
              ui={ui}
              empty={recurringTaskCards.length === 0}
              onClick={recurringTaskCards.length === 0 ? () => onRecurringCreate?.("task") : undefined}
            >
              {recurringTaskCards.length === 0 ? (
                <div style={{ color: ui.text2, fontSize: 12, lineHeight: 1.45 }}>
                  반복 Task를 추가하려면 이 영역을 누르세요.
                </div>
              ) : (
                recurringTaskCards.map((item) => (
                  <RecurringTaskRow
                    key={`day-recurring-task-read-${item.id}`}
                    item={item}
                    ui={ui}
                    memoFontPx={memoFontPx}
                    onOpen={onRecurringSelect}
                    onToggle={onTaskToggle}
                  />
                ))
              )}
            </SectionBox>
          </div>
        )}
      </div>
    </div>
  )
}
