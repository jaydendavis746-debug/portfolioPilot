import Transaction from "../models/transaction.js";
import Goal from "../models/goal.js";
const DEMO_USER_ID = 1

async function index(req, res) {
  try {
    const summary = await Transaction.getSummary(DEMO_USER_ID);

    const savings = summary.monthIncome - summary.monthExpenses;
    const savingsRate =
      summary.monthIncome > 0 ? Math.round((savings / summary.monthIncome) * 100) : 0;

    const recent = await Transaction.getAll(DEMO_USER_ID).catch(() => []);
    const goals = await Goal.getAll(DEMO_USER_ID).catch(() => []);

    res.status(200).json({
      balance: summary.balance,
      monthIncome: summary.monthIncome,
      monthExpenses: summary.monthExpenses,
      savingsRate,
      availableToInvest: Math.max(savings, 0),
      recentTransactions: recent.slice(0, 4),
      goals,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export default { index };