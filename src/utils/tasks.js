import {
  parseBlocksAndItems,
  parseDashboardSemicolonLine,
  parseTimePrefix
} from "./plannerText"
import { parseTaskSuffix } from "./taskMarkers"

export function formatTaskDisplay(baseRaw) {
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

export function extractTasksFromPlannerText(sourceText, baseYear) {
  const text = String(sourceText ?? "")
  const parsed = parseBlocksAndItems(text, baseYear)
  const blocks = Array.isArray(parsed?.blocks) ? parsed.blocks : []
  const tasks = []

  for (const block of blocks) {
    const dateKey = String(block?.dateKey ?? "").trim()
    if (!dateKey) continue
    const body = text.slice(block.bodyStartPos ?? 0, block.blockEndPos ?? 0)
    const lines = String(body ?? "").replace(/\r\n/g, "\n").split("\n")
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      const rawLine = String(lines[lineIndex] ?? "").trim()
      if (!rawLine) continue
      const parsedTask = parseTaskSuffix(rawLine)
      if (!parsedTask) continue
      const formatted = formatTaskDisplay(parsedTask.baseRaw)
      tasks.push({
        id: `${dateKey}:${lineIndex}:${parsedTask.baseRaw}`,
        dateKey,
        lineIndex,
        rawLine,
        baseRaw: parsedTask.baseRaw,
        completed: parsedTask.completed,
        time: formatted.time,
        title: formatted.title,
        text: formatted.text,
        display: formatted.display
      })
    }
  }

  return tasks
}

export function updateTaskLineStatusInBody(bodyText, lineIndex, completed) {
  const lines = String(bodyText ?? "").replace(/\r\n/g, "\n").split("\n")
  if (!Number.isInteger(lineIndex) || lineIndex < 0 || lineIndex >= lines.length) return String(bodyText ?? "")
  const rawLine = String(lines[lineIndex] ?? "")
  const parsedTask = parseTaskSuffix(rawLine)
  if (!parsedTask) return String(bodyText ?? "")
  const preservedBaseRaw = parsedTask.dday ? `${parsedTask.baseRaw};D` : parsedTask.baseRaw
  lines[lineIndex] = `${preservedBaseRaw};${completed ? "O" : "X"}`
  return lines.join("\n")
}
