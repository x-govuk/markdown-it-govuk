/**
 * Get the content of an inset-text block
 * @param {*} line 
 * @returns {object} content and whether there was a closing caret
 */
function getContent(line) {
  let content = line.slice(1); // drop first caret
  if (content.startsWith(' ')) content = content.slice(1); // optional leading space

  // Detect optional trailing closing caret:
  // We consider it a closing caret if:
  //  - After trimming end spaces, last char is '^'
  //  - That caret is NOT escaped with a backslash immediately before
  // Otherwise no closing delimiter; keep as-is.
  let trailingSpacesMatch = content.match(/(\s*)$/);
  const trailingSpaces = trailingSpacesMatch ? trailingSpacesMatch[0] : '';
  const nonSpacePortion = content.slice(0, content.length - trailingSpaces.length);

  let hasClosing = false;
  if (nonSpacePortion.endsWith('^')) {
    const beforeCaret = nonSpacePortion.slice(0, -1);
    if (beforeCaret.endsWith('\\')) {
      // Turn the final "\^" into "^"
      content = beforeCaret.slice(0, -1) + '^' + trailingSpaces;
      // No closing delimiter in this case
    } else {
      // Real closing delimiter
      hasClosing = true;
      content = beforeCaret + trailingSpaces; // drop the final caret
    }
  }

  return { content: content.trim(), hasClosing };
}


function informationCallout(state, startLine, endLine, silent) {
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let max = state.eMarks[startLine];
  let rawLine = state.src.slice(pos, max);
  const trimmedLine = rawLine.trimEnd();

  const hat = 0x5E; // '^'

  // if it's indented more than 3 spaces, it should be a code block
  if (state.sCount[startLine] - state.blkIndent >= 4) { return false }

  // check the block quote marker
  if (state.src.charCodeAt(pos) !== hat) { return false }

  const { content, hasClosing } = getContent(trimmedLine);

  // we know that it's going to be a valid inset-text,
  // so no point trying to find the end of it in silent mode
  if (silent) { return true }


  const open = state.push('govspeak_info_callout_open', 'div', 1);
  open.block = true;
  open.map = [startLine, startLine + 1];
  open.attrSet('class', 'govuk-inset-text');
  open.attrSet('aria-label', 'Information');
  open.attrSet('role', 'note');
  open.meta = { hasClosing };

  // Emit paragraph open
  const pOpen = state.push('paragraph_open', 'p', 1);
  pOpen.block = true;
  pOpen.map = [startLine, startLine + 1];

  const inlineToken = state.push('inline', '', 0);
  inlineToken.content = content;
  inlineToken.map = [startLine, startLine + 1];
  inlineToken.children = [];

  // Paragraph close
  state.push('paragraph_close', 'p', -1);

  const close = state.push('govspeak_info_callout_close', 'div', -1);
  close.block = true;

  state.line = startLine + 1;
  return true;
}

/**
 * Govspeak-style information callout.
 */
export function govspeakInformationCallout(md) {
  md.block.ruler.before(
    'paragraph',
    'govspeak_info_callout',
    informationCallout,
    { alt: ['paragraph', 'reference', 'blockquote', 'list'] }
  );
};
