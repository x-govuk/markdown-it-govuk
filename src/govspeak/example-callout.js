const marker = '$E';

// Regex to detect an inline closing marker at end of a content line when using a multi-line form.
// Captures the content before the trailing marker (requires at least one non-space char before it).
const INLINE_CLOSING_RE = new RegExp(`^(.*\\S)\\s+\\$E\\s*$`);

function parsePureMultiLine(state, startLine, endLine, silent) {
  let nextLine = startLine + 1;
  const bodyLines = [];
  let foundClose = false;

  for (; nextLine < endLine; nextLine++) {
    const s = state.bMarks[nextLine] + state.tShift[nextLine];
    const e = state.eMarks[nextLine];
    const lineText = state.src.slice(s, e);
    const trimmed = lineText.trim();

    if (trimmed === marker) {
      foundClose = true;
      break;
    }

    // allow closing marker appended to the final content line (e.g. "Some text $E")
    const inlineCloseMatch = INLINE_CLOSING_RE.exec(trimmed);
    if (inlineCloseMatch) {
      bodyLines.push(inlineCloseMatch[1]);
      foundClose = true;
      break;
    }

    bodyLines.push(lineText);
  }

  if (!foundClose) { return false }
  if (bodyLines.length === 0) { return false }

  if (silent) { return true }

  const innerSrc = bodyLines.join('\n');
  emitMultiParsed(state, startLine, nextLine, innerSrc);
  state.line = nextLine + 1;
  return true;
}

function emitMultiParsed(state, startLine, closingLineIdx, innerSrc) {
  const open = state.push('govspeak_example_callout_open', 'div', 1);
  open.block = true;
  open.map = [startLine, closingLineIdx + 1];
  open.attrSet('class', 'govuk-inset-text');

  const innerTokens = [];
  state.md.block.parse(innerSrc, state.md, state.env, innerTokens);

  for (const t of innerTokens) {
    state.tokens.push(t);
  }

  state.push('govspeak_example_callout_close', 'div', -1);
}

function emitSingleLine(state, startLine, content) {
  const open = state.push('govspeak_example_callout_open', 'div', 1);
  open.block = true;
  open.map = [startLine, startLine + 1];
  open.attrSet('class', 'govuk-inset-text');

  const pOpen = state.push('paragraph_open', 'p', 1);
  pOpen.block = true;
  pOpen.map = [startLine, startLine + 1];

  const inline = state.push('inline', '', 0);
  inline.content = content;
  inline.map = [startLine, startLine + 1];
  inline.children = [];

  state.push('paragraph_close', 'p', -1);
  state.push('govspeak_example_callout_close', 'div', -1);

  state.line = startLine + 1;
}

function exampleCallout(state, startLine, endLine, silent) {
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let max = state.eMarks[startLine];

  // if it's indented more than 3 spaces, it should be a code block
  if (state.sCount[startLine] - state.blkIndent >= 4) { return false }

  let rawLine = state.src.slice(pos, max);
  const trimmedLine = rawLine.trimEnd();

  if (!trimmedLine.startsWith(marker)) { return false }

  // Handle multi-line
  if (trimmedLine === marker) {
    return parsePureMultiLine(state, startLine, endLine, silent);
  }

  // Extract remainder after marker (could be content or spaces)
  let after = rawLine.slice(marker.length);
  // If nothing after marker and it's not EXACT marker (case above), then it's invalid opener.
  if (!after.length) { return false }

  // Try single-line (marker ... marker) on same line
  const escMarker = marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const singleLineRe = new RegExp(`^${escMarker}\\s+([\\s\\S]*?)\\s+${escMarker}$`);
  const matched = trimmedLine.match(singleLineRe);
  
  if (matched) {
    if (silent) { return true }
    let content = matched[1];
    content = content.trim();
    emitSingleLine(state, startLine, content);
    return true;
  }

  // Inline-first multi-line (includes short hybrid and extended)
  // Remainder becomes first line of body; we search forward for a closing marker line.
  // Accept forms with blank lines and additional content.
  // Remainder may start with spaces; normalise: remove one leading space if present.
  if (after.startsWith(' ')) {
    after = after.slice(1);
  }
  const firstContent = after.trimEnd();

  // Need at least SOME non-space content to treat as inline-first
  if (!/\S/.test(firstContent)) {
    return false;
  }

  // Scan for closing marker line
  let nextLine = startLine + 1;
  const bodyTailLines = [];
  let foundClose = false;

  for (; nextLine < endLine; nextLine++) {
    pos = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];

    const lineText = state.src.slice(pos, max);
    const trimmedLineText = lineText.trim();

    if (trimmedLineText === marker) {
      foundClose = true;
      break;
    }

    // Allow inline closing marker on the last content line for inline-first form too
    const inlineCloseMatch = INLINE_CLOSING_RE.exec(trimmedLineText);
    if (inlineCloseMatch) {
      bodyTailLines.push(inlineCloseMatch[1]);
      foundClose = true;
      break;
    }

    bodyTailLines.push(lineText);
  }

  if (!foundClose) {
    return false; // no closing marker
  }

  if (firstContent.length === 0 && bodyTailLines.length === 0) {
    return false;
  }

  if (silent) { return true }

  // Build inner source: firstContent as a line, then rest (if any)
  let innerSrc = firstContent;
  if (bodyTailLines.length > 0) {
    innerSrc += `\n${bodyTailLines.join('\n')}`;
  }

  emitMultiParsed(state, startLine, nextLine, innerSrc);
  state.line = nextLine + 1;
  return true;
}

/**
 * Govspeak-style example callout.
 *
 * Supported forms:
 *   1. Single-line:          $E content $E
 * 
 *   2. Pure multi-line:      $E
 *                            body
 *                            $E
 * 
 *   3. Short hybrid:         $E content
 *                            $E
 * 
 *   4. Inline-first multi:   $E content
 *                            ...more lines...
 *                            $E
 *   5. Pure multi-line with inline closing on content line:
 *                            $E
 *                            Some content $E
 *      (optional blank lines before the closing content line)
 */
export function govspeakExampleCallout(md) {
  md.block.ruler.before(
    'paragraph',
    'govspeak_example_callout',
    exampleCallout,
    { alt: ['paragraph', 'reference', 'blockquote', 'list'] }
  );
}
