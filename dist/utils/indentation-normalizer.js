/**
 * Detects the minimum indentation level in a set of lines and returns
 * normalized lines with relative indentation.
 *
 * Example:
 *   Input:  ["      const x = 1;", "        const y = 2;"]
 *   Output: ["const x = 1;", "\tconst y = 2;"]
 */
export function normalizeIndentation(lines) {
    if (lines.length === 0) {
        return lines;
    }
    // Find minimum indentation level (excluding empty lines)
    let minIndent = Number.POSITIVE_INFINITY;
    for (const line of lines) {
        if (line.trim().length === 0) {
            continue; // Skip empty lines
        }
        // Count leading whitespace
        const match = line.match(/^(\s+)/);
        if (match) {
            const whitespace = match[1];
            // Convert to a normalized count (treating tab as 1 unit, 2 spaces as 1 unit)
            const tabCount = (whitespace.match(/\t/g) || []).length;
            const spaceCount = (whitespace.match(/ /g) || []).length;
            const normalizedIndent = tabCount + Math.floor(spaceCount / 2);
            minIndent = Math.min(minIndent, normalizedIndent);
        }
        else {
            // Line has no leading whitespace
            minIndent = 0;
            break;
        }
    }
    // If all lines are empty, return as-is
    if (minIndent === Number.POSITIVE_INFINITY) {
        return lines;
    }
    // No normalization needed if already at 0 indentation
    if (minIndent === 0) {
        return lines;
    }
    // Always use 2 spaces for display (compact and terminal-friendly)
    const indentChar = '  ';
    // Normalize each line
    return lines.map(line => {
        if (line.trim().length === 0) {
            return line; // Keep empty lines as-is
        }
        // Calculate current indentation level
        const match = line.match(/^(\s+)/);
        if (!match) {
            return line; // No indentation to normalize
        }
        const whitespace = match[1];
        const tabCount = (whitespace.match(/\t/g) || []).length;
        const spaceCount = (whitespace.match(/ /g) || []).length;
        const currentIndent = tabCount + Math.floor(spaceCount / 2);
        // Calculate relative indentation
        const relativeIndent = Math.max(0, currentIndent - minIndent);
        // Return line with normalized indentation
        return indentChar.repeat(relativeIndent) + line.trimStart();
    });
}
//# sourceMappingURL=indentation-normalizer.js.map