import { brands } from './src/brands.js'
import { getGovspeakOptions, configureGovspeak } from './src/govspeak/index.js'
import { getDefaultRenderer, addClassesToRule } from './src/utils.js'

const defaultOptions = {
  brand: 'govuk',
  headingsStartWith: 'l',
  calvert: false,
  govspeak: false
}

/**
 * Add GOV.UK typography classes to blockquotes, headings, paragraphs, links,
 * lists, section breaks and tables and updates references to local files in
 * links and images to friendly URLs
 *
 * @param {import('markdown-it')} md - markdown-it instance
 * @param {object} pluginOptions - Plugin options
 */
export default function (md, pluginOptions = {}) {
  // Merge options
  pluginOptions = { ...defaultOptions, ...pluginOptions }

  pluginOptions.govspeak = getGovspeakOptions(pluginOptions.govspeak)

  const { govspeak } = pluginOptions

  // Get brand config (clone to avoid mutating original)
  const brand = structuredClone(brands[pluginOptions.brand])

  configureGovspeak(md, govspeak, brand)

  // Headings
  const headingRenderer = getDefaultRenderer(md, 'heading_open')
  md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
    const { headingsStartWith } = pluginOptions
    let { headingModifiers, headingPrefix } = brand

    // Start headings with configured starting modifier
    const startModifierIndex = brand.headingModifiers.indexOf(headingsStartWith)
    if (startModifierIndex !== -1) {
      headingModifiers = brand.headingModifiers.slice(startModifierIndex)
    }

    // Get heading level
    const level = tokens[idx].tag.replace(/^h(:?\d{1}?)/, '$1')
    const headingLevel = Number(level)

    // Apply heading class with size modifier
    const modifier =
      headingModifiers[headingLevel - 1] || headingModifiers.at(-1)

    tokens[idx].attrPush(['class', `${headingPrefix}${modifier}`])
    return headingRenderer(tokens, idx, options, env, self)
  }

  // Add classes to rules
  for (const [key, value] of Object.entries(brand.rules)) {
    addClassesToRule(md, key, value)
  }

  // Text replacements
  const defaultTextRenderer = getDefaultRenderer(md, 'text')
  md.renderer.rules.text = (tokens, idx, options, env, self) => {
    const { calvert } = pluginOptions

    const improveAll = !Array.isArray(calvert) && calvert === true
    const improveFractions =
      Array.isArray(calvert) && calvert.includes('fractions')
    const improveGuillemets =
      Array.isArray(calvert) && calvert.includes('guillemets')
    const improveMathematical =
      Array.isArray(calvert) && calvert.includes('mathematical')

    // Improve fractions
    if (improveAll || improveFractions) {
      tokens[idx].content = tokens[idx].content
        .replace(/(?<!\d)1\/2(?!\d)/g, '½')
        .replace(/(?<!\d)1\/3(?!\d)/g, '⅓')
        .replace(/(?<!\d)2\/3(?!\d)/g, '⅔')
        .replace(/(?<!\d)1\/4(?!\d)/g, '¼')
        .replace(/(?<!\d)3\/4(?!\d)/g, '¾')
    }

    // Improve guillemets
    if (improveAll || improveGuillemets) {
      tokens[idx].content = tokens[idx].content
        .replace(/<</g, '«')
        .replace(/>>/g, '»')
    }

    // Improve mathematical symbols
    if (improveAll || improveMathematical) {
      tokens[idx].content = tokens[idx].content
        .replace(/\+-/g, '±')
        .replace(/(?<= )x(?= )/g, '×')
        .replace(/(?<= )<=(?= )/g, '≤')
        .replace(/(?<= )=>(?= )/g, '≥')
    }

    return defaultTextRenderer(tokens, idx, options, env, self)
  }
}
