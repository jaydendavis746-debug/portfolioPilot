import { jest } from "@jest/globals";

const query = jest.fn();
jest.unstable_mockModule("../../../db/connect.js", () => ({ default: { query } }));

const { default: Goal } = await import("../../../models/goal.js");

// A full row as pg returns it: NUMERIC columns arrive as strings
const row = {
    goal_id: 1,
    name: "Emergency Fund",
    goal_type: "savings",
    target_amount: "5000.00",
    target_date: "2027-06-01",
    saved: "2500.00",
};

describe("Goal Model", () => {
    beforeEach(() => query.mockReset());

    describe("constructor", () => {
        it("converts the amounts to numbers", () => {
            const goal = new Goal(row);

            expect(goal.target_amount).toBe(5000);
            expect(goal.saved).toBe(2500);
            expect(typeof goal.saved).toBe("number");
        });

        it("calculates the remaining amount and percentage", () => {
            const goal = new Goal(row);

            expect(goal.remaining).toBe(2500);
            expect(goal.percent).toBe(50);
        });

        it("rounds the percentage to a whole number", () => {
            const goal = new Goal({ ...row, target_amount: "3", saved: "1" });

            expect(goal.percent).toBe(33);
        });

        it("shows 0% and the full target for a goal with no contributions", () => {
            const goal = new Goal({ ...row, saved: "0" });

            expect(goal.percent).toBe(0);
            expect(goal.remaining).toBe(5000);
        });

        it("caps an over-funded goal at 100% with nothing remaining", () => {
            const goal = new Goal({ ...row, saved: "6000.00" });

            expect(goal.percent).toBe(100);
            expect(goal.remaining).toBe(0);
        });
    });

    describe("getAll", () => {
        it("returns all goals for the user", async () => {
            query.mockResolvedValue({
                rows: [
                    row,
                    { ...row, goal_id: 2, name: "First ETF", goal_type: "investment" },
                ],
            });

            const result = await Goal.getAll(1);

            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(Goal);
            expect(result[1].goal_type).toBe("investment");
        });

        it("queries by the user id", async () => {
            query.mockResolvedValue({ rows: [row] });

            await Goal.getAll(1);

            const [sql, params] = query.mock.calls[0];
            expect(sql).toContain("g.user_id = $1");
            expect(params).toEqual([1]);
        });

        it("throws when the user has no goals", async () => {
            query.mockResolvedValue({ rows: [] });

            await expect(Goal.getAll(1)).rejects.toThrow("No goals available");
        });
    });

    describe("getById", () => {
        it("returns the matching goal", async () => {
            query.mockResolvedValue({ rows: [row] });

            const result = await Goal.getById(1, 1);

            expect(result).toBeInstanceOf(Goal);
            expect(result.name).toBe("Emergency Fund");
        });

        it("queries by both the goal id and the user id", async () => {
            query.mockResolvedValue({ rows: [row] });

            await Goal.getById(1, 1);

            expect(query.mock.calls[0][1]).toEqual([1, 1]);
        });

        it("throws when no goal matches", async () => {
            query.mockResolvedValue({ rows: [] });

            await expect(Goal.getById(999, 1)).rejects.toThrow("Unable to locate goal");
        });
    });
});