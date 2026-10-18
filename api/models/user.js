import db from "../db/connect.js";

class User {
  constructor({ user_id, name, email }) {
    this.user_id = user_id;
    this.name = name;
    this.email = email;
  }

  static async getAll() {
    const response = await db.query("SELECT * FROM users;");
    if (response.rows.length === 0) {
      throw new Error("No users available");
    }
    return response.rows.map((c) => new User(c));
  }

  static async getById(userId) {
    const response = await db.query(
      "SELECT user_id, name, email, created_at FROM users WHERE user_id = $1;",
      [userId],
    );
    if (response.rows.length !== 1) {
      throw new Error("Unable to locate user");
    }
    return new User(response.rows[0]);
  }

  static async getByEmail(email) {
    const response = await db.query("SELECT * FROM users WHERE email = $1;", [
      email.toLowerCase(),
    ]);
    if (response.rows.length !== 1) {
      throw new Error("Unable to locate user");
    }
    return response.rows[0]; // raw row, includes password_hash – only used for login
  }

  static async create({ name, email, password }) {
    const response = await db.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING user_id, name, email;`,
      [name, email.toLowerCase(), password],
    );
    return new User(response.rows[0]);
  }
}

export default User;
