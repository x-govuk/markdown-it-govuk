import test from 'node:test'

import markdownit from 'markdown-it'
import testGenerator from 'markdown-it-testgen'

import markdownitGovuk from '../index.js'

// markdown-it-testgen expects Mocha to have set the following globals
globalThis.describe = test.describe
globalThis.it = test.it

const testMarkdown = (path, options = {}) => {
  const md = markdownit()
  md.use(markdownitGovuk, options)

  testGenerator(path, md)
}

testMarkdown('./test/fixtures/brand-govuk.txt')

testMarkdown('./test/fixtures/brand-nhsuk.txt', {
  brand: 'nhsuk'
})

testMarkdown('./test/fixtures/option-heading-starts-with.txt', {
  headingsStartWith: 'xl'
})

testMarkdown('./test/fixtures/option-calvert.txt', {
  calvert: true
})

testMarkdown('./test/fixtures/option-calvert-fractions.txt', {
  calvert: ['fractions']
})

testMarkdown('./test/fixtures/option-calvert-guillemets.txt', {
  calvert: ['guillemets']
})

testMarkdown('./test/fixtures/option-calvert-mathematical.txt', {
  calvert: ['mathematical']
})

testMarkdown('./test/fixtures/option-govspeak-false-govuk.txt', {
  govspeak: false
})

testMarkdown('./test/fixtures/option-govspeak-true-govuk.txt', {
  govspeak: true
})

testMarkdown('./test/fixtures/option-govspeak-false-nhsuk.txt', {
  brand: 'nhsuk',
  govspeak: false
})

testMarkdown('./test/fixtures/option-govspeak-true-nhsuk.txt', {
  brand: 'nhsuk',
  govspeak: true
})

testMarkdown('./test/fixtures/option-govspeak-info-callout.txt', {
  govspeak: ['information-callout']
})

testMarkdown('./test/fixtures/option-govspeak-example-callout.txt', {
  govspeak: ['example-callout', 'information-callout', 'warning-callout']
})

testMarkdown('./test/fixtures/option-govspeak-warning-callout.txt', {
  govspeak: ['warning-callout', 'information-callout']
})

testMarkdown('./test/fixtures/option-govspeak-blockquote-govuk.txt', {
  govspeak: ['blockquote']
})

testMarkdown('./test/fixtures/option-govspeak-blockquote-nhsuk.txt', {
  brand: 'nhsuk',
  govspeak: ['blockquote']
})

testMarkdown('./test/fixtures/option-govspeak-address-govuk.txt', {
  govspeak: ['address']
})

testMarkdown('./test/fixtures/option-govspeak-address-nhsuk.txt', {
  brand: 'nhsuk',
  govspeak: ['address']
})
