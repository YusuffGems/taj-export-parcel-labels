"use client";

import { useEffect, useState } from "react";

/** Today's date, rendered after mount so the static export never shows a stale build-time date. */
export function DateChip() {
  const [text, setText] = useState("");
  useEffect(() => {
    setText(new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }));
  }, []);
  return (
    <div className="shrink-0 rounded-xl border border-line bg-card px-4 py-2.5 text-sm font-medium text-fg shadow-sm sm:px-5 sm:py-3 sm:text-base">
      {text || "\u00a0"}
    </div>
  );
}
