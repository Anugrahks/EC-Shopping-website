import { describe, expect, it } from "vitest";
import { getOrderReport } from "./order-report";

describe("getOrderReport", () => {
  it("groups totals by day, week, and month from saved orders", () => {
    const now = new Date("2026-09-30T15:00:00Z");

    const report = getOrderReport([
      { id: "1", total: 120, createdAt: "2026-09-30T09:00:00Z" },
      { id: "2", total: 180, createdAt: "2026-09-28T12:00:00Z" },
      { id: "3", total: 240, createdAt: "2026-09-02T09:00:00Z" },
      { id: "4", total: 500, createdAt: "2026-08-20T14:00:00Z" },
    ], now);

    expect(report.day.total).toBe(120);
    expect(report.week.total).toBe(300);
    expect(report.month.total).toBe(540);
  });
});
