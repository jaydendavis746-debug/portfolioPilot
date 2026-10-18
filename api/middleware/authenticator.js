import jwt from "jsonwebtoken";

function authenticator(req, res, next) {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(401).send({ error: "Missing token" });
    }


    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.SECRET_TOKEN, (err, data) => {
        if (err) {
            return res.status(403).send({ error: "Invalid token" });
        }

        req.userId = data.user_id; 
        next();
    });
}

export default authenticator;
