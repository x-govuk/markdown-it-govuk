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

testMarkdown('./test/fixtures/govuk.txt')

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
