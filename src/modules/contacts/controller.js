import { v4 as uuidv4 } from "uuid";
import { query } from "../../config/db.js";

const UNIQUE_CONSTRAINTS = {
  NAME: "unique_contact_name",
  PHONE: "unique_contact_phone",
};

function handleUniqueConstraintError(error, res) {
  if (error.code !== "23505") {
    return false;
  }

  const constraint = error.constraint;

  if (constraint === UNIQUE_CONSTRAINTS.NAME) {
    res.status(409).json({
      message: "مخاطبی با این نام قبلاً ثبت شده است",
      errors: [{ field: "name", message: "نام مخاطب تکراری است" }],
    });
    return true;
  }

  if (constraint === UNIQUE_CONSTRAINTS.PHONE) {
    res.status(409).json({
      message: "مخاطبی با این شماره تلفن قبلاً ثبت شده است",
      errors: [{ field: "phone", message: "شماره مخاطب تکراری است" }],
    });
    return true;
  }

  return false;
}

export async function contactList(req, res) {
  try {
    let { page = 1, limit = 10, name, phone, q } = req.query;

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (Number.isNaN(page) || page < 1) page = 1;
    if (Number.isNaN(limit) || limit < 1) limit = 10;
    if (limit > 100) limit = 100;

    const offset = (page - 1) * limit;

    const conditions = [];
    const values = [];
    let index = 1;

    if (name) {
      conditions.push(`name ILIKE $${index}`);
      values.push(`%${name}%`);
      index += 1;
    }

    if (phone) {
      conditions.push(`phone ILIKE $${index}`);
      values.push(`%${phone}%`);
      index += 1;
    }

    if (q) {
      conditions.push(`(name ILIKE $${index} OR phone ILIKE $${index})`);
      values.push(`%${q}%`);
      index += 1;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM contacts
      ${whereClause};
    `;
    const countResult = await query(countQuery, values);
    const total = parseInt(countResult.rows[0].total, 10);
    const totalPages = Math.ceil(total / limit) || 1;

    const dataQuery = `
      SELECT *
      FROM contacts
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${index} OFFSET $${index + 1};
    `;
    const dataValues = [...values, limit, offset];

    const dataResult = await query(dataQuery, dataValues);

    return res.json({
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error in contactList:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getContactById(req, res) {
  const { id } = req.params;
  const publicId = id.trim();

  try {
    const result = await query(
      "SELECT * FROM contacts WHERE public_id = $1",
      [publicId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "مخاطب پیدا نشد" });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Error in getContactById:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function createContact(req, res) {
  const { name, phone } = req.body;
  const publicId = uuidv4();

  try {
    const insertQuery = `
      INSERT INTO contacts (public_id, name, phone)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [publicId, name, phone];

    const result = await query(insertQuery, values);

    return res.status(201).json({
      message: "مخاطب با موفقیت ثبت شد",
      contact: result.rows[0],
    });
  } catch (error) {
    console.error("Error in createContact:", error);

    if (handleUniqueConstraintError(error, res)) {
      return;
    }

    return res.status(500).json({ message: "Server error" });
  }
}

export async function updateContact(req, res) {
  const { id } = req.params;
  const publicId = id.trim();
  const { name, phone } = req.body;

  const fields = [];
  const values = [];
  let index = 1;

  if (typeof name !== "undefined") {
    fields.push(`name = $${index}`);
    values.push(name);
    index += 1;
  }

  if (typeof phone !== "undefined") {
    fields.push(`phone = $${index}`);
    values.push(phone);
    index += 1;
  }

  if (fields.length === 0) {
    return res.status(400).json({
      message: "هیچ فیلدی برای بروزرسانی ارسال نشده است",
    });
  }

  values.push(publicId);

  const updateQuery = `
    UPDATE contacts
    SET ${fields.join(", ")}
    WHERE public_id = $${index}
    RETURNING *;
  `;

  try {
    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "مخاطب پیدا نشد" });
    }

    return res.status(200).json({
      message: "مخاطب بروزرسانی شد",
      contact: result.rows[0],
    });
  } catch (error) {
    console.error("Error in updateContact:", error);

    if (handleUniqueConstraintError(error, res)) {
      return;
    }

    return res.status(500).json({ message: "Server error" });
  }
}

export async function deleteContact(req, res) {
  const { id } = req.params;
  const publicId = id.trim();

  try {
    const result = await query(
      "DELETE FROM contacts WHERE public_id = $1 RETURNING *;",
      [publicId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "مخاطب پیدا نشد" });
    }

    return res.status(200).json({
      message: "مخاطب با موفقیت حذف شد",
      contact: result.rows[0],
    });
  } catch (error) {
    console.error("Error in deleteContact:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
