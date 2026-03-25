import { keyToTime, keyToYMD } from "./dateUtils"
import {
  parseBlocksAndItems,
  parseDashboardSemicolonLine,
  parseTimePrefix
} from "./plannerText"
import { parseDdaySuffix } from "./taskMarkers"

const DAY_MS = 24 * 60 * 60 * 1000

export function formatDdayDisplay(baseRaw) {
  const normalized = String(baseRaw ?? "").trim()
  if (!normalized) return { time: "", title: "", text: "", display: "" }

  const semicolon = parseDashboardSemicolonLine(normalized, { allowEmptyText: true })
  if (semicolon) {
    const text = String(semicolon.text ?? "").trim()
    const title = String(semicolon.group ?? "").trim()
    const time = String(semicolon.time ?? "").trim()
    const display = `${time ? `${time} ` : ""}${title ? `[${title}] ` : ""}${text}`.trim()
    return { time, title, text, display }
  }

  const timeLine = parseTimePrefix(normalized)
  if (timeLine) {
    const time = String(timeLine.time ?? "").trim()
    const text = String(timeLine.text ?? "").trim()
    return {
      time,
      title: "",
      text,
      display: `${time ? `${time} ` : ""}${text}`.trim()
    }
  }

  return { time: "", title: "", text: normalized, display: normalized }
}

export function getDdayLabel(daysLeft) {
  const days = Number(daysLeft)
  if (!Number.isFinite(days)) return ""
  if (days === 0) return "D-Day"
  if (days > 0) return `D-${days}`
  return `D+${Math.abs(days)}`
}

export function formatDdayDateLabel(dateKey) {
  const raw = String(dateKey ?? "").trim()
  if (!raw) return ""
  const { m, d } = keyToYMD(raw)
  if (!Number.isFinite(m) || !Number.isFinite(d)) return raw
  return `${m}/${d}`
}

export function extractUpcomingDdaysFromPlannerText(
  sourceText,
  baseYear,
  todayKey,
  { maxDays = 10, allowedTitles = null } = {}
) {
  const text = String(sourceText ?? "")
  const todayMs = keyToTime(String(todayKey ?? "").trim())
  if (!Number.isFinite(todayMs)) return []

  const parsed = parseBlocksAndItems(text, baseYear, { allowAnyYear: true })
  const blocks = Array.isArray(parsed?.blocks) ? parsed.blocks : []
  const items = []

  for (const block of blocks) {
    const dateKey = String(block?.dateKey ?? "").trim()
    if (!dateKey) continue
    const targetMs = keyToTime(dateKey)
    if (!Number.isFinite(targetMs)) continue
    const daysLeft = Math.round((targetMs - todayMs) / DAY_MS)
    if (daysLeft < 0 || daysLeft > maxDays) continue

    const body = text.slice(block.bodyStartPos ?? 0, block.blockEndPos ?? 0)
    const lines = String(body ?? "").replace(/\r\n/g, "\n").split("\n")
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      const rawLine = String(lines[lineIndex] ?? "").trim()
      if (!rawLine) continue
      const parsedDday = parseDdaySuffix(rawLine)
      if (!parsedDday) continue
      if (parsedDday.completed === true) continue

      const formatted = formatDdayDisplay(parsedDday.baseRaw)
      if (!formatted.display) continue
      if (allowedTitles && formatted.title && !allowedTitles.has(formatted.title)) continue

      items.push({
        id: `${dateKey}:${lineIndex}:${parsedDday.baseRaw}`,
        dateKey,
        lineIndex,
        rawLine,
        baseRaw: parsedDday.baseRaw,
        completed: parsedDday.completed === true,
        isTask: parsedDday.completed != null,
        isRecurring: false,
        sourceType: "text",
        time: formatted.time,
        title: formatted.title,
        text: formatted.text,
        display: formatted.display,
        daysLeft,
        ddayLabel: getDdayLabel(daysLeft),
        shortDateLabel: formatDdayDateLabel(dateKey)
      })
    }
  }

  items.sort((a, b) => {
    const dayDiff = (a?.daysLeft ?? 0) - (b?.daysLeft ?? 0)
    if (dayDiff !== 0) return dayDiff
    const timeA = String(a?.time ?? "")
    const timeB = String(b?.time ?? "")
    if (timeA && timeB && timeA !== timeB) return timeA.localeCompare(timeB)
    if (timeA && !timeB) return -1
    if (!timeA && timeB) return 1
    return String(a?.display ?? "").localeCompare(String(b?.display ?? ""), "ko")
  })

  return items
}
