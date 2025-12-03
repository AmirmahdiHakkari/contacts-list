import { v4 as uuidv4 } from "uuid";
import { query } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";

const UNIQUE_CONSTRAINTS = {
  NAME: "unique_contact_name",
  PHONE: "unique_contact_phone",
};

function mapContactUniqueConstraintError(error) {
  if (error.code !== "23505") return null;

  const constraint = error.constraint;

  if (constraint === UNIQUE_CONSTRAINTS.NAME) {
    return new AppError(409, "مخاطبی با این نام قبلاً ثبت شده است", {
      errors: [{ field: "name", message: "نام مخاطب تکراری است" }],
      isOperational: true,
    });
  }

  if (constraint === UNIQUE_CONSTRAINTS.PHONE) {
    return new AppError(409, "مخاطبی با این شماره تلفن قبلاً ثبت شده است", {
      errors: [{ field: "phone", message: "شماره مخاطب تکراری است" }],
      isOperational: true,
    });
  }

  return new AppError(409, "رکورد تکراری است", {
    isOperational: true,
  });
}

export async function contactList(req, res, next) {
  try {
    const userId = req.user.id;

    let { page = 1, limit = 10, name, phone, q } = req.query;

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (Number.isNaN(page) || page < 1) page = 1;
    if (Number.isNaN(limit) || limit < 1) limit = 10;
    if (limit > 100) limit = 100;

    const offset = (page - 1) * limit;

    const conditions = ["user_id = $1"];
    const values = [userId];
    let index = 2;

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

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM contacts
      ${whereClause};
    `;
    const countResult = await query(countQuery, values);
    const total = parseInt(countResult.rows[0].total, 10);
    const totalPages = Math.ceil(total / limit);

    const dataQuery = `
      SELECT id, public_id, name, phone, created_at
      FROM contacts
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${index}
      OFFSET $${index + 1};
    `;

    const dataValues = [...values, limit, offset];
    const dataResult = await query(dataQuery, dataValues);

    return res.status(200).json({
      message: "لیست مخاطبین با موفقیت دریافت شد",
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    req.log.error("Error in contactList", { err: error });

    return next(error);
  }
}

export async function getContactById(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const selectQuery = `
      SELECT id, public_id, name, phone, created_at
      FROM contacts
      WHERE public_id = $1 AND user_id = $2
      LIMIT 1;
    `;
    const result = await query(selectQuery, [id, userId]);

    if (result.rows.length === 0) {
      return next(
        new AppError(404, "مخاطب پیدا نشد", {
          isOperational: true,
        })
      );
    }

    return res.status(200).json({
      message: "مخاطب با موفقیت پیدا شد",
      contact: result.rows[0],
    });
  } catch (error) {
    req.log.error("Error in getContactById", { err: error });

    return next(error);
  }
}

export async function createContact(req, res, next) {
  try {
    const userId = req.user.id;
    const { name, phone } = req.body;

    const publicId = uuidv4();

    const insertQuery = `
      INSERT INTO contacts (public_id, name, phone, user_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, public_id, name, phone, created_at;
    `;

    const result = await query(insertQuery, [publicId, name, phone, userId]);

    return res.status(201).json({
      message: "مخاطب با موفقیت ایجاد شد",
      contact: result.rows[0],
    });
  } catch (error) {
    req.log.error("Error in createContact", { err: error });

    const appError = mapContactUniqueConstraintError(error);
    if (appError) {
      return next(appError);
    }

    return next(error);
  }
}

export async function updateContact(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, phone } = req.body;

    const updateQuery = `
      UPDATE contacts
      SET
      name = COALESCE($1, name),
      phone = COALESCE($2, phone)
      WHERE public_id = $3 AND user_id = $4
      RETURNING id, public_id, name, phone, created_at;
    `;

    const result = await query(updateQuery, [
      name ?? null,
      phone ?? null,
      id,
      userId,
    ]);

    if (result.rows.length === 0) {
      return next(
        new AppError(404, "مخاطب پیدا نشد", {
          isOperational: true,
        })
      );
    }

    return res.status(200).json({
      message: "مخاطب با موفقیت به‌روزرسانی شد",
      contact: result.rows[0],
    });
  } catch (error) {
    req.log.error("Error in updateContact", { err: error });

    const appError = mapContactUniqueConstraintError(error);
    if (appError) {
      return next(appError);
    }

    return next(error);
  }
}

export async function deleteContact(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const deleteQuery = `
      DELETE FROM contacts
      WHERE public_id = $1 AND user_id = $2
      RETURNING id, public_id, name, phone, created_at;
    `;

    const result = await query(deleteQuery, [id, userId]);

    if (result.rows.length === 0) {
      return next(
        new AppError(404, "مخاطب پیدا نشد", {
          isOperational: true,
        })
      );
    }

    return res.status(200).json({
      message: "مخاطب با موفقیت حذف شد",
      contact: result.rows[0],
    });
  } catch (error) {
    req.log.error("Error in deleteContact", { err: error });

    return next(error);
  }
}
