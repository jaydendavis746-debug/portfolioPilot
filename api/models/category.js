import db from "../db/connect.js";

class Category {
  constructor({ category_id, name, type }) {
    this.category_id = category_id;
    this.name = name;
    this.type = type;
  }

  static async getAll(type) {
    const params = [];
    let sql = "SELECT * FROM categories";

    if (type) {
      params.push(type);
      sql += " WHERE type = $1";
    }

    const response = await db.query(sql + " ORDER BY type, name;", params);
    if (response.rows.length === 0) {
      throw new Error("No categories available");
    }
    return response.rows.map((c) => new Category(c));
  }
}

export default Category;