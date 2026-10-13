import { jest } from "@jest/globals";

const query = jest.fn();
jest.unstable_mockModule("../../../db/connect.js", () => ({ default: { query } }));

const { default: User } = await import("../../../models/user.js");


const row = {
  user_id: 1,
  name: "Jayden",
  email: "jayden@example.com",
  password_hash: "not-a-real-hash",
  created_at: "2026-10-01T09:00:00.000Z",
};

describe("User model", () => {
  beforeEach(() => query.mockReset());

  describe("constructor", () => {
    it("copies the user's details", () => {
      const user = new User(row);

      expect(user.user_id).toBe(1);
      expect(user.name).toBe("Jayden");
      expect(user.email).toBe("jayden@example.com");
    });

    it("does not pick up the password hash from the database row", () => {
      const user = new User(row);

      expect(user.password).toBeUndefined();
      expect(user).not.toHaveProperty("password_hash");
    });
  });

  describe("getAll", () => {
    it("returns User instances", async () => {
      query.mockResolvedValue({ rows: [row, { ...row, user_id: 2, name: "Sam" }] });

      const result = await User.getAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(User);
      expect(result[1].name).toBe("Sam");
    });

    it("throws when there are no users", async () => {
      query.mockResolvedValue({ rows: [] });

      await expect(User.getAll()).rejects.toThrow("No users available");
    });
  });

  describe("getById", () => {
    it("returns the matching user", async () => {
      query.mockResolvedValue({ rows: [row] });

      const result = await User.getById(1);

      expect(result).toBeInstanceOf(User);
      expect(result.email).toBe("jayden@example.com");
      expect(query.mock.calls[0][1]).toEqual([1]);
    });

    it("never selects the password hash", async () => {
      query.mockResolvedValue({ rows: [row] });

      await User.getById(1);

      expect(query.mock.calls[0][0]).not.toContain("password");
    });

    it("throws when no user matches", async () => {
      query.mockResolvedValue({ rows: [] });

      await expect(User.getById(999)).rejects.toThrow("Unable to locate user");
    });
  });
});