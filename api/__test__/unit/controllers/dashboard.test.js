import { jest } from "@jest/globals";

const Transaction = { getSummary: jest.fn(), getAll: jest.fn() };
const Goal = { getAll: jest.fn() };
jest.unstable_mockModule("../../../models/transaction.js", () => ({ default: Transaction }));
jest.unstable_mockModule("../../../models/goal.js", () => ({ default: Goal }));

const { default: dashboardController } = await import("../../../controllers/dashboard.js");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Dashboard controller", () => {
  beforeEach(() => jest.resetAllMocks());

  describe("index", () => {
    it("responds 200 with the balance, monthly totals and savings figures", async () => {
      Transaction.getSummary.mockResolvedValue({ balance: 2734.87, monthIncome: 2750, monthExpenses: 1202.08 });
      Transaction.getAll.mockResolvedValue([]);
      Goal.getAll.mockResolvedValue([]);
      const res = mockRes();

      await dashboardController.index({ userId: 1 }, res);

      expect(Transaction.getSummary).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      const body = res.json.mock.calls[0][0];
      expect(body.balance).toBe(2734.87);
      expect(body.monthIncome).toBe(2750);
      expect(body.monthExpenses).toBe(1202.08);
      // (2750 - 1202.08) / 2750 = 56.28...% rounded to 56
      expect(body.savingsRate).toBe(56);
      expect(body.availableToInvest).toBeCloseTo(1547.92, 2);
    });

    it("returns a savings rate of 0 when there is no income this month", async () => {
      Transaction.getSummary.mockResolvedValue({ balance: 100, monthIncome: 0, monthExpenses: 50 });
      Transaction.getAll.mockResolvedValue([]);
      Goal.getAll.mockResolvedValue([]);
      const res = mockRes();

      await dashboardController.index({ userId: 1 }, res);

      const body = res.json.mock.calls[0][0];
      expect(body.savingsRate).toBe(0);
      expect(body.availableToInvest).toBe(0);
    });

    it("never reports a negative amount available to invest", async () => {
      Transaction.getSummary.mockResolvedValue({ balance: 0, monthIncome: 1000, monthExpenses: 1500 });
      Transaction.getAll.mockResolvedValue([]);
      Goal.getAll.mockResolvedValue([]);
      const res = mockRes();

      await dashboardController.index({ userId: 1 }, res);

      const body = res.json.mock.calls[0][0];
      expect(body.availableToInvest).toBe(0);
      expect(body.savingsRate).toBe(-50);
    });

    it("returns only the four most recent transactions", async () => {
      Transaction.getSummary.mockResolvedValue({ balance: 0, monthIncome: 0, monthExpenses: 0 });
      Transaction.getAll.mockResolvedValue([1, 2, 3, 4, 5, 6].map((id) => ({ transaction_id: id })));
      Goal.getAll.mockResolvedValue([]);
      const res = mockRes();

      await dashboardController.index({ userId: 1 }, res);

      const body = res.json.mock.calls[0][0];
      expect(body.recentTransactions.map((t) => t.transaction_id)).toEqual([1, 2, 3, 4]);
    });

    it("includes the user's goals", async () => {
      const goals = [{ goal_id: 1, name: "Emergency Fund", percent: 50 }];
      Transaction.getSummary.mockResolvedValue({ balance: 0, monthIncome: 0, monthExpenses: 0 });
      Transaction.getAll.mockResolvedValue([]);
      Goal.getAll.mockResolvedValue(goals);
      const res = mockRes();

      await dashboardController.index({ userId: 1 }, res);

      expect(res.json.mock.calls[0][0].goals).toEqual(goals);
    });

    it("falls back to empty lists for a new user with no transactions or goals", async () => {
      Transaction.getSummary.mockResolvedValue({ balance: 0, monthIncome: 0, monthExpenses: 0 });
      Transaction.getAll.mockRejectedValue(new Error("No transactions available"));
      Goal.getAll.mockRejectedValue(new Error("No goals available"));
      const res = mockRes();

      await dashboardController.index({ userId: 1 }, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const body = res.json.mock.calls[0][0];
      expect(body.recentTransactions).toEqual([]);
      expect(body.goals).toEqual([]);
    });

    it("responds 500 when the summary query fails", async () => {
      Transaction.getSummary.mockRejectedValue(new Error("connection refused"));
      const res = mockRes();

      await dashboardController.index({ userId: 1 }, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "connection refused" });
    });
  });
});