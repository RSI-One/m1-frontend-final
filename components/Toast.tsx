"use client";

import { useSite } from "../lib/site-context";

export default function Toast() {
  const { toast } = useSite();
  return <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>;
}
