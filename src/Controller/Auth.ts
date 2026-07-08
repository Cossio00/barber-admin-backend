import db from '../dbConfig/db';
import { randomUUID } from 'crypto';
import { User } from '../Model/User';
import ApiResponse from '../Utils/apiResponse';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  process.exit(1);
}

const SECRET: string = JWT_SECRET;

async function register(req: any, res: any) {
  try {
    const { username, email, password, phone, barbershopname } = req.body;

    if (!username || !email || !password || !barbershopname) {
      return ApiResponse.error(res, "Nome, email, senha e nome da barbearia são obrigatórios", "MISSING_FIELDS", 400);
    }

    const existingUser: any = await db.query("SELECT email FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return ApiResponse.error(res, "Este email já está cadastrado", "EMAIL_ALREADY_EXISTS", 409);
    }

    const userId = randomUUID().slice(0, 30);
    const barbershopId = randomUUID().slice(0, 30); 

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const barbershopSql = `
      INSERT INTO barbershop (barbershopid, barbershopname)
      VALUES (?, ?)
    `;
    await db.query(barbershopSql, [barbershopId, barbershopname]);

    const user = new User({
      userid: userId,
      username,
      email,
      password_hash: passwordHash,
      phone,
      role: 'owner'
    });

    const userSql = `
      INSERT INTO users (userid, username, email, password_hash, phone, role, barbershopid)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const result: any = await db.query(userSql, [
      user.getUserId(),
      user.getUsername(),
      user.getEmail(),
      user.getPasswordHash(),
      user.getPhone(),
      user.getRole(),
      barbershopId
    ]);

    if (result.affectedRows > 0) {

      const token = jwt.sign(
        { 
          userId: userId,
          email: email,
          role: 'owner',
          barbershopid: barbershopId
        },
        SECRET,
        { expiresIn: '7d' }
      );

      return ApiResponse.success(res, "Barbearia e conta criadas com sucesso!", {
        user: {
          userid: userId,
          username,
          email,
          role: 'owner'
        },
        barbershop: {
          barbershopid: barbershopId,
          barbershopname
        },
        token
      }, 201);
    }

    return ApiResponse.error(res, "Não foi possível criar a conta", "CREATE_FAILED", 500);
  } catch (err: any) {
    console.error('Error registering user:', err);
    return ApiResponse.error(res, "Erro interno ao cadastrar", "REGISTER_FAILED", 500);
  }
}

async function login(req: any, res: any) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return ApiResponse.error(res, "Email e senha são obrigatórios", "MISSING_CREDENTIALS", 400);
    }

    const rows: any = await db.query(
      `SELECT
        us.userid, us.username, us.email, us.password_hash, us.role, us.barbershopid, bs.barbershopname
      FROM users AS us
      INNER JOIN barbershop AS bs
      ON us.barbershopid = bs.barbershopid
      WHERE us.email = ?;`,
      [email]
    );

    if (rows.length === 0) {
      return ApiResponse.error(res, "Email ou senha inválidos", "INVALID_CREDENTIALS", 401);
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return ApiResponse.error(res, "Email ou senha inválidos", "INVALID_CREDENTIALS", 401);
    }

    const token = jwt.sign(
      {
        userId: user.userid,
        email: user.email,
        role: user.role,
        barbershopid: user.barbershopid,
        barbershopname: user.barbershopname
      },
      SECRET,
      { expiresIn: '7d' }
    );

    return ApiResponse.success(res, "Login realizado com sucesso", {
      user: {
        userid: user.userid,
        username: user.username,
        email: user.email,
        role: user.role,
        barbershopid: user.barbershopid,
        barbershopname: user.barbershopname
      },
      token
    });
  } catch (err: any) {
    console.error('Error logging in:', err);
    return ApiResponse.error(res, "Erro ao fazer login", "LOGIN_FAILED", 500);
  }
}

export { register, login };