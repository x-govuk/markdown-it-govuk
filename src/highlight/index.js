import highlightJs from 'highlight.js'

highlightJs.configure({ classPrefix: 'app-code__' })

export default function (string, language) {
  if (language) {
    // Code language has been set, or can be determined
    let code
    if (highlightJs.getLanguage(language)) {
      code = highlightJs.highlight(string, { language }).value
    } else {
      code = highlightJs.highlightAuto(string).value
    }
    return `<pre class="app-code app-code--block app-code__language--${language}" tabindex="0"><code>${code}</code></pre>\n`
  }

  // No language found, so render as plain text
  return `<pre class="app-code app-code--block" tabindex="0">${string}</pre>\n`
}
