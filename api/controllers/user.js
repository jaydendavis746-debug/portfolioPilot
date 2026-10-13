
import User from "../models/user.js";

async function me(req, res) {
  try {
    const user = await User.getById(req.userId);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

export default { me };