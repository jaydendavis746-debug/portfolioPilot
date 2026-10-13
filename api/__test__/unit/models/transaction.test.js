import { jest } from "@jest/globals";

const query = jest.fn();
jest.unstable_mockModule("../../../db/connect.js", () => ({ default: { query } }));

const { default: Transaction } = await import("../../../models/transaction.js");

const row = {
  transaction_id: 1,
  type: "expense",
  amount: "45.20", 
  description: "Tesco weekly shop",
  transaction_date: "2026-10-13",
  category_id: 1,
  category: "Food & Drink",
};

describe("Transaction model", () => {
  beforeEach(() => query.mockReset());

  describe("constructor", () => {
    it("converts the amount from a string to a number", () => {
      const transaction = new Transaction(row);

      expect(transaction.amount).toBe(45.2);
      expect(typeof transaction.amount).toBe("number");
    });
  });

  describe("getAll", () => {
    it("returns Transaction instances for the user", async () => {
      query.mockResolvedValue({ rows: [row] });

      const result = await Transaction.getAll(1);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Transaction);
      expect(result[0].category).toBe("Food & Drink");
    });

    it("only filters by user when no filters are given", async () => {
      query.mockResolvedValue({ rows: [row] });

      await Transaction.getAll(1);

      const [sql, params] = query.mock.calls[0];
      expect(sql).toContain("t.user_id = $1");
      expect(sql).not.toContain("t.type =");
      expect(sql).not.toContain("t.category_id =");
      expect(params).toEqual([1]);
    });

    it("adds the type filter", async () => {
      query.mockResolvedValue({ rows: [row] });

      await Transaction.getAll(1, { type: "expense" });

      const [sql, params] = query.mock.calls[0];
      expect(sql).toContain("AND t.type = $2");
      expect(params).toEqual([1, "expense"]);
    });

    it("adds the category filter", async () => {
      query.mockResolvedValue({ rows: [row] });

      await Transaction.getAll(1, { categoryId: 3 });

      const [sql, params] = query.mock.calls[0];
      expect(sql).toContain("AND t.category_id = $2");
      expect(params).toEqual([1, 3]);
    });

    it("numbers the placeholders correctly when both filters are used", async () => {
      query.mockResolvedValue({ rows: [row] });

      await Transaction.getAll(1, { type: "expense", categoryId: 3 });

      const [sql, params] = query.mock.calls[0];
      expect(sql).toContain("AND t.type = $2");
      expect(sql).toContain("AND t.category_id = $3");
      expect(params).toEqual([1, "expense", 3]);
    });

    it("throws when the user has no transactions", async () => {
      query.mockResolvedValue({ rows: [] });

      await expect(Transaction.getAll(1)).rejects.toThrow("No transactions available");
    });
  });

  describe("getById", () => {
    it("returns the matching transaction", async () => {
      query.mockResolvedValue({ rows: [row] });

      const result = await Transaction.getById(1, 1);

      expect(result).toBeInstanceOf(Transaction);
      expect(result.transaction_id).toBe(1);
      expect(query.mock.calls[0][1]).toEqual([1, 1]);
    });

    it("throws when no transaction matches", async () => {
      query.mockResolvedValue({ rows: [] });

      await expect(Transaction.getById(999, 1)).rejects.toThrow("Unable to locate transaction");
    });
  });

  describe("getSummary", () => {
    it("calculates the balance and monthly totals as numbers", async () => {
      query.mockResolvedValue({
        rows: [
          {
            total_income: "5150.00",
            total_expenses: "2415.13",
            month_income: "2750.00",
            month_expenses: "1202.08",
          },
        ],
      });

      const summary = await Transaction.getSummary(1);

      expect(summary.balance).toBeCloseTo(2734.87, 2);
      expect(summary.monthIncome).toBe(2750);
      expect(summary.monthExpenses).toBe(1202.08);
    });

    it("returns zeros for a user with no transactions", async () => {
      query.mockResolvedValue({
        rows: [{ total_income: "0", total_expenses: "0", month_income: "0", month_expenses: "0" }],
      });

      const summary = await Transaction.getSummary(1);

      expect(summary).toEqual({ balance: 0, monthIncome: 0, monthExpenses: 0 });
    });
  });
});