import { addAttributeToRule } from '../../utils.js'

/**
 * @import MarkdownIt from 'markdown-it'
 */

const tokenType = 'blockquote'
const tokenAttrs = {
  'data-govspeak': 'blockquote'
}

/**
 * Get blockquote renderer
 *
 * @returns {MarkdownIt.Renderer.RenderRule} - Render rule
 */
function getBlockQuoteOpenRenderer() {
  return (tokens, idx, options, env, self) => {
    const token = tokens[idx]

    addAttributeToRule(token, tokenAttrs)

    return self.renderToken(tokens, idx, options)
  }
}

/**
 * Govspeak-style blockquote
 *
 * @param {MarkdownIt} md - MarkdownIt instance
 * @returns {void}
 */
export function govspeakBlockquote(md) {
  const blockQuoteOpenRenderer = getBlockQuoteOpenRenderer()

  md.renderer.rules[`${tokenType}_open`] = blockQuoteOpenRenderer
}
