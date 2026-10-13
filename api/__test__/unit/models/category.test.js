import { jest } from "@jest/globals";

const query = jest.fn();
jest.unstable_mockModule("../../../db/connect.js", () => ({ default: { query } }));

const { default: Category } = await import("../../../models/category.js");

describe("Category model", () => {
  beforeEach(() => query.mockReset());

  describe("getAll", () => {
    it("returns Category instances", async () => {
      query.mockResolvedValue({
        rows: [{ category_id: 1, name: "Food & Drink", type: "expense" }],
      });

      const result = await Category.getAll();

      expect(result[0]).toBeInstanceOf(Category);
      expect(result[0].name).toBe("Food & Drink");
      expect(result[0].type).toBe("expense")
      expect(result.length).toBe(1)
    });
  });
});