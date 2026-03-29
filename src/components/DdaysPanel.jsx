import { useMemo } from "react"
import { getRepeatLabel } from "../utils/recurringRules"

const DDAY_ACCENT = "#f59e0b"

function formatDateLabel(value) {
  const raw = String(value ?? "").trim()
  if (!raw) return ""
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return raw
  return `${match[1]}.${match[2]}.${match[3]}`
}

export default function DdaysPanel({
  open,
  ui,
  panelFontFamily,
  ddays = [],
  onOpenDday,
  onClose
}) {
  const orderedDdays = useMemo(() => (Array.isArray(ddays) ? ddays : []), [ddays])

  if (!open) return null

  function renderDday(item) {
    const repeatLabel =
      item?.sourceType === "recurring" ? getRepeatLabel(item?.repeat, item?.repeatInterval) : ""

    return (
      <div
        key={item.id}
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
          {item.ddayLabel}
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
            {item.display}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
              color: ui.text2,
              fontSize: 12
            }}
          >
            <span>{formatDateLabel(item.dateKey)}</span>
            {repeatLabel ? <span>{repeatLabel}</span> : null}
            {item.title ? <span>{`[${item.title}]`}</span> : null}
          </div>
        </div>
      </div>
    )
  }

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
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "16px 18px",
          borderBottom: `1px solid ${ui.border}`
        }}
      >
        <div>
          <div style={{ fontSize: 22, fontWeight: 900 }}>D-days</div>
          <div style={{ fontSize: 12, color: ui.text2, marginTop: 4 }}>
            Add `;D` at the end of a line to collect it here.
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
          Close
        </button>
      </div>

      <div style={{ padding: 16, overflowY: "auto", minHeight: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        {orderedDdays.length ? (
          orderedDdays.map(renderDday)
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
            No upcoming D-days yet. Try marking a line with `;D`.
          </div>
        )}
      </div>
    </div>
  )
}
