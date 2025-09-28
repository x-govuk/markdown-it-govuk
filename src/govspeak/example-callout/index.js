import { createGovspeakBlockParser } from '../parser.js'

/**
 * @import MarkdownIt from 'markdown-it'
 */

const marker = '$E'
const tokenType = 'govspeak_example_callout'
const tokenAttrs = {
  'data-govspeak': 'example-callout'
}

const { parseMultiLine, emitMultiLine, parseSingleLine } =
  createGovspeakBlockParser(marker, tokenType, tokenAttrs)

/**
 * Parses a Govspeak example callout block
 *
 * @type {MarkdownIt.ParserBlock.RuleBlock}
 */
function parseExampleCallout(state, startLine, endLine, silent) {
  const pos = state.bMarks[startLine] + state.tShift[startLine]
  const max = state.eMarks[startLine]

  // If indented by more than 3 spaces, should be a code block
  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false
  }

  const rawLine = state.src.slice(pos, max)
  const trimmedLine = rawLine.trimEnd()

  if (!trimmedLine.startsWith(marker)) {
    return false
  }

  // Handle single-line form ($E ... $E)
  const singleLineContent = parseSingleLine(trimmedLine, true)
  if (singleLineContent !== null) {
    if (silent) {
      return true
    }

    emitMultiLine(state, startLine, startLine, singleLineContent)

    return true
  }

  return parseMultiLine(state, startLine, endLine, silent)
}

/**
 * Govspeak-style example callout
 *
 * Supported forms:
 *   1. Single-line:          $E content $E
 *
 *   2. Pure multi-line:      $E
 *                            body
 *                            $E
 *
 *   3. Short hybrid:         $E content
 *                            $E
 *
 *   4. Inline-first multi:   $E content
 *                            ...more lines...
 *                            $E
 *   5. Pure multi-line with inline closing on content line:
 *                            $E
 *                            Some content $E
 *      (optional blank lines before the closing content line)
 *
 * @param {MarkdownIt} md - markdown-it instance
 * @returns {void}
 */
export function govspeakExampleCallout(md) {
  md.block.ruler.before('paragraph', tokenType, parseExampleCallout, {
    alt: ['paragraph', 'reference', 'blockquote', 'list']
  })
}
