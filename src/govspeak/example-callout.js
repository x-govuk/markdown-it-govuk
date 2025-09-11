import { createGovspeakBlockParser } from './govspeak-utils.js'

const marker = '$E'
const tokenType = 'govspeak_example_callout'
const options = {
  marker,
  tokenType,
  tokenAttrs: { class: 'govuk-inset-text' }
}

const { parseMultiLine, emitMultiLine, parseSingleLine }
  = createGovspeakBlockParser(options)

function renderExampleCalloutOpen(tokens, idx, options, env, self) {
  return `<div${self.renderAttrs(tokens[idx])}>\n  `
}

function parseExampleCallout(state, startLine, endLine, silent) {
  const pos = state.bMarks[startLine] + state.tShift[startLine]
  const max = state.eMarks[startLine]

  // if it's indented more than 3 spaces, it should be a code block
  if (state.sCount[startLine] - state.blkIndent >= 4) { return false }

  const rawLine = state.src.slice(pos, max)
  const trimmedLine = rawLine.trimEnd()

  if (!trimmedLine.startsWith(marker)) { return false }

  // Handle single-line form ($E ... $E)
  const singleLineContent = parseSingleLine(trimmedLine, true)
  if (singleLineContent !== null) {
    if (silent) { return true }
    emitMultiLine(state, startLine, startLine, singleLineContent)
    return true
  }

  return parseMultiLine(state, startLine, endLine, silent)
}

/**
 * Govspeak-style example callout.
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
 */
export function govspeakExampleCallout(md) {
  md.block.ruler.before(
    'paragraph',
    tokenType,
    parseExampleCallout,
    { alt: ['paragraph', 'reference', 'blockquote', 'list'] }
  );

  md.renderer.rules[tokenType + '_open'] = renderExampleCalloutOpen
}
