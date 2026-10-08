import db from "../db/connect.js";

const SELECT_SQL = `
  SELECT t.transaction_id, t.type, t.amount, t.description,
         t.transaction_date, c.category_id, c.name AS category
  FROM transactions t
  JOIN categories c ON c.category_id = t.category_id`;

class Transaction {
  constructor({ transaction_id, type, amount, description, transaction_date, category_id, category }) {
    this.transaction_id = transaction_id;
    this.type = type;
    this.amount = Number(amount); 
    this.description = description;
    this.transaction_date = transaction_date;
    this.category_id = category_id;
    this.category = category;
  }

  static async getAll(userId, { type, categoryId } = {}) {
    const params = [userId];
    let sql = `${SELECT_SQL} WHERE t.user_id = $1`;

    if (type) {
      params.push(type);
      sql += ` AND t.type = $${params.length}`;
    }
    if (categoryId) {
      params.push(categoryId);
      sql += ` AND t.category_id = $${params.length}`;
    }

    const response = await db.query(
      sql + " ORDER BY t.transaction_date DESC, t.transaction_id DESC;",
      params
    );
    if (response.rows.length === 0) {
      throw new Error("No transactions available");
    }
    return response.rows.map((t) => new Transaction(t));
  }

  static async getById(transactionId, userId) {
    const response = await db.query(
      `${SELECT_SQL} WHERE t.transaction_id = $1 AND t.user_id = $2;`,
      [transactionId, userId]
    );
    if (response.rows.length !== 1) {
      throw new Error("Unable to locate transaction");
    }
    return new Transaction(response.rows[0]);
  }


  static async getSummary(userId) {
    const response = await db.query(
      `SELECT
         COALESCE(SUM(amount) FILTER (WHERE type = 'income'), 0) AS total_income,
         COALESCE(SUM(amount) FILTER (WHERE type = 'expense'), 0) AS total_expenses,
         COALESCE(SUM(amount) FILTER (
           WHERE type = 'income'
           AND transaction_date >= date_trunc('month', CURRENT_DATE)), 0) AS month_income,
         COALESCE(SUM(amount) FILTER (
           WHERE type = 'expense'
           AND transaction_date >= date_trunc('month', CURRENT_DATE)), 0) AS month_expenses
       FROM transactions
       WHERE user_id = $1;`,
      [userId]
    );
    const r = response.rows[0];
    return {
      balance: Number(r.total_income) - Number(r.total_expenses),
      monthIncome: Number(r.month_income),
      monthExpenses: Number(r.month_expenses),
    };
  }
}

export default Transaction;