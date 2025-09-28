import { govspeakAddress } from './address/index.js'
import { govspeakBlockquote } from './blockquote/index.js'
import { govspeakExampleCallout } from './example-callout/index.js'
import { govspeakInformationCallout } from './information-callout/index.js'
import { govspeakWarningCallout } from './warning-callout/index.js'

/**
 * @import MarkdownIt from 'markdown-it'
 */

/**
 * @typedef {'address' | 'blockquote' | 'example-callout' | 'information-callout' | 'warning-callout'} GovspeakOption
 */

/**
 * @type {GovspeakOption[]}
 */
const availableGovspeakOptions = [
  'address',
  'blockquote',
  'example-callout',
  'information-callout',
  'warning-callout'
]

/**
 * Map of available Govspeak extensions to their implementation functions
 *
 * @type {Map<GovspeakOption, function(MarkdownIt):void>}
 */
export const availableGovspeakExtensions = new Map([
  ['address', govspeakAddress],
  ['blockquote', govspeakBlockquote],
  ['example-callout', govspeakExampleCallout],
  ['information-callout', govspeakInformationCallout],
  ['warning-callout', govspeakWarningCallout]
])

/**
 * Get available Govspeak options
 *
 * @param {boolean|GovspeakOption[]|null} govspeakOptions
 * @returns {GovspeakOption[]} - Array of available Govspeak options
 */
export function getGovspeakOptions(govspeakOptions) {
  if (govspeakOptions === true) {
    return availableGovspeakOptions
  }

  if (Array.isArray(govspeakOptions)) {
    return govspeakOptions
  }

  return []
}

/**
 * Configure Govspeak extensions for the given MarkdownIt instance
 *
 * @param {MarkdownIt} md - MarkdownIt instance
 * @param {GovspeakOption[]} govspeakOptions - Govspeak options to enable
 * @param {object} brand - Brand configuration
 */
export function configureGovspeak(md, govspeakOptions, brand) {
  for (const key of govspeakOptions) {
    if (availableGovspeakExtensions.has(key)) {
      const implementation = availableGovspeakExtensions.get(key)
      implementation(md)
    }

    // Remove default blockquote CSS rules when blockquote enabled
    if (key === 'blockquote') {
      delete brand.rules.blockquote_open
    }
  }
}
