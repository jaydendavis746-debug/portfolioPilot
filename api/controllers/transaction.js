import Transaction from "../models/transaction.js";

const DEMO_USER_ID = 1

async function index(req, res) {
  try {
    const { type, category } = req.query;
    if (type && !["income", "expense"].includes(type)) {
      return res.status(400).json({ error: "type must be income or expense" });
    }

    const categoryId = category ? Number(category) : undefined;
    if (category && Number.isNaN(categoryId)) {
      return res.status(400).json({ error: "category must be a number" });
    }

    const transactions = await Transaction.getAll(DEMO_USER_ID, { type, categoryId });
    res.status(200).json(transactions);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

async function show(req, res) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "id must be a number" });
    }
    const transaction = await Transaction.getById(id, DEMO_USER_ID);
    res.status(200).json(transaction);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

export default { index, show };