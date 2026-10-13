import { jest } from "@jest/globals";

const User = { getById: jest.fn() };
jest.unstable_mockModule("../../../models/user.js", () => ({ default: User }));

const { default: userController } = await import("../../../controllers/user.js");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("User controller", () => {
  beforeEach(() => jest.resetAllMocks());

  describe("me", () => {
    it("responds 200 with the current user", async () => {
      const user = { user_id: 1, name: "Jayden", email: "jayden@example.com" };
      User.getById.mockResolvedValue(user);
      const res = mockRes();

      await userController.me({ userId: 1 }, res);

      expect(User.getById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(user);
    });

    it("looks the user up by the id set on the request", async () => {
      User.getById.mockResolvedValue({ user_id: 7 });
      const res = mockRes();

      await userController.me({ userId: 7 }, res);

      expect(User.getById).toHaveBeenCalledWith(7);
    });

    it("responds 404 when the user does not exist", async () => {
      User.getById.mockRejectedValue(new Error("Unable to locate user"));
      const res = mockRes();

      await userController.me({ userId: 999 }, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Unable to locate user" });
    });
  });
});