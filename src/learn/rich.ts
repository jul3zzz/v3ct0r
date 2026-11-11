// Rich text for courses: a small Markdown subset with KaTeX math.
import katex from 'katex';
import { h } from '../hud/dom';
import { tokenize } from './script';
import { refKey, refLabel, splitRefs } from './refs';
import type { Token } from './types';

/** `[[key:content]]` tags a term for morphing/highlighting: becomes \htmlData{m=key}{content}. */
export function expandTags(tex: string): string {
  let out = '';
  let i = 0;
  while (i < tex.length) {
    const open = tex.indexOf('[[', i);
    if (open < 0) {
      out += tex.slice(i);
      break;
    }
    const colon = tex.indexOf(':', open);
    const key = tex.slice(open + 2, colon);
    if (colon < 0 || !/^[\w-]+$/.test(key)) {
      out += tex.slice(i, open + 2);
      i = open + 2;
      continue;
    }
    // find the matching ]] (brackets inside are allowed when balanced)
    let depth = 0;
    let j = colon + 1;
    for (; j < tex.length; j++) {
      if (tex.startsWith('[[', j)) {
        depth++;
        j++;
      } else if (tex.startsWith(']]', j)) {
        if (depth === 0) break;
        depth--;
        j++;
      }
    }
    out += tex.slice(i, open) + `\\htmlData{m=${key}}{${expandTags(tex.slice(colon + 1, j))}}`;
    i = j + 2;
  }
  return out;
}

export function tex(el: HTMLElement, src: string, display = false): HTMLElement {
  try {
    katex.render(expandTags(src), el, {
      displayMode: display,
      throwOnError: false,
      errorColor: '#ffffff',
      strict: 'ignore',
      output: 'html',
      trust: (c: { command: string }) => c.command === '\\htmlData',
    });
  } catch {
    el.textContent = src;
  }
  return el;
}


/** Inline Markdown over a token stream, so that **bold** and *italic* may span math. */
function appendInline(tokens: Token[], root: HTMLElement, displayBlocks: boolean): void {
  const stack: HTMLElement[] = [root];
  const top = () => stack[stack.length - 1];
  const toggle = (tag: 'strong' | 'em') => {
    if (top().tagName.toLowerCase() === tag && stack.length > 1) stack.pop();
    else {
      const el = h(tag);
      top().append(el);
      stack.push(el);
    }
  };
  for (const t of tokens) {
    if (t.t === 'math') {
      if (t.display && displayBlocks) root.append(tex(h('div', { class: 'mx-d' }), t.tex, true));
      else top().append(tex(h('span', { class: t.display ? 'mx mx-d' : 'mx' }), t.tex, false));
      continue;
    }
    if (t.t !== 'text') continue;
    for (const run of splitRefs(t.s)) {
      // [[course#anchor|label]]: a link (handled by LEARN through a delegated click)
      if (typeof run !== 'string') {
        top().append(h('a', { class: 'xref', href: `#/learn/${run.course}`, 'data-ref': refKey(run), text: refLabel(run) }));
        continue;
      }
      // split on `code`, ** and * (a single * followed by a space is a plain star)
      for (const part of run.split(/(`[^`]+`|\*\*|\*(?=\S)|(?<=\S)\*)/)) {
        if (!part) continue;
        if (part === '**') toggle('strong');
        else if (part === '*') toggle('em');
        else if (part.startsWith('`') && part.endsWith('`') && part.length > 1) top().append(h('code', { text: part.slice(1, -1) }));
        else top().append(part);
      }
    }
  }
}

/** Render display tokens (subtitles, transcript). Markers are skipped. */
export function renderTokens(tokens: Token[], into: HTMLElement): HTMLElement {
  appendInline(tokens, into, false);
  return into;
}

/** Paragraphs, "- " lists, $$display$$, $inline$, **bold**, *italic*. */
export function rich(src: string, cls = 'rich'): HTMLElement {
  const root = h('div', { class: cls });
  const blocks = src.replace(/\r\n?/g, '\n').split(/\n\s*\n/);
  for (const b of blocks) {
    const lines = b.split('\n');
    if (lines.every((l) => /^\s*(- |\d+\. )/.test(l))) {
      const ordered = /^\s*\d+\. /.test(lines[0]);
      const list = h(ordered ? 'ol' : 'ul');
      for (const l of lines) list.append(paragraph(l.replace(/^\s*(- |\d+\. )/, ''), 'li'));
      root.append(list);
    } else root.append(paragraph(lines.join(' '), 'p'));
  }
  return root;
}

function paragraph(s: string, tag: 'p' | 'li'): HTMLElement {
  const el = h(tag);
  appendInline(tokenize(s).tokens, el, true);
  return el;
}

/** Plain text of tokens (search index, aria); references read as their label. */
export function plain(tokens: Token[]): string {
  return tokens.map((t) => (t.t === 'text' ? splitRefs(t.s).map((p) => (typeof p === 'string' ? p : refLabel(p))).join('') : t.t === 'math' ? t.tex : '')).join('');
}
