/**
 * Creates a set of parser utility functions for a specific Govspeak block extension.
 * This factory uses a closure to hold the configuration, making the returned
 * functions more efficient and easier to use.
 *
 * @param {object} config - The configuration for the block parser.
 * @param {string} config.marker - The character(s) that define the block boundaries.
 * @param {string} config.tokenType - The base name for the generated tokens.
 * @param {object} config.tokenAttrs - The HTML attributes to add to the block's container.
 * @returns {object} An object containing the specialised parser functions.
 */
export function createGovspeakBlockParser({ marker, tokenType, tokenAttrs }) {
  const escMarker = marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const INLINE_CLOSING_RE = new RegExp(`^(.*\\S)\\s+${escMarker}\\s*$`)

  /**
   * A reusable parser for single-line Govspeak blocks.
   * e.g. `^ content ^` or `$E content $E`
   * @param {string} trimmedLine - The line content to parse.
   * @param {boolean} requireClosingMarker - Whether the closing marker is mandatory.
   * @returns {string|null} The extracted content, or null if it doesn't match.
   */
  function parseSingleLine(trimmedLine, requireClosingMarker = true) {
    const closing = requireClosingMarker ? `\\s+${escMarker}` : `(?:\\s+${escMarker})?`
    const singleLineRe = new RegExp(`^${escMarker}\\s+([\\s\\S]*?)${closing}$`)
    const match = trimmedLine.match(singleLineRe)
    return match ? match[1].trim() : null
  }

  /**
   * A reusable parser for multi-line Govspeak blocks.
   * e.g. `$E\n  content\n$E`
   * @param {*} state
   * @param {*} startLine
   * @param {*} endLine
   * @param {boolean} silent - If true, the parser will only check for a match without emitting tokens.
   * @returns {boolean} True if a block was successfully parsed.
   */
  function parseMultiLine(state, startLine, endLine, silent) {
    const pos = state.bMarks[startLine] + state.tShift[startLine]
    const max = state.eMarks[startLine]

    const rawLine = state.src.slice(pos, max)
    const trimmedLine = rawLine.trimEnd()

    let firstContent = "";

    if (trimmedLine !== marker) {
      // Extract remainder after marker (could be content or spaces)
      let after = rawLine.slice(marker.length)
      // If nothing after marker and it's not EXACT marker (case above), then it's invalid opener.
      if (!after.length) { return false }

      // Inline-first multi-line (includes short hybrid and extended)
      // Remainder becomes first line of body; we search forward for a closing marker line.
      // Accept forms with blank lines and additional content.
      // Remainder may start with spaces; normalise: remove one leading space if present.
      if (after.startsWith(' ')) {
        after = after.slice(1)
      }

      firstContent = after.trimEnd()

      // Need at least SOME non-space content to treat as inline-first
      if (!/\S/.test(firstContent)) {
        return false
      }
    }

    // Scan for closing marker line
    let nextLine = startLine + 1
    const bodyLines = []
    let foundClose = false

    for (; nextLine < endLine; nextLine++) {
      const s = state.bMarks[nextLine] + state.tShift[nextLine]
      const e = state.eMarks[nextLine]
      const lineText = state.src.slice(s, e)
      const trimmed = lineText.trim()

      if (trimmed === marker) {
        foundClose = true
        break
      }

      // allow closing marker appended to the final content line (e.g. "Some text $E")
      const inlineCloseMatch = INLINE_CLOSING_RE.exec(lineText)
      if (inlineCloseMatch) {
        bodyLines.push(inlineCloseMatch[1])
        foundClose = true
        break
      }

      bodyLines.push(lineText)
    }

    if (!foundClose) { return false }
    if (firstContent.length === 0 && bodyLines.length === 0) { return false }

    if (silent) { return true }

    const innerSrc = [firstContent, ...bodyLines].join('\n')
    emitMultiLine(state, startLine, nextLine, innerSrc)

    return true
  }

  function emitMultiLine(state, startLine, closingLineIdx, innerSrc) {
    const open = state.push(`${tokenType}_open`, 'div', 1)
    open.block = true
    open.map = [startLine, closingLineIdx + 1]
    for (const [attr, value] of Object.entries(tokenAttrs)) {
      open.attrSet(attr, value)
    }

    const innerTokens = []
    state.md.block.parse(innerSrc, state.md, state.env, innerTokens)

    for (const t of innerTokens) {
      state.tokens.push(t)
    }

    state.push(`${tokenType}_close`, 'div', -1)

    state.line = closingLineIdx + 1
  }

  function emitSingleLine(state, startLine, content) {
    const open = state.push(`${tokenType}_open`, 'div', 1)
    open.block = true
    open.content = content
    open.map = [startLine, startLine + 1]
    for (const [attr, value] of Object.entries(tokenAttrs)) {
      open.attrSet(attr, value)
    }

    state.push(`${tokenType}_close`, 'div', -1)

    state.line = startLine + 1
  }

  return {
    parseMultiLine,
    emitMultiLine,
    emitSingleLine,
    parseSingleLine
  }
}
