const assert = require('node:assert')
const { it, describe } = require('node:test')
const testGenerator = require('markdown-it-testgen')
const markdownIt = require('markdown-it')

// `testGenerator` uses Mocha internally, but we’re using node:test
global.describe = describe
global.it = it

const testMarkdown = (path, options = {}) => {
  const md = markdownIt().use(require('../index.js'), options)

  testGenerator(path, { assert }, md)
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
