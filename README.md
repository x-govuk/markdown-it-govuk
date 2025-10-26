# markdown-it-govuk · [![test](https://github.com/x-govuk/markdown-it-govuk/actions/workflows/test.yml/badge.svg)](https://github.com/x-govuk/markdown-it-govuk/actions/workflows/test.yml)

Plugin for [markdown-it](https://github.com/markdown-it/markdown-it) to convert Markdown into GOV.UK Frontend-compliant HTML, inspired by the [`govuk_markdown`](https://github.com/DFE-Digital/govuk_markdown) and [govspeak](https://github.com/alphagov/govspeak) Ruby gems.

If you are using the [marked](https://marked.js.org/) parser, use [`govuk-markdown`](https://github.com/x-govuk/govuk-markdown).

## Requirements

Node.js v22 or later.

## Installation

`npm install markdown-it-govuk --save`

## Usage

```js
import markdownit from 'markdown-it'
import markdownitGovuk from 'markdown-it-govuk'

const md = markdownit.use(markdownitGovuk)
```

The generated HTML will include the classes from GOV.UK Frontend. For example:

```js
md.render('[A link](/foo)')
```

Will output:

```html
<p class="govuk-body"><a class="govuk-link" href="/foo">A link</a></p>
```

### Code highlighting

Fenced code blocks can he highlighted using the supplied `highlight` function:

```js
import markdownit from 'markdown-it'
import markdownitGovuk from 'markdown-it-govuk'
import highlight from 'markdown-it-govuk/highlight'

const md = markdownit({
  highlight
})

md.use(markdownitGovuk)
```

For example:

````js
md.render('```js\nconsole.log(\'Hello, World!\')\n```')
````

Will output:

```html
<pre class="app-code app-code--block" tabindex="0">
  <code class="app-code__language--js">
    <span class="app-code__variable">console</span>.<span class="app-code__title">log</span>(<span class="app-code__string">'Hello, World!'</span>)
  </code>
</pre>
```

To provide styling for inline and block code, add the following to your Sass file:

```scss
@import "markdown-it-govuk/highlight";
```

or using the Sass module system and `pkg:` importing:

```scss
@forward "pkg:markdown-it-govuk/highlight";
```

These styles rely on `govuk-frontend`, so make sure you have this installed as a dependency in your project.

## Options

| Name                | Type               | Description                                                                                                                                                                                                                                                                                           |
| ------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `headingsStartWith` | `string`           | Heading size to use for the top-level heading (`xl` or `l`). Default is `l`.                                                                                                                                                                                                                          |
| `brand`             | `string`           | Use either `'govuk'` or `'nhsuk'` namespaced class names. Default is `'govuk'`.                                                                                                                                                                                                                       |
| `calvert`           | `boolean \| Array` | Typographic improvements to enable (alongside those provided by markdown-it’s `typographer` option). Set this option to `true` to enable all improvements, or array containing individual improvement sets to include (choose from `fractions`, `guillemets` and `mathematical`). Default is `false`. |
| `govspeak`          | `boolean \| Array` | Enable support for Govspeak extensions. Set this option to `true` to enable all supported extensions, or provide an array containing individual extensions to include (choose from `address`, `blockquote`, `example-callout`, `information-callout` and `warning-callout`). Default is `false`.      |

### Heading sizes

Headings start with `govuk-heading-l` for an `<h1>`, `govuk-heading-m` for an `<h2>` and so on. But change it if your pages feel unbalanced – the heading class you use does not always need to correspond to the heading level.

To start pages with `govuk-heading-xl` for an `<h1>`, `govuk-heading-l` for an `<h2>`, and so on, set the `headingsStartWith` option to `xl`:

```js
import markdownit from 'markdown-it'
import markdownitGovuk from 'markdown-it-govuk'

const md = markdownit.use(markdownitGovuk, {
  headingsStartWith: 'xl'
})

md.render('# Heading\n## Heading 2')
```

Will output:

```html
<h1 class="govuk-heading-xl">Heading 1</h1>
<h2 class="govuk-heading-l">Heading 2</h2>
```

### Typographic improvements

Alongside typographic replacements provided by markdown-it’s `typographer` option, you can enable other glyphs present in Margaret Calvert’s GDS Transport font by using the `calvert` option.

For example:

```js
import markdownit from 'markdown-it'
import markdownitGovuk from 'markdown-it-govuk'

const md = markdownit.use(markdownitGovuk, {
  calvert: ['fractions', 'mathematical']
})

md.render('1/2 x 1/2 = 1/4')
```

Will output the following text, with the common fractions and correct multiplication symbol:

```html
<p class="govuk-body">½ × ½ = ¼</p>
```

### Govspeak

You can enable support for some [Govspeak](https://govspeak-preview.publishing.service.gov.uk/guide) markdown extensions by using the `govspeak` option.

This plugin supports the following extensions:

- `address`
- `blockquote`
- `example-callout`
- `information-callout`
- `warning-callout`

You can enable support for all extensions by setting the option to `true`, or you can enable support for individual extensions by providing an array containing the names of the extensions you want to use.

```js
import markdownit from 'markdown-it'
import markdownitGovuk from 'markdown-it-govuk'

const md = markdownit.use(markdownitGovuk, {
  govspeak: true
})
```

To provide styling for govspeak extensions, add the following to your Sass file:

```scss
@import "markdown-it-govuk/govspeak";
```

or using the Sass module system and `pkg:` importing:

```scss
@forward "pkg:markdown-it-govuk/govspeak";
```

These styles rely on `govuk-frontend`, so make sure you have this installed as a dependency in your project.

#### Address

For example:

```js
import markdownit from 'markdown-it'
import markdownitGovuk from 'markdown-it-govuk'

const md = markdownit.use(markdownitGovuk, {
  govspeak: ['address']
})

md.render(`$A
HM Revenue and Customs
Bradford
BD98 1YY
$A`)
```

Will output:

```html
<div data-govspeak="address">
  <p class="govuk-body">HM Revenue and Customs<br>
Bradford<br>
BD98 1YY</p>
</div>
```

#### Blockquote

For example:

```js
import markdownit from 'markdown-it'
import markdownitGovuk from 'markdown-it-govuk'

const md = markdownit.use(markdownitGovuk, {
  govspeak: ['blockquote']
})

md.render(`> Some text with a blockquote`)
```

Will output:

```html
<blockquote data-govspeak="blockquote">
  <p class="govuk-body">Some text with a blockquote</p>
</blockquote>
```

#### Example callout

```js
import markdownit from 'markdown-it'
import markdownitGovuk from 'markdown-it-govuk'

const md = markdownit.use(markdownitGovuk, {
  govspeak: ['example-callout']
})

md.render(`$E
**Example callout**
Some text with an example callout
$E`)
```

Will output:

```html
<div data-govspeak="example-callout">
  <p class="govuk-body">
    <strong>Example callout</strong>
    Some text with an example callout</p>
</div>
```

#### Information callout

For example:

```js
import markdownit from 'markdown-it'
import markdownitGovuk from 'markdown-it-govuk'

const md = markdownit.use(markdownitGovuk, {
  govspeak: ['information-callout']
})

md.render('^ Some text with an information callout ^')
```

Will output:

```html
<div data-govspeak="information-callout" role="note" aria-label="Information">
  <p class="govuk-body">Some text with an information callout</p>
</div>
```

#### Warning callout

For example:

```js
import markdownit from 'markdown-it'
import markdownitGovuk from 'markdown-it-govuk'

const md = markdownit.use(markdownitGovuk, {
  govspeak: ['warning-callout']
})

md.render('% Some text with a warning callout %')
```

Will output:

```html
<div data-govspeak="warning-callout" role="note" aria-label="Warning">
  <p class="nhsuk-body">Some text with a warning callout</p>
</div>
```

## Releasing a new version

`npm run release`

This command will ask you what version you want to use. It will then publish a new version on NPM, create and push a new git tag and then generate release notes ready for posting on GitHub.

> [!NOTE]
> Releasing a new version requires permission to publish packages to the `@x-govuk` organisation.
