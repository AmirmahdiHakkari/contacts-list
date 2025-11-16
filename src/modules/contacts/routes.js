import express from "express";
import { validate } from "../../middlewares/validate.js";
import {
  contactList,
  createContact,
  updateContact,
  deleteContact,
  getContactById,
} from "./controller.js";
import {
  createContactSchema,
  updateContactSchema,
} from "../../models/contact.models.js";

export const router = express.Router();

router.get("/", contactList);
router.get("/:id", getContactById);
router.post("/", validate(createContactSchema), createContact);
router.patch("/:id", validate(updateContactSchema), updateContact);
router.delete("/:id", deleteContact);
