import { jest } from "@jest/globals";

const Transaction = { getAll: jest.fn(), getById: jest.fn() };
jest.unstable_mockModule("../../../models/transaction.js", () => ({ default: Transaction }));

const { default: transactionController } = await import("../../../controllers/transaction.js");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Transaction controller", () => {
  beforeEach(() => jest.resetAllMocks());

  describe("index", () => {
    it("responds 200 with all of the user's transactions", async () => {
      const transactions = [{ transaction_id: 1, amount: 45.2 }];
      Transaction.getAll.mockResolvedValue(transactions);
      const res = mockRes();

      await transactionController.index({ userId: 1, query: {} }, res);

      expect(Transaction.getAll).toHaveBeenCalledWith(1, { type: undefined, categoryId: undefined });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(transactions);
    });

    it("passes the type and category filters to the model, with category as a number", async () => {
      Transaction.getAll.mockResolvedValue([]);
      const res = mockRes();

      await transactionController.index({ userId: 1, query: { type: "expense", category: "3" } }, res);

      expect(Transaction.getAll).toHaveBeenCalledWith(1, { type: "expense", categoryId: 3 });
    });

    it("responds 400 for an invalid type without calling the model", async () => {
      const res = mockRes();

      await transactionController.index({ userId: 1, query: { type: "banana" } }, res);

      expect(Transaction.getAll).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "type must be income or expense" });
    });

    it("responds 400 when the category is not a number", async () => {
      const res = mockRes();

      await transactionController.index({ userId: 1, query: { category: "abc" } }, res);

      expect(Transaction.getAll).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "category must be a number" });
    });

    it("responds 404 when the model throws", async () => {
      Transaction.getAll.mockRejectedValue(new Error("No transactions available"));
      const res = mockRes();

      await transactionController.index({ userId: 1, query: {} }, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "No transactions available" });
    });
  });

  describe("show", () => {
    it("responds 200 with the transaction", async () => {
      const transaction = { transaction_id: 1, amount: 45.2 };
      Transaction.getById.mockResolvedValue(transaction);
      const res = mockRes();

      await transactionController.show({ userId: 1, params: { id: "1" } }, res);

      expect(Transaction.getById).toHaveBeenCalledWith(1, 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(transaction);
    });

    it("responds 400 when the id is not a number", async () => {
      const res = mockRes();

      await transactionController.show({ userId: 1, params: { id: "abc" } }, res);

      expect(Transaction.getById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "id must be a number" });
    });

    it("responds 404 when the transaction does not exist", async () => {
      Transaction.getById.mockRejectedValue(new Error("Unable to locate transaction"));
      const res = mockRes();

      await transactionController.show({ userId: 1, params: { id: "999" } }, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Unable to locate transaction" });
    });
  });
});