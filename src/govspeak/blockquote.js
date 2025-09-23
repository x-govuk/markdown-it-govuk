import { addAttributeToRule } from './govspeak-utils.js'
import { getDefaultRenderer } from '../utils.js'

/**
 * @import MarkdownIt from "markdown-it"
 */

const tokenType = 'blockquote'
const tokenAttrs = {
  'data-govspeak': 'blockquote'
}

/**
 * Get block quote renderer
 *
 * @param {MarkdownIt} md - markdown-it instance
 * @returns {MarkdownIt.Renderer.RenderRule} - render rule
 */
function getBlockQuoteOpenRenderer(md) {
  const defaultRenderer = getDefaultRenderer(md, `${tokenType}_open`)

  return (tokens, idx, options, env, self) => {
    const token = tokens[idx]

    addAttributeToRule(token, tokenAttrs)

    return self.renderToken(tokens, idx, options)
  }
}

/**
 * Govspeak-style blockquote.
 *
 * @param {MarkdownIt} md - markdown-it instance
 * @returns {void}
 */
export function govspeakBlockquote(md) {
  const blockQuoteOpenRenderer = getBlockQuoteOpenRenderer(md)

  md.renderer.rules[tokenType + '_open'] = blockQuoteOpenRenderer
}