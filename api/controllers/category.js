import Category from "../models/category.js";

async function index(req, res) {
  try {
    const { type } = req.query;
    if (type && !["income", "expense"].includes(type)) {
      return res.status(400).json({ error: "type must be income or expense" });
    }
    const categories = await Category.getAll(type);
    res.status(200).json(categories);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

export default { index };