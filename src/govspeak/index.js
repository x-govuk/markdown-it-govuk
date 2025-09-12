import { govspeakExampleCallout } from './example-callout.js'
import { govspeakInformationCallout } from './information-callout.js'
import { govspeakWarningCallout } from './warning-callout.js'

const availableGovspeakOptions = ['blockquote', 'example-callout', 'information-callout', 'warning-callout']

/**
 * Map of available Govspeak extensions to their implementation functions
 */
export const availableGovspeakExtensions = new Map([
  ['example-callout', govspeakExampleCallout],
  ['information-callout', govspeakInformationCallout],
  ['warning-callout', govspeakWarningCallout]
]);

export function getGovspeakOptions(govspeak) {
  if (govspeak === true) {
    return availableGovspeakOptions;
  }

  if (Array.isArray(govspeak)) {
    return govspeak;
  }

  return [];
}