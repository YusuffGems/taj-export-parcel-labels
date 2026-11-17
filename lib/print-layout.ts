import type { ToBlock } from "./format";

/** Maximum number of address labels on one A4 sheet. */
export const LABELS_PER_PAGE = 2;

/**
 * Groups items into A4 pages: 1 → [1], 2 → [2], 3 → [2,1], 4 → [2,2], 5 → [2,2,1] …
 * The last page is never padded with an empty label.
 */
export function chunkPairs<T>(items: T[], size: number = LABELS_PER_PAGE): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) pages.push(items.slice(i, i + size));
  return pages;
}

export function pageCountFor(customerCount: number): number {
  return Math.ceil(customerCount / LABELS_PER_PAGE);
}

// Printable area of one label (148 mm tall, 12 mm padding) and its inner width, in pt.
const INNER_HEIGHT_PT = 351;
const INNER_WIDTH_PT = 500;
const FONT_SIZES_PT = [20, 18, 16, 14, 12.5, 11, 10];
const AVG_CHAR_WIDTH_EM = 0.58;
const LINE_HEIGHT = 1.35;

function wrappedLines(text: string, charsPerLine: number): number {
  return Math.max(1, Math.ceil(text.length / Math.max(8, charsPerLine)));
}

export function estimateLines(block: ToBlock, charsPerLine: number): number {
  let lines = Math.ceil(wrappedLines(block.name, charsPerLine * 0.85) * 1.15);
  if (block.shop) lines += wrappedLines(block.shop, charsPerLine);
  for (const line of block.body) lines += wrappedLines(line, charsPerLine);
  if (block.phone) lines += wrappedLines(`Mobile: ${block.phone}`, charsPerLine);
  return lines;
}

/** Picks the largest font size (pt) at which the TO block fits inside its label. */
export function pickToFontSize(block: ToBlock, fromLineCount: number, scale = 1): number {
  const fromHeight = fromLineCount > 0 ? fromLineCount * 12.5 + 34 : 0;
  const available = INNER_HEIGHT_PT - fromHeight - 44; // minus "TO:" tag, border and padding
  for (const base of FONT_SIZES_PT) {
    const size = base * scale;
    const charsPerLine = Math.floor(INNER_WIDTH_PT / (size * AVG_CHAR_WIDTH_EM));
    if (estimateLines(block, charsPerLine) * size * LINE_HEIGHT <= available) return size;
  }
  return FONT_SIZES_PT[FONT_SIZES_PT.length - 1] * scale;
}
