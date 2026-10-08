import db from "../db/connect.js";

class GoalContribution {
  constructor({ contribution_id, goal_id, amount, contribution_date }) {
    this.contribution_id = contribution_id;
    this.goal_id = goal_id;
    this.amount = Number(amount);
    this.contribution_date = contribution_date;
  }

  static async getByGoalId(goalId) {
    const response = await db.query(
      `SELECT * FROM goal_contributions
       WHERE goal_id = $1
       ORDER BY contribution_date DESC, contribution_id DESC;`,
      [goalId]
    );
    if (response.rows.length === 0) {
      throw new Error("No contributions available");
    }
    return response.rows.map((c) => new GoalContribution(c));
  }
}

export default GoalContribution;