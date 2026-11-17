import { computeStats, stateDistribution } from "@/lib/dashboard-stats";
import { describe, expect, it } from "vitest";
import { EMPTY_CUSTOMER } from "@/constants/customer";
import type { Customer } from "@/types/customer";
import { findDuplicate, isValidGst, isValidMobile, isValidPin, normalizeCustomerInput, normalizeMobile, validateCustomer } from "@/lib/customer-validation";
import { availableLetters, filterCustomers, DEFAULT_FILTERS } from "@/lib/customer-search";
import { customersToCsv, parseCsv, rowsToObjects } from "@/lib/customer-csv";
import { autoMapColumns, buildImportRows } from "@/lib/customer-import";

const make = (over: Partial<Customer> = {}): Customer => ({
  ...EMPTY_CUSTOMER, id: "TAJ-1", name: "Ravi Kumar", shopName: "Ravi Textiles", mobile: "9876543210", city: "Erode", state: "Tamil Nadu", pin: "638001",
  createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", ...over,
});

describe("validation", () => {
  it("requires a name", () => expect(validateCustomer({ ...EMPTY_CUSTOMER }).name).toBeTruthy());
  it("accepts valid and rejects invalid mobiles", () => {
    expect(isValidMobile("98765 43210")).toBe(true);
    expect(isValidMobile("+91 98765-43210")).toBe(true);
    expect(isValidMobile("12345")).toBe(false);
    expect(isValidMobile("5876543210")).toBe(false);
    expect(normalizeMobile("+91 98765 43210")).toBe("9876543210");
  });
  it("validates PIN and GST", () => {
    expect(isValidPin("600021")).toBe(true);
    expect(isValidPin("060021")).toBe(false);
    expect(isValidPin("6000")).toBe(false);
    expect(isValidGst("33ABCDE1234F1Z5")).toBe(true);
    expect(isValidGst("33ABCDE1234F1Z")).toBe(false);
  });
  it("normalises input", () => {
    const n = normalizeCustomerInput({ ...EMPTY_CUSTOMER, name: "  Ali ", mobile: "+91 98765 43210", gst: "33abcde1234f1z5" });
    expect(n.name).toBe("Ali");
    expect(n.mobile).toBe("9876543210");
    expect(n.gst).toBe("33ABCDE1234F1Z5");
  });
  it("detects duplicates by mobile and by name+pin, ignoring the record being edited", () => {
    const list = [make()];
    expect(findDuplicate({ ...EMPTY_CUSTOMER, name: "Other", mobile: "98765 43210" }, list)).toBeTruthy();
    expect(findDuplicate({ ...EMPTY_CUSTOMER, name: "ravi kumar", pin: "638001" }, list)).toBeTruthy();
    expect(findDuplicate({ ...EMPTY_CUSTOMER, name: "New", mobile: "9000000001" }, list)).toBeUndefined();
    expect(findDuplicate({ ...EMPTY_CUSTOMER, name: "Ravi Kumar", mobile: "9876543210" }, list, "TAJ-1")).toBeUndefined();
  });
});

describe("search / filter", () => {
  const list = [make(), make({ id: "TAJ-2", name: "Anwar", shopName: "Anwar Garments", mobile: "9123456780", city: "Chennai", pin: "600021" })];
  it("searches by name, shop, mobile, city, pin", () => {
    for (const q of ["ravi", "garments", "91234", "chennai", "600021"]) expect(filterCustomers(list, { ...DEFAULT_FILTERS, search: q }).length).toBe(1);
  });
  it("filters by state/city and sorts by name", () => {
    expect(filterCustomers(list, { ...DEFAULT_FILTERS, city: "Erode" })).toHaveLength(1);
    expect(filterCustomers(list, { ...DEFAULT_FILTERS, sort: "name" })[0].name).toBe("Anwar");
  });
});

