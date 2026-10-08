import db from "../db/connect.js";

class User {
    constructor({ user_id, name, password, email }) {
        this.user_id = user_id;
        this.name = name;
        this.password = password;
        this.email = email;
    }

    static async getAll() {
    const response = await db.query("SELECT * FROM users;");
    if (response.rows.length === 0) {
      throw new Error("No users available");
    }
    return response.rows.map((c) => new User(c));
    }
}