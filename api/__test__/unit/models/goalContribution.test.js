import { jest } from "@jest/globals";

const query = jest.fn();
jest.unstable_mockModule("../../../db/connect.js", () => ({ default: { query } }));

const { default: GoalContribution } = await import("../../../models/goalContribution.js");

describe("GoalContribution model", () => {
  beforeEach(() => query.mockReset());

  describe("getByGoalId", () => {
    it("returns GoalContribution instances with numeric amounts", async () => {
      query.mockResolvedValue({
        rows: [
          { contribution_id: 3, goal_id: 3, amount: "500.00", contribution_date: "2026-10-06" },
          { contribution_id: 2, goal_id: 3, amount: "1000.00", contribution_date: "2026-08-09" },
        ],
      });

      const result = await GoalContribution.getByGoalId(3);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(GoalContribution);
      expect(result[0].amount).toBe(500);
      expect(typeof result[0].amount).toBe("number");
    });

    it("queries by the goal id", async () => {
      query.mockResolvedValue({
        rows: [{ contribution_id: 1, goal_id: 3, amount: "500.00", contribution_date: "2026-10-06" }],
      });

      await GoalContribution.getByGoalId(3);

      expect(query.mock.calls[0][1]).toEqual([3]);
    });

    it("throws when the goal has no contributions", async () => {
      query.mockResolvedValue({ rows: [] });

      await expect(GoalContribution.getByGoalId(3)).rejects.toThrow("No contributions available");
    });
  });
});