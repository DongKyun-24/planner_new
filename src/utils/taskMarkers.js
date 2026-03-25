function parseLineMetaSuffixes(rawLine) {
  let baseRaw = String(rawLine ?? "").trim()
  if (!baseRaw) {
    return { baseRaw: "", completed: null, marker: "", dday: false }
  }

  let completed = null
  let marker = ""
  let dday = false

  while (baseRaw) {
    const taskMatch =
      completed == null ? baseRaw.match(/^(.*?);\s*([OX])\s*$/i) : null
    if (taskMatch) {
      const nextBaseRaw = String(taskMatch[1] ?? "").trim()
      if (!nextBaseRaw) break
      baseRaw = nextBaseRaw
      marker = String(taskMatch[2] ?? "").trim().toUpperCase()
      completed = marker === "O"
      continue
    }

    const ddayMatch = !dday ? baseRaw.match(/^(.*?);\s*D\s*$/i) : null
    if (ddayMatch) {
      const nextBaseRaw = String(ddayMatch[1] ?? "").trim()
      if (!nextBaseRaw) break
      baseRaw = nextBaseRaw
      dday = true
      continue
    }

    break
  }

  return { baseRaw, completed, marker, dday }
}

export function parseTaskSuffix(rawLine) {
  const parsed = parseLineMetaSuffixes(rawLine)
  if (parsed.completed == null) return null
  return {
    baseRaw: parsed.baseRaw,
    completed: parsed.completed,
    marker: parsed.marker,
    dday: parsed.dday
  }
}

export function parseDdaySuffix(rawLine) {
  const parsed = parseLineMetaSuffixes(rawLine)
  if (!parsed.dday) return null
  return {
    baseRaw: parsed.baseRaw,
    completed: parsed.completed,
    marker: parsed.marker,
    dday: true
  }
}

export function stripTaskSuffix(rawLine) {
  const parsed = parseLineMetaSuffixes(rawLine)
  return {
    text: parsed.baseRaw || String(rawLine ?? "").trim(),
    completed: parsed.completed,
    dday: parsed.dday
  }
}

export function removeTaskLinesFromBody(bodyText) {
  return String(bodyText ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter((line) => !parseTaskSuffix(String(line ?? "").trim()))
    .join("\n")
}
