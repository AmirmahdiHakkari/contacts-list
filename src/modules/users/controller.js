import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { query } from "../../config/db.js";
import { AppError } from "../../utils/AppError.js";

const UNIQUE_CONSTRAINTS = {
  NAME: "unique_user_name",
};

function mapUserUniqueConstraintError(error) {
  if (error.code !== "23505") return null;

  if (error.constraint === UNIQUE_CONSTRAINTS.NAME) {
    return new AppError(409, "کاربری با این نام قبلاً ثبت شده است", {
      errors: [{ field: "name", message: "نام کاربری تکراری است" }],
      isOperational: true,
    });
  }

  return new AppError(409, "رکورد تکراری است", {
    isOperational: true,
  });
}

export async function userList(req, res, next) {
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

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM users
      ${whereClause};
    `;
    const countResult = await query(countQuery, values);
    const total = parseInt(countResult.rows[0].total, 10);
    const totalPages = Math.ceil(total / limit);

    const dataQuery = `
      SELECT id, public_id, name, created_at
      FROM users
      ${whereClause}
      ORDER BY id DESC
      LIMIT $${index}
      OFFSET $${index + 1};
    `;

    const dataValues = [...values, limit, offset];
    const dataResult = await query(dataQuery, dataValues);

    return res.status(200).json({
      message: "لیست کاربران با موفقیت دریافت شد",
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error in userList:", error);
    return next(error);
  }
}

export async function register(req, res, next) {
  try {
    const { name, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const publicId = uuidv4();

    const insertQuery = `
      INSERT INTO users (public_id, name, password)
      VALUES ($1, $2, $3)
      RETURNING id, public_id, name, created_at;
    `;

    const result = await query(insertQuery, [publicId, name, hashedPassword]);
    const user = result.rows[0];

    return res.status(201).json({
      message: "کاربر با موفقیت ثبت شد",
      user,
    });
  } catch (error) {
    console.error("Error in register:", error);

    const appError = mapUserUniqueConstraintError(error);
    if (appError) {
      return next(appError);
    }

    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { name, password } = req.body;

    const userQuery = `
      SELECT *
      FROM users
      WHERE name = $1
      LIMIT 1;
    `;
    const result = await query(userQuery, [name]);

    if (result.rows.length === 0) {
      return next(
        new AppError(401, "نام کاربری یا رمزعبور اشتباه است", {
          isOperational: true,
        })
      );
    }

    const user = result.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(
        new AppError(401, "نام کاربری یا رمزعبور اشتباه است", {
          isOperational: true,
        })
      );
    }

    const payload = {
      id: user.id,
      public_id: user.public_id,
      name: user.name,
    };

    const secret = process.env.JWT_SECRET || "dev_secret_key";
    const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

    const token = jwt.sign(payload, secret, { expiresIn });

    const { password: _, ...safeUser } = user;

    return res.status(200).json({
      message: "ورود موفقیت‌آمیز بود",
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error("Error in login:", error);
    return next(error);
  }
}
