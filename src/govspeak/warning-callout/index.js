import { escapeHtml } from 'markdown-it/lib/common/utils.mjs'

import { createGovspeakBlockParser } from '../parser.js'

/**
 * @import MarkdownIt from 'markdown-it'
 */

const marker = '%'
const tokenType = 'govspeak_warning_callout'
const tokenAttrs = {
  'data-govspeak': 'warning-callout',
  'aria-label': 'Warning',
  role: 'note'
}

const { emitMultiLine, parseSingleLine } = createGovspeakBlockParser(
  marker,
  tokenType,
  tokenAttrs
)

/**
 * Govspeak-style warning callout parser
 *
 * @type {MarkdownIt.ParserBlock.RuleBlock}
 */
function parseWarningCallout(state, startLine, _endLine, silent) {
  const pos = state.bMarks[startLine] + state.tShift[startLine]
  const max = state.eMarks[startLine]
  const rawLine = state.src.slice(pos, max)
  const trimmedLine = rawLine.trimEnd()

  // If indented by more than 3 spaces, should be a code block
  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false
  }

  const content = parseSingleLine(trimmedLine, false)

  if (content === null) {
    return false
  }

  if (silent) {
    return true
  }

  emitMultiLine(state, startLine, startLine, escapeHtml(content))

  return true
}

/**
 * Govspeak-style warning callout
 *
 * @param {MarkdownIt} md - MarkdownIt instance
 * @returns {void}
 */
export function govspeakWarningCallout(md) {
  md.block.ruler.before('paragraph', tokenType, parseWarningCallout, {
    alt: ['paragraph', 'reference', 'blockquote', 'list']
  })
}
