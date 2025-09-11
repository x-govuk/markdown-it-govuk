import { createGovspeakBlockParser } from './govspeak-utils.js'

const tokenType = 'govspeak_info_callout'

const options = {
  marker: '^',
  tokenType,
  tokenAttrs: {
    class: 'govuk-inset-text',
    'aria-label': 'Information',
    role: 'note'
  }
}

const {
  emitMultiLine,
  parseSingleLine
} = createGovspeakBlockParser(options)

function renderInformationCalloutOpen(tokens, idx, options, env, self) {
  return `<div${self.renderAttrs(tokens[idx])}>\n  `
}

/**
 * Govspeak-style information callout.
 */
function parseInformationCallout(state, startLine, endLine, silent) {
  const pos = state.bMarks[startLine] + state.tShift[startLine]
  const max = state.eMarks[startLine]
  const rawLine = state.src.slice(pos, max)
  const trimmedLine = rawLine.trimEnd()

  // if it's indented more than 3 spaces, it should be a code block
  if (state.sCount[startLine] - state.blkIndent >= 4) { return false }

  const content = parseSingleLine(trimmedLine, false)

  if (content === null) { return false }

  if (silent) { return true }

  emitMultiLine(state, startLine, startLine, content)
  return true
}

/**
 * Govspeak-style information callout.
 */
export function govspeakInformationCallout(md) {
  md.block.ruler.before(
    'paragraph',
    tokenType,
    parseInformationCallout,
    { alt: ['paragraph', 'reference', 'blockquote', 'list'] }
  )

  md.renderer.rules[tokenType + '_open'] = renderInformationCalloutOpen
}