describe("csv + import", () => {
  it("round-trips quotes, commas and newlines", () => {
    const c = make({ notes: 'He said "hi", twice\nnew line', name: "A, B" });
    const rows = parseCsv(customersToCsv([c]));
    const { records } = rowsToObjects(rows);
    expect(records[0]["Customer Name"]).toBe("A, B");
    expect(records[0]["Additional Notes"]).toBe('He said "hi", twice\nnew line');
  });
  it("auto-maps export headings and flags errors and duplicates", () => {
    const headers = ["Customer Name", "Mobile Number", "PIN Code", "Shop / Business Name"];
    const mapping = autoMapColumns(headers);
    expect(mapping.name).toBe("Customer Name");
    expect(mapping.shopName).toBe("Shop / Business Name");
    const rows = buildImportRows([
      { "Customer Name": "New One", "Mobile Number": "9000000001", "PIN Code": "600001", "Shop / Business Name": "" },
      { "Customer Name": "", "Mobile Number": "123", "PIN Code": "1", "Shop / Business Name": "" },
      { "Customer Name": "Dup In File", "Mobile Number": "9000000001", "PIN Code": "", "Shop / Business Name": "" },
      { "Customer Name": "Ravi Again", "Mobile Number": "9876543210", "PIN Code": "", "Shop / Business Name": "" },
    ], mapping, [make()]);
    expect(rows[0].errors).toHaveLength(0);
    expect(rows[1].errors.length).toBeGreaterThan(0);
    expect(rows[2].duplicateOf).toMatch(/row 2/);
    expect(rows[3].duplicateOf).toMatch(/Already saved/);
  });
});

describe("dashboard stats", () => {
  const list = [
    make({ id: "CUS00001", state: "Tamil Nadu", district: "Chennai", pin: "600001" }),
    make({ id: "CUS00002", state: "tamil nadu", district: "Erode", pin: "638001", active: false }),
    make({ id: "CUS00003", state: "Karnataka", district: "Bengaluru Urban", pin: "560001" }),
    make({ id: "CUS00004", state: "", district: "", pin: "" }),
  ];
  it("counts distinct states, districts and pins (case-insensitive)", () => {
    const s = computeStats(list);
    expect(s).toMatchObject({ total: 4, active: 3, states: 2, districts: 3, pins: 3 });
  });
  it("builds a state distribution, largest first", () => {
    expect(stateDistribution(list)).toEqual([
      { state: "Tamil Nadu", count: 1 }, { state: "Karnataka", count: 1 }, { state: "Not specified", count: 1 }, { state: "tamil nadu", count: 1 },
    ].sort((a, b) => b.count - a.count || a.state.localeCompare(b.state)));
  });
});

describe("directory filters", () => {
  const list = [make({ id: "A", district: "Erode", area: "Gandhi Nagar", pin: "638001" }), make({ id: "B", district: "Salem", area: "Fairlands", pin: "636016" })];
  it("filters by district, area text and pin prefix", () => {
    expect(filterCustomers(list, { ...DEFAULT_FILTERS, district: "Salem" }).map((c) => c.id)).toEqual(["B"]);
    expect(filterCustomers(list, { ...DEFAULT_FILTERS, area: "gandhi" }).map((c) => c.id)).toEqual(["A"]);
    expect(filterCustomers(list, { ...DEFAULT_FILTERS, pin: "6360" }).map((c) => c.id)).toEqual(["B"]);
  });
});

describe("A–Z letter filter", () => {
  const list = [
    make({ id: "1", name: "Dinesh", shopName: "Zed Fashions" }),
    make({ id: "2", name: "Ravi", shopName: "Dudes" }),
    make({ id: "3", name: "Kumar", shopName: "" }),
    make({ id: "4", name: "Émile", shopName: "7 Star" }),
  ];
  it("matches customers whose name OR shop name starts with the letter", () => {
    expect(filterCustomers(list, { ...DEFAULT_FILTERS, letter: "D" }).map((c) => c.id).sort()).toEqual(["1", "2"]);
    expect(filterCustomers(list, { ...DEFAULT_FILTERS, letter: "Z" }).map((c) => c.id)).toEqual(["1"]);
    expect(filterCustomers(list, { ...DEFAULT_FILTERS, letter: "E" }).map((c) => c.id)).toEqual(["4"]); // accents ignored
    expect(filterCustomers(list, { ...DEFAULT_FILTERS, letter: "#" }).map((c) => c.id)).toEqual(["4"]); // shop "7 Star"
  });
  it("lists only letters that have customers", () => {
    expect([...availableLetters(list)].sort()).toEqual(["#", "D", "E", "K", "R", "Z"]);
  });
  it("combines with other filters", () => {
    expect(filterCustomers(list, { ...DEFAULT_FILTERS, letter: "D", search: "dudes" }).map((c) => c.id)).toEqual(["2"]);
  });
});
