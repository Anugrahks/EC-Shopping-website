export type OrderStatus = "pending" | "received" | "delivered" | "returned";

export type OrderReportItem = {
  total: number;
  count: number;
};

export type OrderReport = {
  day: OrderReportItem;
  week: OrderReportItem;
  month: OrderReportItem;
};

export type OrderReportSource = {
  total: number;
  createdAt?: string;
  date?: string;
};

const parseDate = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const getOrderReport = (orders: OrderReportSource[], now = new Date()): OrderReport => {
  const report: OrderReport = {
    day: { total: 0, count: 0 },
    week: { total: 0, count: 0 },
    month: { total: 0, count: 0 },
  };

  for (const order of orders) {
    const date = parseDate(order.createdAt ?? order.date);
    if (!date) continue;

    if (date.toDateString() === now.toDateString()) {
      report.day.total += Number(order.total) || 0;
      report.day.count += 1;
    }

    const diffMs = now.getTime() - date.getTime();
    if (diffMs >= 0 && diffMs <= 7 * 24 * 60 * 60 * 1000) {
      report.week.total += Number(order.total) || 0;
      report.week.count += 1;
    }

    if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()) {
      report.month.total += Number(order.total) || 0;
      report.month.count += 1;
    }
  }

  return report;
};
