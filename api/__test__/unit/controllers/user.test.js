import { jest } from "@jest/globals";


const User = Object.assign(
    jest.fn(function (data) {
        Object.assign(this, data);
    }),
    {
        getAll: jest.fn(),
        getById: jest.fn(),
        getByEmail: jest.fn(),
        create: jest.fn(),
    }
);
jest.unstable_mockModule("../../../models/user.js", () => ({ default: User }));

const bcrypt = { genSalt: jest.fn(), hash: jest.fn(), compare: jest.fn() };
jest.unstable_mockModule("bcrypt", () => ({ default: bcrypt }));

const jwt = { sign: jest.fn() };
jest.unstable_mockModule("jsonwebtoken", () => ({ default: jwt }));

const { default: userController } = await import("../../../controllers/user.js");

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("User controller", () => {
    beforeEach(() => jest.resetAllMocks());

    describe("show", () => {
        it("responds 200 with the user", async () => {
            const user = { user_id: 1, name: "Jayden", email: "jayden@example.com" };
            User.getById.mockResolvedValue(user);
            const res = mockRes();

            await userController.show({ params: { id: 1 } }, res);

            expect(User.getById).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(user);
        });

        it("responds 404 when the user does not exist", async () => {
            User.getById.mockRejectedValue(new Error("Unable to locate user"));
            const res = mockRes();

            await userController.show({ params: { id: 999 } }, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith({ error: "Unable to locate user" });
        });
    });

    describe("login", () => {
        it("responds 200 with a token and the user on valid credentials", async () => {
            User.getByEmail.mockResolvedValue({
                user_id: 1,
                name: "Jayden",
                email: "jayden@example.com",
                password_hash: "$2b$10$hashed",
            });
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue("token123");
            const res = mockRes();

            await userController.login(
                { body: { email: "jayden@example.com", password: "test123" } },
                res
            );

            expect(bcrypt.compare).toHaveBeenCalledWith("test123", "$2b$10$hashed");
            expect(jwt.sign).toHaveBeenCalledWith(
                { user_id: 1 },
                process.env.SECRET_TOKEN,
                { expiresIn: 7200 }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            const body = res.send.mock.calls[0][0];
            expect(body.success).toBe(true);
            expect(body.token).toBe("token123");
            expect(body.user).toBeInstanceOf(User);
        });

        it("responds 400 when email or password is missing", async () => {
            const res = mockRes();

            await userController.login({ body: { email: "jayden@example.com" } }, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ error: "Missing email or password" });
        });

        it("responds 401 when the email is unknown", async () => {
            User.getByEmail.mockRejectedValue(new Error("not found"));
            const res = mockRes();

            await userController.login(
                { body: { email: "nobody@example.com", password: "test123" } },
                res
            );

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.send).toHaveBeenCalledWith({ error: "Invalid email or password" });
        });

        it("responds 401 when the password is wrong", async () => {
            User.getByEmail.mockResolvedValue({
                user_id: 1,
                password_hash: "$2b$10$hashed",
            });
            bcrypt.compare.mockResolvedValue(false);
            const res = mockRes();

            await userController.login(
                { body: { email: "jayden@example.com", password: "wrong" } },
                res
            );

            expect(res.status).toHaveBeenCalledWith(401);
            expect(jwt.sign).not.toHaveBeenCalled();
        });
    });

    describe("register", () => {
        it("responds 201 with a token after hashing the password", async () => {
            User.getByEmail.mockRejectedValue(new Error("not found"));
            bcrypt.genSalt.mockResolvedValue("salt");
            bcrypt.hash.mockResolvedValue("$2b$10$hashed");
            User.create.mockResolvedValue({ user_id: 2, name: "Test" });
            jwt.sign.mockReturnValue("token123");
            const res = mockRes();

            await userController.register(
                { body: { name: "Test", email: "t@t.com", password: "secret1" } },
                res
            );

            expect(bcrypt.hash).toHaveBeenCalledWith("secret1", "salt");
            expect(User.create).toHaveBeenCalledWith({
                name: "Test",
                email: "t@t.com",
                password: "$2b$10$hashed",
            });
            expect(res.status).toHaveBeenCalledWith(201);
            const body = res.send.mock.calls[0][0];
            expect(body.success).toBe(true);
            expect(body.token).toBe("token123");
        });

        it("responds 409 when the email is already registered", async () => {
            User.getByEmail.mockResolvedValue({ user_id: 1 });
            const res = mockRes();

            await userController.register(
                { body: { name: "Test", email: "t@t.com", password: "secret1" } },
                res
            );

            expect(res.status).toHaveBeenCalledWith(409);
            expect(User.create).not.toHaveBeenCalled();
        });

        it("responds 400 when name, email or password is missing", async () => {
            const res = mockRes();

            await userController.register({ body: { name: "Test" } }, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });
});
