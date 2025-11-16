import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { query } from "../../config/db.js";

const UNIQUE_CONSTRAINTS = {
  NAME: "unique_user_name",
};

function handleUserUniqueConstraintError(error, res) {
  if (error.code !== "23505") return false;

  if (error.constraint === UNIQUE_CONSTRAINTS.NAME) {
    res.status(409).json({
      message: "کاربری با این نام قبلاً ثبت شده است",
      errors: [{ field: "name", message: "نام کاربری تکراری است" }],
    });
    return true;
  }

  return false;
}

export async function userList(req, res) {
  try {
    let { page = 1, limit = 10, name } = req.query;

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

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const userQuery = `
      SELECT COUNT(*) AS total
      FROM users
      ${whereClause};
    `;
    const userResult = await query(userQuery, values);
    const total = parseInt(userResult.rows[0].total, 10);
    const totalPages = Math.ceil(total / limit) || 1;

    const dataQuery = `
      SELECT *
      FROM users
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

export async function register(req, res) {
  const { name, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const publicId = uuidv4();

    const insertQuery = `
      INSERT INTO users (public_id, name, password)
      VALUES ($1, $2, $3)
      RETURNING id, public_id, name, created_at;
    `;
    const values = [publicId, name, hashedPassword];

    const result = await query(insertQuery, values);
    const user = result.rows[0];

    return res.status(201).json({
      message: "کاربر با موفقیت ثبت شد",
      user,
    });
  } catch (error) {
    console.error("Error in register:", error);

    if (handleUserUniqueConstraintError(error, res)) return;

    return res.status(500).json({ message: "Server error" });
  }
}

export async function login(req, res) {
  const { name, password } = req.body;

  try {
    const result = await query("SELECT * FROM users WHERE name = $1", [name]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "نام کاربری یا رمزعبور اشتباه است",
      });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "نام کاربری یا رمزعبور اشتباه است",
      });
    }

    const payload = {
      id: user.id,
      public_id: user.public_id,
      name: user.name,
    };

    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN;

    const token = jwt.sign(payload, secret, { expiresIn });

    const { password: _, ...safeUser } = user;

    return res.status(200).json({
      message: "ورود موفقیت‌آمیز بود",
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error("Error in login:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
