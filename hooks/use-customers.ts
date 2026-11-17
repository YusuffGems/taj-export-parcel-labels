"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useMemo, useState } from "react";
import { db } from "@/lib/database";
import { getSettings } from "@/lib/customer-storage";
import { DEFAULT_FILTERS, availableLetters, filterCustomers, uniqueSorted, type CustomerFilters } from "@/lib/customer-search";
import type { Customer } from "@/types/customer";
import type { AppSettings } from "@/types/settings";
import { DEFAULT_SETTINGS } from "@/constants/business";

/** Live list of all customers; updates automatically when IndexedDB changes. */
export function useCustomers() {
  const data = useLiveQuery(() => db.customers.toArray(), []);
  return { customers: data ?? ([] as Customer[]), loading: data === undefined };
}

export function useSettings() {
  const data = useLiveQuery(() => getSettings(), []);
  return { settings: data ?? DEFAULT_SETTINGS as AppSettings, loading: data === undefined };
}

/** Search + filter + sort + pagination state for customer lists. */
export function useCustomerQuery(customers: Customer[], initialPageSize = 10) {
  const [filters, setFiltersState] = useState<CustomerFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const setFilters = (patch: Partial<CustomerFilters>) => {
    setFiltersState((prev) => {
      const next = { ...prev, ...patch };
      if (patch.state !== undefined && patch.state !== prev.state) next.district = "";
      return next;
    });
    setPage(1);
  };
  const reset = () => { setFiltersState(DEFAULT_FILTERS); setPage(1); };
  const setPageSize = (n: number) => { setPageSizeState(n); setPage(1); };

  const filtered = useMemo(() => filterCustomers(customers, filters), [customers, filters]);
  const letters = useMemo(() => availableLetters(filterCustomers(customers, { ...filters, letter: "" })), [customers, filters]);
  const states = useMemo(() => uniqueSorted(customers.map((c) => c.state)), [customers]);
  const districts = useMemo(
    () => uniqueSorted(customers.filter((c) => !filters.state || c.state === filters.state).map((c) => c.district)),
    [customers, filters.state],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return { filters, setFilters, reset, filtered, pageItems, page: safePage, setPage, pageSize, setPageSize, pageCount, letters, states, districts, total: customers.length };
}
