import Goal from "../models/goal.js";
import GoalContribution from "../models/goalContribution.js";
const DEMO_USER_ID = 1;

async function index(req, res) {
  try {
    const goals = await Goal.getAll(DEMO_USER_ID);
    res.status(200).json(goals);
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
    const goal = await Goal.getById(id, DEMO_USER_ID);

    const contributions = await GoalContribution.getByGoalId(id).catch(
      () => [],
    );

    res.status(200).json({ ...goal, contributions });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

export default { index, show };
