import type { RefObject } from "react";

type FieldEl = HTMLInputElement | HTMLTextAreaElement;

function focusAndCaret(el: FieldEl, start: number, end: number) {
  el.focus();
  queueMicrotask(() => {
    try {
      el.setSelectionRange(start, end);
    } catch {
      /* ignore */
    }
  });
}

export function insertSnippetAtCaret(
  ref: RefObject<FieldEl | null>,
  current: string,
  setValue: (next: string) => void,
  snippet: string
): void {
  const el = ref.current;
  const start = el?.selectionStart ?? current.length;
  const end = el?.selectionEnd ?? current.length;
  const next = current.slice(0, start) + snippet + current.slice(end);
  setValue(next);
  const caret = start + snippet.length;
  if (el) focusAndCaret(el, caret, caret);
}

/** Wrap selection with same delimiter on both sides (`*`, `_`, `~`) or triple backticks for code. */
export function wrapSelectionWithDelimiter(
  ref: RefObject<FieldEl | null>,
  current: string,
  setValue: (next: string) => void,
  delimiter: "*" | "_" | "~" | "```"
): void {
  const el = ref.current;
  const start = el?.selectionStart ?? 0;
  const end = el?.selectionEnd ?? 0;
  const selected = current.slice(start, end);
  let inner: string;
  let open: string;
  let close: string;
  if (delimiter === "```") {
    inner = selected || "code";
    open = "```";
    close = "```";
  } else {
    inner = selected || (delimiter === "*" ? "bold" : delimiter === "_" ? "italic" : "strike");
    open = delimiter;
    close = delimiter;
  }
  const insertion = `${open}${inner}${close}`;
  const next = current.slice(0, start) + insertion + current.slice(end);
  setValue(next);
  if (el) {
    const selStart = start + open.length;
    const selEnd = selStart + inner.length;
    focusAndCaret(el, selStart, selEnd);
  }
}
