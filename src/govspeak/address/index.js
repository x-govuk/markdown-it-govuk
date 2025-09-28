import { getDefaultRenderer } from '../../utils.js'
import { createGovspeakBlockParser } from '../parser.js'

/**
 * @import MarkdownIt from 'markdown-it'
 */

const marker = '$A'
const tokenType = 'govspeak_address'
const tokenAttrs = {
  'data-govspeak': 'address'
}

const { parseMultiLine, emitMultiLine, parseSingleLine } =
  createGovspeakBlockParser(marker, tokenType, tokenAttrs)

/**
 * Get address renderer
 *
 * @param {MarkdownIt} md - MarkdownIt instance
 * @param {'open'|'close'} state - Whether rendering open or close tag
 * @returns {MarkdownIt.Renderer.RenderRule} - Render rule
 */
function getAddressRenderer(md, state) {
  const defaultRenderer = getDefaultRenderer(md, `${tokenType}_${state}`)

  return (tokens, idx, options, env, self) => {
    const token = tokens[idx]

    // Temporary modification of options to enable breaks within address blocks
    if (token.type === `${tokenType}_open`) {
      env[tokenType] = { options: { breaks: options.breaks } }
      options.breaks = true
    }

    // Restore original breaks option after rendering the closing tag
    if (token.type === `${tokenType}_close`) {
      options.breaks = env[tokenType].options.breaks
    }

    return defaultRenderer(tokens, idx, options, env, self)
  }
}

/**
 * Parse a Govspeak address block
 *
 * @type {MarkdownIt.ParserBlock.RuleBlock}
 */
function parseAddress(state, startLine, endLine, silent) {
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

  // Handle single-line form ($A ... $A)
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
 * Govspeak-style address block
 *
 * Supported forms:
 *   1. Single-line:          $A address $A
 *
 *   2. Pure multi-line:      $A
 *                            body
 *                            $A
 *
 *   3. Short hybrid:         $A address
 *                            $A
 *
 *   4. Inline-first multi:   $A address
 *                            ...more lines...
 *                            $A
 *   5. Pure multi-line with inline closing on address line:
 *                            $A
 *                            Some address $A
 *      (optional blank lines before the closing address line)
 *
 * @param {MarkdownIt} md - markdown-it instance
 * @returns {void}
 */
export function govspeakAddress(md) {
  md.block.ruler.before('paragraph', tokenType, parseAddress, {
    alt: ['paragraph', 'reference', 'blockquote', 'list']
  })

  md.renderer.rules[`${tokenType}_open`] = getAddressRenderer(md, 'open')
  md.renderer.rules[`${tokenType}_close`] = getAddressRenderer(md, 'close')
}
