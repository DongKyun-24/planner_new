import { formatDateRangeLabel, getRepeatLabel, parseRecurringRawLine } from "../utils/recurringRules"

const TASK_RING_BLUE = "#3b82f6"
const DDAY_ACCENT = "#f59e0b"
const TASK_CONTROL_SIZE = 18
const TASK_ROW_GAP = 5
const TASK_ROW_PADDING = "2px 0"
const REGULAR_TASK_TEXT_OFFSET = 0
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
  minWidth: 0,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 20,
  fontWeight: 500,
  lineHeight: 1.2
}
const REPEAT_BADGE_STYLE = {
  height: 20,
  padding: "0 8px",
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
      onClick={(e) => {
        e.stopPropagation()
        onOpen?.(item)
      }}
      style={{
        width: "100%",
        textAlign: "left",
        border: "none",
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

function TaskCard({ item, ui, memoFontPx, onTaskToggle, onTaskOpen }) {
  const repeatLabel =
    item?.sourceType === "recurring" ? getRepeatLabel(item?.repeat, item?.repeatInterval) : ""
  const recurringDateLabel =
    item?.sourceType === "recurring"
      ? formatDateRangeLabel(item?.familyStartDateKey, item?.repeatUntilKey ?? item?.familyUntilDateKey)
      : ""
  const controlSize = getTaskControlSize(memoFontPx)
  const checkFontSize = getTaskCheckFontSize(controlSize)
  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        onTaskOpen?.(item)
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          e.stopPropagation()
          onTaskOpen?.(item)
        }
      }}
      role="button"
      tabIndex={0}
      style={{
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
          onTaskToggle?.(item)
        }}
        style={{
          width: controlSize,
          height: controlSize,
          borderRadius: 999,
          border: `1.25px solid ${item.completed ? ui.border : TASK_RING_BLUE}`,
          background: item.completed ? ui.surface2 : ui.surface,
          color: item.completed ? ui.text2 : "transparent",
          opacity: item.completed ? 0.72 : 1,
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
          marginTop: 0,
          margin: 0
        }}
      >
        {item.completed ? "✓" : ""}
      </button>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          minWidth: 0,
          minHeight: 20,
          lineHeight: 1.2,
          paddingTop: 0
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: TASK_ROW_GAP,
            minWidth: 0,
            flexWrap: "nowrap",
            paddingLeft: repeatLabel ? 0 : REGULAR_TASK_TEXT_OFFSET
          }}
        >
          {repeatLabel ? (
            <span
              style={{
                ...REPEAT_BADGE_STYLE,
                border: `1px solid ${ui.border}`,
                background: ui.surface2,
                color: ui.text2
              }}
            >
              {repeatLabel}
            </span>
          ) : null}
          {recurringDateLabel ? (
            <span
              style={{
                fontSize: 11,
                color: ui.text2,
                fontWeight: 700,
                lineHeight: 1,
                minHeight: 20,
                display: "inline-flex",
                alignItems: "center",
                flexShrink: 0,
                marginTop: 0
              }}
            >
              {recurringDateLabel}
            </span>
          ) : null}
          <span
            style={{
              ...TASK_TEXT_STYLE,
              fontSize: memoFontPx,
              color: item.completed ? ui.text2 : ui.text,
              opacity: item.completed ? 0.62 : 1,
              textDecoration: item.completed ? "line-through" : "none",
              textDecorationColor: item.completed ? ui.text : "transparent",
              textDecorationThickness: item.completed ? "2px" : undefined
            }}
          >
            {item.display}
          </span>
        </div>
      </div>
    </div>
  )
}

function RecurringScheduleLine({ item, ui, memoFontPx, onOpen }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onOpen?.(item)
      }}
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
        gap: 5,
        flexWrap: "nowrap",
        cursor: "pointer",
        marginLeft: -2
      }}
    >
      <span
        style={{
          ...REPEAT_BADGE_STYLE,
          border: `1px solid ${ui.border}`,
          background: ui.surface2,
          color: ui.text2
        }}
      >
        {item.repeatLabel}
      </span>
      <span
        style={{
          ...REPEAT_META_TEXT_STYLE,
          color: ui.text2,
          fontWeight: 600
        }}
      >
        {item.dateLabel}
      </span>
      <span
        style={{
          minWidth: 0,
          display: "inline-flex",
          alignItems: "center",
          minHeight: 20,
          color: ui.text,
          fontSize: memoFontPx,
          fontWeight: 400,
          lineHeight: 1.25
        }}
      >
        {item.display}
      </span>
    </button>
  )
}

