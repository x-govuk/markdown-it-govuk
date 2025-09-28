/**
 * @import MarkdownIt from 'markdown-it'
 */

/**
 * Add attributes to a token
 *
 * @param {MarkdownIt.Token} token - Token to modify
 * @param {Object.<string, string>} tokenAttrs - Attributes to add
 */
export function addAttributeToRule(token, tokenAttrs) {
  for (const [attr, value] of Object.entries(tokenAttrs)) {
    if (token.attrGet(attr)) {
      token.attrJoin(attr, value)
    } else {
      token.attrPush([attr, value])
    }
  }
}

/**
 * Add classes to a token’s class attribute in given MarkdownIt rule
 *
 * @param {MarkdownIt} md - MarkdownIt instance
 * @param {string} rule - Rule to modify
 * @param {string} classes - Classes to add to rule’s token
 */
export const addClassesToRule = (md, rule, classes) => {
  const defaultRenderer = getDefaultRenderer(md, rule)

  if (!classes) {
    return
  }

  md.renderer.rules[rule] = (tokens, idx, options, env, self) => {
    const token = tokens[idx]

    if (token.attrGet('class')) {
      token.attrJoin('class', classes)
    } else {
      token.attrPush(['class', classes])
    }

    return defaultRenderer(tokens, idx, options, env, self)
  }
}

/**
 * Get default renderer for given markdown-it rule
 *
 * @param {MarkdownIt} md - markdown-it instance
 * @param {string} rule - Rule to modify
 * @returns {Function} - Renderer for the given rule
 */
export const getDefaultRenderer = (md, rule) => {
  return (
    md.renderer.rules[rule] ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options)
    }
  )
}
