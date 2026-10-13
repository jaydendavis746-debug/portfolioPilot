import { jest } from "@jest/globals";

const Category = { getAll: jest.fn() };
jest.unstable_mockModule("../../../models/category.js", () => ({ default: Category }));

const { default: categoryController } = await import("../../../controllers/category.js");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Category controller", () => {
  beforeEach(() => jest.resetAllMocks());

  describe("index", () => {
    it("responds 200 with the categories", async () => {
      const categories = [{ category_id: 1, name: "Food & Drink", type: "expense" }];
      Category.getAll.mockResolvedValue(categories);
      const res = mockRes();

      await categoryController.index({ userId: 1, query: {} }, res);

      expect(Category.getAll).toHaveBeenCalledWith(undefined);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(categories);
    });

    it("passes the type filter to the model", async () => {
      Category.getAll.mockResolvedValue([]);
      const res = mockRes();

      await categoryController.index({ userId: 1, query: { type: "income" } }, res);

      expect(Category.getAll).toHaveBeenCalledWith("income");
    });

    it("responds 400 for an invalid type without calling the model", async () => {
      const res = mockRes();

      await categoryController.index({ userId: 1, query: { type: "banana" } }, res);

      expect(Category.getAll).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "type must be income or expense" });
    });

    it("responds 404 when the model throws", async () => {
      Category.getAll.mockRejectedValue(new Error("No categories available"));
      const res = mockRes();

      await categoryController.index({ userId: 1, query: {} }, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "No categories available" });
    });
  });
});