export default function MemoReadView({
  blocks,
  isAll,
  ui,
  highlightTokens,
  todayKey,
  todayDdayItems = [],
  hoveredReadDateKey,
  setHoveredReadDateKey,
  collapsedForActive,
  toggleDashboardCollapse,
  keyToYMD,
  buildHeaderLine,
  activeWindowId,
  setReadBlockRef,
  handleReadBlockClick,
  readScrollMarginTop,
  recurringItemsByDate = {},
  taskItemsByDate = {},
  memoFontPx = 13,
  onTaskToggle,
  onTaskOpen,
  onRecurringOpen,
  onDdayOpen,
  emptyText = "빈 메모입니다. 날짜를 눌러 일정을 적어보세요."
}) {
  if (!blocks || blocks.length === 0) {
    return (
      <div style={{ color: ui.text2, fontWeight: 600, lineHeight: 1.45 }}>
        {emptyText}
      </div>
    )
  }

  return (
    <>
      {blocks.map((block) => {
        if (!block?.dateKey) return null
        const { y, m, d } = keyToYMD(block.dateKey)
        const header = buildHeaderLine(y, m, d)
        const isCollapsed = Boolean(collapsedForActive[block.dateKey])
        const forceVisible = Boolean(block.forceVisible)
        const isToday = block.dateKey === todayKey
        const isHovered = hoveredReadDateKey === block.dateKey
        const blockBorderColor = isHovered
          ? highlightTokens.hover.ring
          : isToday
            ? highlightTokens.today.ring
            : "transparent"

        let hasContent = false
        let orderedItems = []
        const ddayItems = isToday
          ? (Array.isArray(todayDdayItems) ? todayDdayItems : []).filter((item) => String(item?.display ?? "").trim())
          : []
        const taskItems = (Array.isArray(taskItemsByDate?.[block.dateKey]) ? taskItemsByDate[block.dateKey] : [])
          .filter((item) => String(item?.display ?? "").trim())
        const regularTaskItems = taskItems.filter((item) => item?.sourceType !== "recurring")
        const recurringTaskItems = taskItems.filter((item) => item?.sourceType === "recurring")
        const recurringItems = (Array.isArray(recurringItemsByDate?.[block.dateKey]) ? recurringItemsByDate[block.dateKey] : [])
          .map((item) => {
            const parsed = parseRecurringRawLine(item?.rawLine, item?.title ?? "")
            if (parsed.isTask) return null
            return {
              ...item,
              display: parsed.display || item?.display || "",
              repeatLabel: getRepeatLabel(item?.repeat, item?.repeatInterval),
              dateLabel: formatDateRangeLabel(item?.familyStartDateKey, item?.repeatUntilKey ?? item?.familyUntilDateKey)
            }
          })
          .filter((item) => item?.display)
        const useOrderedEntries = isAll && Array.isArray(block.entries)
        const blockGeneral = Array.isArray(block.general) ? block.general : []
        const blockGroups = Array.isArray(block.groups) ? block.groups : []
        const blockTimed = Array.isArray(block.timed) ? block.timed : []

        if (isAll) {
          if (useOrderedEntries) {
            const entries = block.entries ?? []
            for (const item of entries) {
              const text = (item.text ?? "").trim()
              if (!text) continue
              orderedItems.push({
                time: item.time || "",
                text,
                title: item.title || "",
                order: item.order ?? 0
              })
            }
            hasContent = orderedItems.length > 0
          } else {
            const groups = blockGroups
            const groupItemCount = groups.reduce((sum, group) => sum + (group.items?.length ?? 0), 0)
            hasContent = blockGeneral.length > 0 || blockTimed.length > 0 || groupItemCount > 0
            if (hasContent) {
              for (const group of groups) {
                for (const item of group.items ?? []) {
                  const text = (item.text ?? "").trim()
                  if (!text) continue
                  orderedItems.push({
                    time: item.time || "",
                    text,
                    title: group.title,
                    order: item.order ?? 0
                  })
                }
              }
              for (const item of blockTimed) {
                const text = (item.text ?? "").trim()
                if (!text) continue
                orderedItems.push({ time: item.time || "", text, title: "", order: item.order ?? 0 })
              }
              for (const line of blockGeneral) {
                const text = String(line ?? "").trim()
                if (!text) continue
                orderedItems.push({ time: "", text, title: "", order: Number.MAX_SAFE_INTEGER })
              }
              orderedItems.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            }
          }
        } else {
          if (Array.isArray(block.items)) {
            for (const item of block.items) {
              const text = (item.text ?? "").trim()
              if (!text) continue
              orderedItems.push({ time: item.time || "", text, order: item.order ?? 0 })
            }
          }
          hasContent = orderedItems.length > 0
        }

        hasContent =
          hasContent || recurringItems.length > 0 || regularTaskItems.length > 0 || recurringTaskItems.length > 0 || ddayItems.length > 0
        if (!hasContent && !forceVisible) return null

        return (
          <div
            key={block.dateKey}
            ref={setReadBlockRef(block.dateKey)}
            onClick={(e) => {
              e.stopPropagation()
              handleReadBlockClick(block.dateKey)
            }}
            onMouseEnter={() => setHoveredReadDateKey(block.dateKey)}
            onMouseLeave={() => {
              setHoveredReadDateKey((prev) => (prev === block.dateKey ? null : prev))
            }}
            style={{
              marginBottom: 16,
              scrollMarginTop: readScrollMarginTop,
              cursor: "pointer",
              position: "relative",
              border: `1px solid ${blockBorderColor}`,
              borderRadius: 10,
              padding: "6px 8px",
              paddingLeft: isToday ? 14 : 8,
              boxShadow: isToday ? `0 0 0 2px ${highlightTokens.today.soft}` : "none",
              background: isToday
                ? `linear-gradient(90deg, ${highlightTokens.today.soft}, rgba(0,0,0,0) 55%)`
                : "transparent"
            }}
          >
            {isToday && (
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: 4,
                  top: 6,
                  bottom: 6,
                  width: 4,
                  borderRadius: 999,
                  background: highlightTokens.today.ring
                }}
              />
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                fontWeight: 900
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "inline-flex", alignItems: "center", lineHeight: 1.1 }}>
                  {header}
                </div>
                {isToday && (
                  <span
                    style={{
                      minHeight: 24,
                      padding: "0 8px",
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 900,
                      lineHeight: 1,
                      color: highlightTokens.today.pillText,
                      border: `1px solid ${highlightTokens.today.pillText}`,
                      background: highlightTokens.today.soft,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxSizing: "border-box"
                    }}
                  >
                    Today
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleDashboardCollapse(block.dateKey)
                }}
                style={{
                  border: `1px solid ${ui.border}`,
                  background: ui.surface,
                  color: ui.text2,
                  borderRadius: 999,
                  width: 24,
                  height: 24,
                  cursor: "pointer",
                  fontWeight: 900,
                  fontSize: 14,
                  lineHeight: 1,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                title={isCollapsed ? "펼치기" : "접기"}
              >
                {isCollapsed ? "▸" : "▾"}
              </button>
            </div>
            {!isCollapsed && (
              <div style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 4 }}>
                {ddayItems.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 2 }}>
                    {ddayItems.map((item) => (
                      <DdayRow key={`today-dday-${item.id}`} item={item} ui={ui} onOpen={onDdayOpen} />
                    ))}
                  </div>
                ) : null}
                <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingBottom: orderedItems.length > 0 ? 8 : 0 }}>
                  {orderedItems.map((item, idx) => (
                    <div
                      key={`${block.dateKey}-${activeWindowId ?? "tab"}-item-${idx}`}
                      style={{ fontWeight: 400, color: ui.text, lineHeight: 1.25, fontSize: memoFontPx }}
                    >
                      {item.time ? `${item.time} ` : ""}
                      {isAll && item.title ? `[${item.title}] ` : ""}
                      {item.text}
                    </div>
                  ))}
                </div>
                {recurringItems.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      paddingTop: orderedItems.length > 0 ? 4 : 0,
                      borderTop: orderedItems.length > 0 ? `1px dashed ${ui.border}` : "none"
                    }}
                  >
                    {recurringItems.map((item) => (
                      <RecurringScheduleLine
                        key={`${block.dateKey}-recurring-${item.id}`}
                        item={item}
                        ui={ui}
                        memoFontPx={memoFontPx}
                        onOpen={onRecurringOpen}
                      />
                    ))}
                  </div>
                ) : null}
                {regularTaskItems.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      paddingTop: orderedItems.length > 0 || recurringItems.length > 0 ? 4 : 0,
                      borderTop: orderedItems.length > 0 || recurringItems.length > 0 ? `1px dashed ${ui.border}` : "none"
                    }}
                  >
                    {regularTaskItems.map((item) => (
                      <TaskCard
                        key={`${block.dateKey}-task-${item.id}`}
                        item={item}
                        ui={ui}
                        memoFontPx={memoFontPx}
                        onTaskToggle={onTaskToggle}
                        onTaskOpen={onTaskOpen}
                      />
                    ))}
                  </div>
                ) : null}
                {recurringTaskItems.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      paddingTop:
                        orderedItems.length > 0 || recurringItems.length > 0 || regularTaskItems.length > 0 ? 4 : 0,
                      borderTop:
                        orderedItems.length > 0 || recurringItems.length > 0 || regularTaskItems.length > 0
                          ? `1px dashed ${ui.border}`
                          : "none"
                    }}
                  >
                    {recurringTaskItems.map((item) => (
                      <TaskCard
                        key={`${block.dateKey}-recurring-task-${item.id}`}
                        item={item}
                        ui={ui}
                        memoFontPx={memoFontPx}
                        onTaskToggle={onTaskToggle}
                        onTaskOpen={onTaskOpen}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}

