import type { PrintOptions } from "@/types/printing";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LabelSheet } from "@/components/printing/label-sheet";
import { describe, expect, it } from "vitest";
import { EMPTY_CUSTOMER } from "@/constants/customer";
import type { Customer } from "@/types/customer";
import { buildSenderLines, buildToBlock } from "@/lib/format";
import { DEFAULT_SENDER } from "@/constants/business";
import { chunkPairs, pageCountFor, pickToFontSize } from "@/lib/print-layout";

const make = (n: number, over: Partial<Customer> = {}): Customer => ({
  ...EMPTY_CUSTOMER, id: `C${n}`, name: `Customer ${n}`, address1: "12 Main Road", city: "Erode", state: "Tamil Nadu", pin: "638001", mobile: "9876543210",
  createdAt: "", updatedAt: "", ...over,
});
const many = (n: number) => Array.from({ length: n }, (_, i) => make(i + 1));

describe("A4 pairing (2 labels per page)", () => {
  const cases: [number, number[]][] = [
    [1, [1]], [2, [2]], [3, [2, 1]], [4, [2, 2]], [5, [2, 2, 1]], [10, [2, 2, 2, 2, 2]],
  ];
  it.each(cases)("%i customers → pages %j", (count, expected) => {
    const pages = chunkPairs(many(count));
    expect(pages.map((p) => p.length)).toEqual(expected);
    expect(pageCountFor(count)).toBe(expected.length);
    expect(pages.flat().map((c) => c.id)).toEqual(many(count).map((c) => c.id)); // order kept, nothing lost
  });
  it("never creates an empty page", () => {
    expect(chunkPairs([])).toEqual([]);
    for (let n = 1; n <= 25; n++) expect(chunkPairs(many(n)).every((p) => p.length >= 1 && p.length <= 2)).toBe(true);
  });
});

describe("label content", () => {
  it("builds the default sender exactly as specified", () => {
    expect(buildSenderLines(DEFAULT_SENDER)).toEqual([
      "TAJ EXPORT", "477Q+MWJ, Singara Thottam 3rd St", "Singara Garden, Old Washermenpet", "Chennai, Tamil Nadu – 600021",
    ]);
  });
  it("omits empty address parts and joins mobiles", () => {
    const b = buildToBlock(make(1, { altMobile: "9123456780", district: "Erode" }));
    expect(b.body).toEqual(["12 Main Road", "Erode", "Tamil Nadu – 638001"]);
    expect(b.phone).toBe("9876543210 / 9123456780");
  });
});

describe("auto font size", () => {
  const short = buildToBlock(make(1));
  const long = buildToBlock(make(2, { name: "M/S Very Long Customer Name And Sons Private Limited Wholesale Traders", shopName: "Sri Venkateswara Readymade Garments And Textiles Wholesale Merchants",
    address1: "No. 123/45-B, First Floor, Opposite To The Old Bus Stand Complex, Near Big Mosque Street", address2: "Behind Corporation Shopping Complex, Gandhi Nagar Main Road Extension",
    landmark: "Next to the District Central Cooperative Bank Head Office", area: "Gandhi Nagar", district: "Coimbatore" }));
  it("uses a large font for short addresses and shrinks for long ones", () => {
    expect(pickToFontSize(short, 4)).toBeGreaterThanOrEqual(18);
    expect(pickToFontSize(long, 4)).toBeLessThan(pickToFontSize(short, 4));
  });
  it("gives a bigger font when there is no FROM block", () => {
    expect(pickToFontSize(long, 0)).toBeGreaterThanOrEqual(pickToFontSize(long, 4));
  });
});

describe("rendered A4 sheets (server-side render of the real label component)", () => {
  const options: PrintOptions = { sender: DEFAULT_SENDER, showCutLine: true, fontScale: 1 };
  const render = (n: number, opts = options) =>
    chunkPairs(many(n)).map((group) => renderToStaticMarkup(createElement(LabelSheet, { customers: group, options: opts })));
  const count = (html: string, token: string) => html.split(token).length - 1;

  it.each([[1, [1]], [2, [2]], [3, [2, 1]], [4, [2, 2]], [5, [2, 2, 1]], [10, [2, 2, 2, 2, 2]]] as [number, number[]][])(
    "%i customers → sheets with %j labels",
    (n, expected) => {
      const sheets = render(n);
      expect(sheets).toHaveLength(expected.length);
      sheets.forEach((html, i) => {
        expect(count(html, 'class="sheet"')).toBe(1);
        expect(count(html, 'class="label"')).toBe(expected[i]);
        expect(count(html, "cut-line")).toBe(expected[i] === 2 ? 1 : 0); // no cut line / empty label for a lone address
      });
    },
  );
  it("prints FROM only when a sender is set", () => {
    expect(render(1)[0]).toContain("FROM:");
    expect(render(1, { ...options, sender: null })[0]).not.toContain("FROM:");
  });
  it("renders long names and addresses in full", () => {
    const c = make(1, { name: "N".repeat(120), address1: "A".repeat(200) });
    const html = renderToStaticMarkup(createElement(LabelSheet, { customers: [c], options }));
    expect(html).toContain("N".repeat(120));
    expect(html).toContain("A".repeat(200));
  });
});
