import { describe, expect, it, mock } from "bun:test";
import { AuthService } from "../../auth/authService";
import { eq } from "drizzle-orm";
import { db } from "../../config/database";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import bcrypt from "bcrypt";

mock.module("bcrypt", () => ({
  hash: mock(() => Promise.resolve("hashedPassword")),
  compare: mock(() => Promise.resolve(true))
}));

describe("AuthService", () => {
  describe("login", () => {
    it("should return success response when login is successful", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        password: "hashedPassword",
        name: "Test User"
      };

      mock.module("../../config/database", () => ({
        db: {
          select: () => ({
            from: () => ({
              where: () => ({
                limit: () => Promise.resolve([mockUser])
              })
            })
          })
        }
      }));

      const result = await AuthService.login("test@example.com", "password");

      expect(result).toEqual({
        status: 200,
          data: {
              token: expect.any(String),
              user: {
                  name: mockUser.name,
                  createdAt: expect.any(Date),
                  updatedAt: expect.any(Date),
                  id: mockUser.id,
                  email: mockUser.email,
              }
          }
      });
    });

    it("should return error when user is not found", async () => {
      mock.module("../../config/database", () => ({
        db: {
          select: () => ({
            from: () => ({
              where: () => ({
                limit: () => Promise.resolve([])
              })
            })
          })
        }
      }));

      const result = await AuthService.login("nonexistent@example.com", "password");

      expect(result).toEqual({
        status: 401,
        error: "Invalid credentials"
      });
    });

    it("should return error when password is incorrect", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        password: "hashedPassword",
        name: "Test User"
      };

      mock.module("../../config/database", () => ({
        db: {
          select: () => ({
            from: () => ({
              where: () => ({
                limit: () => Promise.resolve([mockUser])
              })
            })
          })
        }
      }));

      mock.module("bcrypt", () => ({
        compare: mock(() => Promise.resolve(false))
      }));

      const result = await AuthService.login("test@example.com", "wrongpassword");

      expect(result).toEqual({
        status: 401,
        error: "Invalid credentials"
      });
    });
  });

  describe("register", () => {
    it("should return success response when registration is successful", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        password: "hashedPassword",
        name: "Test User"
      };

      mock.module("../../config/database", () => ({
        db: {
          select: () => ({
            from: () => ({
              where: () => ({
                limit: () => Promise.resolve([])
              })
            })
          }),
          insert: () => ({
            values: () => ({
              returning: () => Promise.resolve([mockUser])
            })
          })
        }
      }));

      const result = await AuthService.register({
        name: "Test User",
        email: "test@example.com",
        password: "password"
      });

      expect(result).toEqual({
        status: 201,
        data: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          createdAt: null,
          updatedAt: null
        }
      });
    });

    it("should return error when user already exists", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        password: "hashedPassword",
        name: "Test User"
      };

      mock.module("../../config/database", () => ({
        db: {
          select: () => ({
            from: () => ({
              where: () => ({
                limit: () => Promise.resolve([mockUser])
              })
            })
          })
        }
      }));

      const result = await AuthService.register({
        name: "Test User",
        email: "test@example.com",
        password: "password"
      });

      expect(result).toEqual({
        status: 409,
        error: "Email already registered"
      });
    });
  });
});
