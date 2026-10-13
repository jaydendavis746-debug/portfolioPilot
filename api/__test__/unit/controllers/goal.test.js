import { jest } from "@jest/globals";

const Goal = { getAll: jest.fn(), getById: jest.fn() };
const GoalContribution = { getByGoalId: jest.fn() };
jest.unstable_mockModule("../../../models/goal.js", () => ({ default: Goal }));
jest.unstable_mockModule("../../../models/goalContribution.js", () => ({ default: GoalContribution }));

const { default: goalController } = await import("../../../controllers/goal.js");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Goal controller", () => {
  beforeEach(() => jest.resetAllMocks());

  describe("index", () => {
    it("responds 200 with the goals", async () => {
      const goals = [{ goal_id: 1, name: "Emergency Fund" }];
      Goal.getAll.mockResolvedValue(goals);
      const res = mockRes();

      await goalController.index({ userId: 1 }, res);

      expect(Goal.getAll).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(goals);
    });

    it("responds 404 when the model throws", async () => {
      Goal.getAll.mockRejectedValue(new Error("No goals available"));
      const res = mockRes();

      await goalController.index({ userId: 1 }, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "No goals available" });
    });
  });

  describe("show", () => {
    it("responds 200 with the goal and its contributions", async () => {
      const contributions = [{ contribution_id: 1, amount: 500 }];
      Goal.getById.mockResolvedValue({ goal_id: 3, name: "House Deposit" });
      GoalContribution.getByGoalId.mockResolvedValue(contributions);
      const res = mockRes();

      await goalController.show({ userId: 1, params: { id: "3" } }, res);

      expect(Goal.getById).toHaveBeenCalledWith(3, 1);
      expect(GoalContribution.getByGoalId).toHaveBeenCalledWith(3);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ goal_id: 3, name: "House Deposit", contributions });
    });

    it("returns an empty contributions list instead of an error when there are none", async () => {
      Goal.getById.mockResolvedValue({ goal_id: 4, name: "First ETF" });
      GoalContribution.getByGoalId.mockRejectedValue(new Error("No contributions available"));
      const res = mockRes();

      await goalController.show({ userId: 1, params: { id: "4" } }, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ goal_id: 4, name: "First ETF", contributions: [] });
    });

    it("responds 400 when the id is not a number", async () => {
      const res = mockRes();

      await goalController.show({ userId: 1, params: { id: "abc" } }, res);

      expect(Goal.getById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "id must be a number" });
    });

    it("responds 404 when the goal does not exist", async () => {
      Goal.getById.mockRejectedValue(new Error("Unable to locate goal"));
      const res = mockRes();

      await goalController.show({ userId: 1, params: { id: "999" } }, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Unable to locate goal" });
    });
  });
});