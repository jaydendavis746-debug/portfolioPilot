import db from "../db/connect.js";

const SELECT_SQL = `
  SELECT g.goal_id, g.name, g.goal_type, g.target_amount, g.target_date,
         COALESCE(SUM(gc.amount), 0) AS saved
  FROM goals g
  LEFT JOIN goal_contributions gc ON gc.goal_id = g.goal_id`;

class Goal {
  constructor({ goal_id, name, goal_type, target_amount, target_date, saved }) {
    this.goal_id = goal_id;
    this.name = name;
    this.goal_type = goal_type;
    this.target_amount = Number(target_amount);
    this.target_date = target_date;
    this.saved = Number(saved);
    this.remaining = Math.max(this.target_amount - this.saved, 0);
    this.percent = Math.min(
      Math.round((this.saved / this.target_amount) * 100),
      100,
    );
  }

  static async getAll(userId) {
    const response = await db.query(
      `${SELECT_SQL} WHERE g.user_id = $1 GROUP BY g.goal_id ORDER BY g.created_at;`,
      [userId],
    );
    if (response.rows.length === 0) {
      throw new Error("No goals available");
    }
    return response.rows.map((g) => new Goal(g));
  }

  static async getById(goalId, userId) {
    const response = await db.query(
      `${SELECT_SQL} WHERE g.goal_id = $1 AND g.user_id = $2 GROUP BY g.goal_id;`,
      [goalId, userId],
    );
    if (response.rows.length !== 1) {
      throw new Error("Unable to locate goal");
    }
    return new Goal(response.rows[0]);
  }
}

export default Goal;
