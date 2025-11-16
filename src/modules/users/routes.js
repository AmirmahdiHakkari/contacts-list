import express from "express";
import { validate } from "../../middlewares/validate.js";
import { userList, login, register } from "./controller.js";
import {
  registerUserSchema,
  loginUserSchema,
} from "../../models/user.models.js";

export const router = express.Router();

router.get("/users", userList);

router.post("/register", validate(registerUserSchema), register);

router.post("/login", validate(loginUserSchema), login);
