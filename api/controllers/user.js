import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

async function index(req, res) {
    try {
        const users = await User.getAll();
        res.status(200).send(users);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
}

async function show(req, res) {
    try {
        const user = await User.getById(req.params.id);
        res.status(200).send(user);
    } catch (err) {
        res.status(404).send({ error: err.message });
    }
}

async function login(req, res) {
    try {
        const data = req.body;

        if (!data.email || !data.password) {
            return res.status(400).send({ error: "Missing email or password" });
        }

        let user;
        try {
            user = await User.getByEmail(data.email);
        } catch {
            return res.status(401).send({ error: "Invalid email or password" });
        }

        const match = await bcrypt.compare(data.password, user.password_hash);
        if (!match) {
            return res.status(401).send({ error: "Invalid email or password" });
        }

        const payload = { user_id: user.user_id };
        const token = jwt.sign(payload, process.env.SECRET_TOKEN, { expiresIn: 7200 });

        res.status(200).send({
            success: true,
            token: token,
            user: new User(user),
        });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
}

async function register(req, res) {
    try {
        const data = req.body;

        if (!data.name || !data.email || !data.password) {
            return res.status(400).send({ error: "Missing name, email or password" });
        }

        try {
            await User.getByEmail(data.email);
            return res.status(409).send({ error: "Email already registered" });
        } catch {
           
        }

        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS));
        data.password = await bcrypt.hash(data.password, salt);

        const newUser = await User.create(data);
        const token = jwt.sign({ user_id: newUser.user_id }, process.env.SECRET_TOKEN, { expiresIn: 7200 });

        res.status(201).send({ success: true, token: token, user: newUser });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
}

export default { index, show, login, register };
