import { createGovspeakBlockParser } from '../parser.js'

/**
 * @import MarkdownIt from 'markdown-it'
 */

const marker = '^'
const tokenType = 'govspeak_information_callout'
const tokenAttrs = {
  'data-govspeak': 'information-callout',
  'aria-label': 'Information',
  role: 'note'
}

const { emitMultiLine, parseSingleLine } = createGovspeakBlockParser(
  marker,
  tokenType,
  tokenAttrs
)

/**
 * Govspeak-style information callout parser
 *
 * @type {MarkdownIt.ParserBlock.RuleBlock}
 */
function parseInformationCallout(state, startLine, _endLine, silent) {
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

  emitMultiLine(state, startLine, startLine, content)
  return true
}

/**
 * Govspeak-style information callout
 *
 * @param {MarkdownIt} md - MarkdownIt instance
 * @returns {void}
 */
export function govspeakInformationCallout(md) {
  md.block.ruler.before('paragraph', tokenType, parseInformationCallout, {
    alt: ['paragraph', 'reference', 'blockquote', 'list']
  })
}
