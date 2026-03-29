import { useMemo } from "react"
import { getRepeatLabel } from "../utils/recurringRules"

const TASK_RING_BLUE = "#3b82f6"
const DDAY_ACCENT = "#f59e0b"

function formatDateLabel(value) {
  const raw = String(value ?? "").trim()
  if (!raw) return ""
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return raw
  return `${match[1]}.${match[2]}.${match[3]}`
}

function TaskRow({ item, ui, onToggleTask, onOpenTask }) {
  const repeatLabel =
    item?.sourceType === "recurring" ? getRepeatLabel(item?.repeat, item?.repeatInterval) : ""
  const completed = Boolean(item?.completed)

  return (
    <div
      onClick={() => onOpenTask?.(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onOpenTask?.(item)
        }
      }}
      role="button"
      tabIndex={0}
      style={{
        width: "100%",
        textAlign: "left",
        border: `1px solid ${ui.border}`,
        background: ui.surface,
        color: ui.text,
        borderRadius: 16,
        padding: "12px 14px",
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        cursor: "pointer"
      }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onToggleTask?.(item)
        }}
        aria-label={completed ? "Task 완료 해제" : "Task 완료"}
        style={{
          width: 17,
          height: 17,
          borderRadius: 999,
          border: `1.25px solid ${completed ? ui.border : TASK_RING_BLUE}`,
          background: completed ? ui.surface2 : ui.surface,
          color: completed ? ui.text2 : "transparent",
          opacity: completed ? 0.72 : 1,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          cursor: "pointer",
          fontWeight: 900,
          fontSize: 9,
          lineHeight: 1,
          padding: 0,
          marginTop: 2
        }}
      >
        {completed ? "✓" : ""}
      </button>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 4,
          paddingTop: 1
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 6, minWidth: 0, width: "100%" }}>
          {repeatLabel ? (
            <span
              style={{
                height: 18,
                padding: "0 7px",
                borderRadius: 999,
                border: `1px solid ${ui.border}`,
                background: ui.surface2,
                color: ui.text2,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 800,
                lineHeight: 1,
                flexShrink: 0,
                marginTop: 1
              }}
            >
              {repeatLabel}
            </span>
          ) : null}
          <span
            style={{
              minWidth: 0,
              fontSize: 15,
              fontWeight: 800,
              lineHeight: 1.16,
              color: completed ? ui.text2 : ui.text,
              opacity: completed ? 0.62 : 1,
              textDecorationLine: completed ? "line-through" : "none",
              textDecorationColor: completed ? ui.text : "transparent",
              textDecorationThickness: completed ? "2px" : undefined,
              whiteSpace: "normal",
              overflowWrap: "anywhere",
              wordBreak: "break-word"
            }}
          >
            {item?.display}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: ui.text2, fontSize: 12, flexWrap: "wrap" }}>
          <span>{formatDateLabel(item?.dateKey)}</span>
          {item?.title ? <span>{`[${item.title}]`}</span> : null}
        </div>
      </div>
    </div>
  )
}

function DdayRow({ item, ui, onOpenDday }) {
  const repeatLabel =
    item?.sourceType === "recurring" ? getRepeatLabel(item?.repeat, item?.repeatInterval) : ""

  return (
    <div
      onClick={() => onOpenDday?.(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onOpenDday?.(item)
        }
      }}
      role="button"
      tabIndex={0}
      style={{
        width: "100%",
        textAlign: "left",
        border: `1px solid ${ui.border}`,
        background: ui.surface,
        color: ui.text,
        borderRadius: 16,
        padding: "12px 14px",
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        cursor: "pointer"
      }}
    >
      <span
        style={{
          minHeight: 24,
          padding: "0 9px",
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
        {item?.ddayLabel}
      </span>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 5 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 800,
            lineHeight: 1.2,
            whiteSpace: "normal",
            overflowWrap: "anywhere",
            wordBreak: "break-word"
          }}
        >
          {item?.display}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", color: ui.text2, fontSize: 12 }}>
          <span>{formatDateLabel(item?.dateKey)}</span>
          {repeatLabel ? <span>{repeatLabel}</span> : null}
          {item?.title ? <span>{`[${item.title}]`}</span> : null}
        </div>
      </div>
    </div>
  )
}

