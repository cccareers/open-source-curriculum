/**
 * Frontmatter parser for Markdown and MDX files.
 * Extracts YAML header enclosed between leading `---` delimiters.
 */

export function parseFrontmatter(rawContent) {
  if (!rawContent || typeof rawContent !== 'string') {
    return { data: {}, content: '' };
  }

  // Check if content begins with frontmatter delimiter ---
  const trimmed = rawContent.trimStart();
  if (!trimmed.startsWith('---')) {
    return { data: {}, content: rawContent };
  }

  const firstDelimiterIndex = rawContent.indexOf('---');
  const secondDelimiterIndex = rawContent.indexOf('---', firstDelimiterIndex + 3);

  if (secondDelimiterIndex === -1) {
    // No closing delimiter
    return { data: {}, content: rawContent };
  }

  const rawYaml = rawContent.substring(firstDelimiterIndex + 3, secondDelimiterIndex).trim();
  const bodyContent = rawContent.substring(secondDelimiterIndex + 3).replace(/^\r?\n/, '');

  const data = parseSimpleYaml(rawYaml);
  return { data, content: bodyContent };
}

/**
 * Lightweight YAML parser for common frontmatter patterns:
 * - key: value
 * - key: "quoted string"
 * - key: [item1, item2, item3]
 * - lists:
 *     - item 1
 *     - item 2
 * - numbers, booleans, null
 */
export function parseSimpleYaml(yamlStr) {
  if (!yamlStr) return {};
  const result = {};
  const lines = yamlStr.split(/\r?\n/);
  
  let currentKey = null;
  let currentList = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines or comments
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    // Check for list item under currentKey
    if (trimmed.startsWith('- ') && currentKey) {
      if (!currentList) {
        currentList = [];
        result[currentKey] = currentList;
      }
      const val = parseScalarValue(trimmed.slice(2).trim());
      currentList.push(val);
      continue;
    }

    // Indented continuation of a wrapped list item (YAML plain-scalar folding)
    const lastIdx = currentList ? currentList.length - 1 : -1;
    if (/^\s/.test(line) && lastIdx >= 0 && typeof currentList[lastIdx] === 'string') {
      const joined = `${currentList[lastIdx]} ${trimmed}`;
      // A quoted scalar that spans lines only closes its quote on the last line
      const quoted = /^(["']).*\1$/.test(joined);
      currentList[lastIdx] = quoted ? joined.slice(1, -1) : joined;
      continue;
    }

    // Key-value pair
    const colonIdx = line.indexOf(':');
    if (colonIdx !== -1) {
      const key = line.slice(0, colonIdx).trim();
      const rawVal = line.slice(colonIdx + 1).trim();

      currentKey = key;
      currentList = null;

      if (rawVal === '') {
        // Value might be a multi-line list following this line
        result[key] = [];
        currentList = result[key];
      } else {
        result[key] = parseScalarValue(rawVal);
      }
    }
  }

  return result;
}

function parseScalarValue(val) {
  if (val === undefined || val === null) return '';
  val = val.trim();

  // Boolean
  if (val.toLowerCase() === 'true') return true;
  if (val.toLowerCase() === 'false') return false;

  // Null
  if (val.toLowerCase() === 'null' || val === '~') return null;

  // Number
  if (!isNaN(val) && val !== '' && !val.startsWith('0x') && !val.includes(':')) {
    const num = Number(val);
    if (!isNaN(num)) return num;
  }

  // Quoted string
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1);
  }

  // Inline array: [a, b, c]
  if (val.startsWith('[') && val.endsWith(']')) {
    const inner = val.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(',').map(item => parseScalarValue(item.trim()));
  }

  return val;
}
