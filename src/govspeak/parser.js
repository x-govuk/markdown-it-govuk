import { addAttributeToRule } from '../utils.js'

/**
 * @import MarkdownIt from 'markdown-it'
 */

/**
 * Create set of parser utility functions for a given Govspeak block extension.
 *
 * This factory uses a closure to hold the configuration, making the returned
 * functions more efficient and easier to use.
 *
 * @param {string} marker - Character(s) that define the block boundaries
 * @param {string} tokenType - Base name for the generated tokens
 * @param {Object.<string, string>} [tokenAttrs={}] - HTML attributes to add to the block’s container
 * @returns {UtilFunctions} Object containing the specialised parser functions
 */
export function createGovspeakBlockParser(marker, tokenType, tokenAttrs = {}) {
  const escMarker = marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const INLINE_CLOSING_RE = new RegExp(`^(.*\\S)\\s+${escMarker}\\s*$`)

  /**
   * @typedef {Object} UtilFunctions - Utility functions returned by createGovspeakBlockParser
   * @property {typeof parseMultiLine} parseMultiLine - Parser for multi-line blocks
   * @property {typeof emitMultiLine} emitMultiLine - Function to emit tokens for multi-line blocks
   * @property {typeof emitSingleLine} emitSingleLine - Function to emit tokens for single-line blocks
   * @property {typeof parseSingleLine} parseSingleLine - Parser for single-line blocks
   */

  /**
   * Reusable parser for single-line Govspeak blocks.
   * e.g. `^ content ^` or `$E content $E`
   *
   * @param {string} trimmedLine - The line content to parse
   * @param {boolean} requireClosingMarker - Whether the closing marker is mandatory
   * @returns {string|null} The extracted content, or null if it doesn’t match
   */
  function parseSingleLine(trimmedLine, requireClosingMarker = true) {
    const closing = requireClosingMarker
      ? `\\s+${escMarker}`
      : `(?:\\s*${escMarker})?`
    const singleLineRe = new RegExp(`^${escMarker}\\s*([\\s\\S]*?)${closing}$`)
    const match = trimmedLine.match(singleLineRe)
    return match ? match[1].trim() : null
  }

  /**
   * A reusable parser for multi-line Govspeak blocks
   * e.g. `$E\n  content\n$E`
   *
   * @type {MarkdownIt.ParserBlock.RuleBlock}
   */
  function parseMultiLine(state, startLine, endLine, silent) {
    const pos = state.bMarks[startLine] + state.tShift[startLine]
    const max = state.eMarks[startLine]

    const rawLine = state.src.slice(pos, max)
    const trimmedLine = rawLine.trimEnd()

    let firstContent = ''

    if (trimmedLine !== marker) {
      // Extract remainder after marker (could be content or spaces)
      let after = rawLine.slice(marker.length)
      // If nothing after marker and it’s not EXACT marker (case above), then it’s invalid opener
      if (!after.length) {
        return false
      }

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

      // Allow closing marker appended to the final content line (e.g. "Some text $E")
      const inlineCloseMatch = INLINE_CLOSING_RE.exec(lineText)
      if (inlineCloseMatch) {
        bodyLines.push(inlineCloseMatch[1])
        foundClose = true
        break
      }

      bodyLines.push(lineText)
    }

    if (!foundClose) {
      return false
    }

    if (firstContent.length === 0 && bodyLines.length === 0) {
      return false
    }

    if (silent) {
      return true
    }

    const innerSrc = [firstContent, ...bodyLines].join('\n')

    emitMultiLine(state, startLine, nextLine, innerSrc)

    return true
  }

  /**
   * Emit tokens for a multi-line Govspeak block
   *
   * @param {MarkdownIt.StateBlock} state
   * @param {number} startLine - Line where the block starts
   * @param {number} closingLineIdx - Line where the block ends (inclusive)
   * @param {string} innerSrc - Inner content of the block
   * @returns {void}
   */
  function emitMultiLine(state, startLine, closingLineIdx, innerSrc) {
    const open = state.push(`${tokenType}_open`, 'div', 1)
    open.block = true
    open.map = [startLine, closingLineIdx + 1]

    addAttributeToRule(open, tokenAttrs)

    const innerTokens = []
    state.md.block.parse(innerSrc, state.md, state.env, innerTokens)

    for (const t of innerTokens) {
      state.tokens.push(t)
    }

    state.push(`${tokenType}_close`, 'div', -1)

    state.line = closingLineIdx + 1
  }

  /**
   * Emit tokens for a single-line Govspeak block
   *
   * @param {MarkdownIt.StateBlock} state
   * @param {number} startLine - Line where the block starts
   * @param {string} content - Content of the block
   * @returns {void}
   */
  function emitSingleLine(state, startLine, content) {
    const open = state.push(`${tokenType}_open`, 'div', 1)
    open.block = true
    open.content = content
    open.map = [startLine, startLine + 1]

    addAttributeToRule(open, tokenAttrs)

    state.push(`${tokenType}_close`, 'div', -1)

    state.line = startLine + 1
  }

  return {
    emitMultiLine,
    emitSingleLine,
    parseMultiLine,
    parseSingleLine
  }
}
