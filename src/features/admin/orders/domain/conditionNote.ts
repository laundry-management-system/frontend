import { CONDITION_TAGS, type ConditionTag } from './types.ts'

const MAX_LENGTH = 500

const isTag = (value: string): value is ConditionTag =>
  (CONDITION_TAGS as readonly string[]).includes(value)

/** BE chỉ có một cột `conditionNote`, nên tag được ghép vào đầu: "[Vết bẩn, Bị rách] mô tả". */
export function formatConditionNote(tags: ConditionTag[], text: string): string | null {
  const body = text.trim()
  const head = tags.length ? `[${tags.join(', ')}]` : ''
  const note = [head, body].filter(Boolean).join(' ')
  return note ? note.slice(0, MAX_LENGTH) : null
}

export function parseConditionNote(note: string | null): { tags: ConditionTag[]; text: string } {
  if (!note) return { tags: [], text: '' }
  const match = /^\[([^\]]*)\]\s*/.exec(note)
  if (!match) return { tags: [], text: note.trim() }
  const parts = match[1].split(',').map((s) => s.trim())
  if (!parts.every(isTag)) return { tags: [], text: note.trim() }
  return { tags: parts as ConditionTag[], text: note.slice(match[0].length).trim() }
}