export default function CollectionsPanel({
  open,
  mode = "tasks",
  onModeChange,
  ui,
  panelFontFamily,
  tasks = [],
  ddays = [],
  onToggleTask,
  onOpenTask,
  onOpenDday,
  onClose
}) {
  const orderedTasks = useMemo(() => (Array.isArray(tasks) ? tasks : []), [tasks])
  const orderedDdays = useMemo(() => (Array.isArray(ddays) ? ddays : []), [ddays])
  const isTaskMode = mode !== "ddays"

  if (!open) return null

  return (
    <div
      style={{
        position: "fixed",
        top: 76,
        right: 12,
        bottom: 12,
        width: "min(420px, calc(100vw - 24px))",
        borderRadius: 22,
        border: `1px solid ${ui.border}`,
        background: ui.surface,
        boxShadow: "0 22px 48px rgba(15, 23, 42, 0.22)",
        zIndex: 140,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        fontFamily: panelFontFamily,
        color: ui.text
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          padding: "16px 18px",
          borderBottom: `1px solid ${ui.border}`
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 900 }}>체크</div>
          <div style={{ fontSize: 12, color: ui.text2, marginTop: 4 }}>Task와 D-day를 한 곳에서 봅니다.</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
            <button
              type="button"
              onClick={() => onModeChange?.("tasks")}
              style={{
                height: 32,
                padding: "0 12px",
                borderRadius: 999,
                border: `1px solid ${isTaskMode ? ui.accent : ui.border}`,
                background: isTaskMode ? ui.surface2 : ui.surface,
                color: isTaskMode ? ui.text : ui.text2,
                fontFamily: "inherit",
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer"
              }}
            >
              Task
            </button>
            <button
              type="button"
              onClick={() => onModeChange?.("ddays")}
              style={{
                height: 32,
                padding: "0 12px",
                borderRadius: 999,
                border: `1px solid ${!isTaskMode ? ui.accent : ui.border}`,
                background: !isTaskMode ? ui.surface2 : ui.surface,
                color: !isTaskMode ? ui.text : ui.text2,
                fontFamily: "inherit",
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer"
              }}
            >
              D-day
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            height: 36,
            padding: "0 14px",
            borderRadius: 12,
            border: `1px solid ${ui.border}`,
            background: ui.surface2,
            color: ui.text,
            fontFamily: "inherit",
            fontWeight: 800,
            cursor: "pointer"
          }}
        >
          닫기
        </button>
      </div>

      <div style={{ padding: 16, overflowY: "auto", minHeight: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        {isTaskMode ? (
          orderedTasks.length ? (
            orderedTasks.map((task) => (
              <TaskRow
                key={task?.id}
                item={task}
                ui={ui}
                onToggleTask={onToggleTask}
                onOpenTask={onOpenTask}
              />
            ))
          ) : (
            <div
              style={{
                borderRadius: 16,
                border: `1px dashed ${ui.border}`,
                background: ui.surface2,
                padding: "18px 16px",
                color: ui.text2,
                fontSize: 13,
                lineHeight: 1.6
              }}
            >
              아직 task가 없습니다.
            </div>
          )
        ) : orderedDdays.length ? (
          orderedDdays.map((item) => (
            <DdayRow key={item?.id} item={item} ui={ui} onOpenDday={onOpenDday} />
          ))
        ) : (
          <div
            style={{
              borderRadius: 16,
              border: `1px dashed ${ui.border}`,
              background: ui.surface2,
              padding: "18px 16px",
              color: ui.text2,
              fontSize: 13,
              lineHeight: 1.6
            }}
          >
            예정된 D-day가 없습니다.
          </div>
        )}
      </div>
    </div>
  )
}
