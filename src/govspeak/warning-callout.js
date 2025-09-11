import { createGovspeakBlockParser } from './govspeak-utils.js'
import { escapeHtml } from 'markdown-it/lib/common/utils.mjs'

const tokenType = 'govspeak_warning_callout'

const options = {
  marker: '%',
  tokenType,
  tokenAttrs: {
    class: 'govuk-warning-text',
    'aria-label': 'Warning',
    role: 'note'
  }
}

const {
  emitSingleLine,
  parseSingleLine
} = createGovspeakBlockParser(options)

function renderWarningCalloutOpen(tokens, idx, options, env, self) {
  const { content } = tokens[idx];

  return `<div${self.renderAttrs(tokens[idx])}>
  <span class="govuk-warning-text__icon" aria-hidden="true">!</span>
  <strong class="govuk-warning-text__text">
    <span class="govuk-visually-hidden">Warning</span>
    ${escapeHtml(content)}
  </strong>\n`
}

function parseWarningCallout(state, startLine, endLine, silent) {
  const pos = state.bMarks[startLine] + state.tShift[startLine]
  const max = state.eMarks[startLine]
  const rawLine = state.src.slice(pos, max)
  const trimmedLine = rawLine.trimEnd()

  // if it's indented more than 3 spaces, it should be a code block
  if (state.sCount[startLine] - state.blkIndent >= 4) { return false }

  const content = parseSingleLine(trimmedLine, false)

  if (content === null) { return false }

  if (silent) { return true }

  emitSingleLine(state, startLine, content)
  return true
}

/**
 * Govspeak-style warning callout.
 */
export function govspeakWarningCallout(md) {
  md.block.ruler.before(
    'paragraph',
    tokenType,
    parseWarningCallout,
    { alt: ['paragraph', 'reference', 'blockquote', 'list'] }
  );

  md.renderer.rules[tokenType + '_open'] = renderWarningCalloutOpen
};
