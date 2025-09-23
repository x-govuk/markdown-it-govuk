import { govspeakAddress } from './address.js'
import { govspeakBlockquote } from './blockquote.js'
import { govspeakExampleCallout } from './example-callout.js'
import { govspeakInformationCallout } from './information-callout.js'
import { govspeakWarningCallout } from './warning-callout.js'

/**
 * @import MarkdownIt from "markdown-it"
 */

/**
 * @typedef {'address' | 'blockquote' | 'example-callout' | 'information-callout' | 'warning-callout'} GovspeakOption
 */

/**
 * @type {GovspeakOption[]}
 */
const availableGovspeakOptions = ['address', 'blockquote', 'example-callout', 'information-callout', 'warning-callout']

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
 * Get the available Govspeak options.
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
 * Configures Govspeak extensions for the given MarkdownIt instance.
 *
 * @param {MarkdownIt} md - The MarkdownIt instance.
 * @param {GovspeakOption[]} govspeakOptions - The array of Govspeak options to enable.
 * @param {object} brand - The brand configuration object.
 */
export function configureGovspeak(md, govspeakOptions, brand) {
  for (const key of govspeakOptions) {
    if (availableGovspeakExtensions.has(key)) {
      const implementation = availableGovspeakExtensions.get(key)
      implementation(md)
    }

    // remove default blockquote css rules when blockquote is enabled
    if (key === 'blockquote') {
      delete brand.rules.blockquote_open
    }
  }
}
