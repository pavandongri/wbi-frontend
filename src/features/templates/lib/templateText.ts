const VAR_RE = /\{\{\s*([^}]+?)\s*\}\}/g;

/** Ordered unique placeholder keys as they appear in the string (e.g. `name` for `{{name}}`). */
export function extractTemplateVariableKeys(text: string | null | undefined): string[] {
  if (!text) return [];
  const seen = new Set<string>();
  const ordered: string[] = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(VAR_RE.source, "g");
  while ((m = re.exec(text)) !== null) {
    const key = m[1].trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    ordered.push(key);
  }
  return ordered;
}

/** Counts `{{…}}` occurrences (WhatsApp text header allows at most one). */
export function countVariablePlaceholders(text: string): number {
  const re = /\{\{[^}]+\}\}/g;
  const m = text.match(re);
  return m ? m.length : 0;
}

export function mergeVariableKeys(header: string | null | undefined, body: string): string[] {
  const ordered: string[] = [];
  const seen = new Set<string>();
  for (const key of [
    ...extractTemplateVariableKeys(header),
    ...extractTemplateVariableKeys(body)
  ]) {
    if (seen.has(key)) continue;
    seen.add(key);
    ordered.push(key);
  }
  return ordered;
}

/** Replace `{{key}}` using a map. Falls back to `{{key}}` when the value is absent or empty. */
export function substituteTemplateVariables(text: string, values: Record<string, string>): string {
  return text.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, raw: string) => {
    const key = String(raw).trim();
    const val = Object.prototype.hasOwnProperty.call(values, key) ? values[key]! : "";
    return val || `{{${key}}}`;
  });
}

export type PreviewSegment =
  | { kind: "plain"; text: string }
  | { kind: "bold"; text: string }
  | { kind: "italic"; text: string }
  | { kind: "strike"; text: string }
  | { kind: "code"; text: string };

function segmentPlainInline(chunk: string): PreviewSegment[] {
  if (!chunk) return [];
  const re = /(\*[^*\n]+\*|_[^_]+_|~[^~\n]+~)/g;
  const out: PreviewSegment[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(chunk)) !== null) {
    if (m.index > last) out.push({ kind: "plain", text: chunk.slice(last, m.index) });
    const piece = m[0];
    if (piece.startsWith("*")) out.push({ kind: "bold", text: piece.slice(1, -1) });
    else if (piece.startsWith("_")) out.push({ kind: "italic", text: piece.slice(1, -1) });
    else out.push({ kind: "strike", text: piece.slice(1, -1) });
    last = m.index + piece.length;
  }
  if (last < chunk.length) out.push({ kind: "plain", text: chunk.slice(last) });
  return out.length ? out : [{ kind: "plain", text: chunk }];
}

/** WhatsApp-style segments: `*bold*`, `_italic_`, `~strike~`, ```code``` */
export function segmentWhatsAppPreview(text: string): PreviewSegment[] {
  const re = /(```[\s\S]*?```|\*[^*\n]+\*|_[^_]+_|~[^~\n]+~)/g;
  const out: PreviewSegment[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(...segmentPlainInline(text.slice(last, m.index)));
    const piece = m[0];
    if (piece.startsWith("```")) out.push({ kind: "code", text: piece.slice(3, -3) });
    else if (piece.startsWith("*")) out.push({ kind: "bold", text: piece.slice(1, -1) });
    else if (piece.startsWith("_")) out.push({ kind: "italic", text: piece.slice(1, -1) });
    else out.push({ kind: "strike", text: piece.slice(1, -1) });
    last = m.index + piece.length;
  }
  if (last < text.length) out.push(...segmentPlainInline(text.slice(last)));
  return out.length ? out : [{ kind: "plain", text: text }];
}
