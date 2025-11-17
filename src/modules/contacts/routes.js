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

/**
 * @swagger
 * tags:
 *   name: Contacts
 *   description: User contacts management
 */

/**
 * @swagger
 * /contact:
 *   get:
 *     summary: Get contacts of the authenticated user
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *       - in: query
 *         name: phone
 *         schema:
 *           type: string
 *           example: 0912
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *           example: 09
 *     responses:
 *       200:
 *         description: Paginated list of contacts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Contact'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         description: Unauthorized (missing or invalid token)
 */
router.get("/", contactList);

/**
 * @swagger
 * /contact:
 *   post:
 *     summary: Create a new contact for the authenticated user
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactCreate'
 *     responses:
 *       201:
 *         description: Contact created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: مخاطب با موفقیت ثبت شد
 *                 contact:
 *                   $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Duplicate name or phone
 */
router.post("/", validate(createContactSchema), createContact);

/**
 * @swagger
 * /contact/{id}:
 *   get:
 *     summary: Get a single contact by public_id (only if it belongs to the authenticated user)
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Contact public_id
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Contact details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contact'
 *       404:
 *         description: Contact not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:id", getContactById);

/**
 * @swagger
 * /contact/{id}:
 *   patch:
 *     summary: Update a contact (only if it belongs to the authenticated user)
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Contact public_id
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ali Updated
 *               phone:
 *                 type: string
 *                 example: 09121234567
 *     responses:
 *       200:
 *         description: Contact updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Contact not found
 *       401:
 *         description: Unauthorized
 */
router.patch("/:id", validate(updateContactSchema), updateContact);

/**
 * @swagger
 * /contact/{id}:
 *   delete:
 *     summary: Delete a contact (only if it belongs to the authenticated user)
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Contact public_id
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Contact deleted
 *       404:
 *         description: Contact not found
 *       401:
 *         description: Unauthorized
 */
router.delete("/:id", deleteContact);
