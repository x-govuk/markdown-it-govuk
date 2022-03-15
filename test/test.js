const { describe } = require('mocha')
const testGenerator = require('markdown-it-testgen')

describe('Converts Markdown into GOV.UK Frontend-compliant HTML', () => {
  const md = require('markdown-it')().use(require('../index.js'))

  testGenerator('./test/fixtures/govuk.txt', md)
})

describe('Starts headings with xl size', () => {
  const md = require('markdown-it')().use(require('../index.js'), {
    headingsStartWith: 'xl'
  })

  testGenerator('./test/fixtures/option-heading-starts-with.txt', md)
})

describe('Improves all typography', () => {
  const md = require('markdown-it')().use(require('../index.js'), {
    calvert: true
  })

  testGenerator('./test/fixtures/option-calvert.txt', md)
})

describe('Improves typography (fractions only)', () => {
  const md = require('markdown-it')().use(require('../index.js'), {
    calvert: ['fractions']
  })

  testGenerator('./test/fixtures/option-calvert-fractions.txt', md)
})

describe('Improves typography (guillemets only)', () => {
  const md = require('markdown-it')().use(require('../index.js'), {
    calvert: ['guillemets']
  })

  testGenerator('./test/fixtures/option-calvert-guillemets.txt', md)
})

describe('Improves typography (mathematical symbols only)', () => {
  const md = require('markdown-it')().use(require('../index.js'), {
    calvert: ['mathematical']
  })

  testGenerator('./test/fixtures/option-calvert-mathematical.txt', md)
})
