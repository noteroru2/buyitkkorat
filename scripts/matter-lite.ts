/** Minimal YAML frontmatter parser for markdown content files */
export default function matter(raw: string): { data: Record<string, unknown>; content: string } {
  const source = raw.replace(/^\uFEFF/, "");
  if (!source.startsWith("---")) {
    return { data: {}, content: source };
  }
  const end = source.indexOf("\n---", 3);
  if (end === -1) return { data: {}, content: source };
  const fm = source.slice(4, end).trim();
  const content = source.slice(end + 4).replace(/^\s*/, "");
  const data: Record<string, unknown> = {};
  const lines = fm.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!m) {
      i += 1;
      continue;
    }
    const key = m[1];
    let value = m[2].trim();
    if (value === "" || value === "|" || value === ">") {
      // nested block or array
      const block: unknown[] = [];
      i += 1;
      if (key === "faq" || key === "relatedPages") {
        if (key === "relatedPages") {
          const arr: string[] = [];
          while (i < lines.length && /^\s+-/.test(lines[i])) {
            arr.push(lines[i].replace(/^\s+-\s*/, "").replace(/^["']|["']$/g, ""));
            i += 1;
          }
          data[key] = arr;
          continue;
        }
        const faqs: { question: string; answer: string }[] = [];
        while (i < lines.length && (/^\s+-/.test(lines[i]) || /^\s{2,}/.test(lines[i]))) {
          if (/^\s+-\s+question:/.test(lines[i])) {
            const question = lines[i].replace(/^\s+-\s+question:\s*/, "").replace(/^["']|["']$/g, "");
            i += 1;
            let answer = "";
            if (i < lines.length && /^\s+answer:/.test(lines[i])) {
              answer = lines[i].replace(/^\s+answer:\s*/, "").replace(/^["']|["']$/g, "");
              i += 1;
            }
            faqs.push({ question, answer });
            continue;
          }
          i += 1;
        }
        data[key] = faqs;
        continue;
      }
      data[key] = block;
      continue;
    }
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (value === "true") data[key] = true;
    else if (value === "false") data[key] = false;
    else data[key] = value;
    i += 1;
  }
  return { data, content };
}
