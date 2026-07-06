import db from '../dbConfig/db';
import { randomUUID } from 'crypto';
import { User } from '../Model/User';
import ApiResponse from '../Utils/apiResponse';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_muito_forte_aqui'; // Use .env depois

async function register(req: any, res: any) {
  try {
    const { username, email, password, phone } = req.body;

    if (!username || !email || !password) {
      return ApiResponse.error(res, "Nome, email e senha são obrigatórios", "MISSING_FIELDS", 400);
    }

    
    const existingUser: any = await db.query("SELECT email FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return ApiResponse.error(res, "Este email já está cadastrado", "EMAIL_ALREADY_EXISTS", 409);
    }

    const userId = randomUUID().slice(0, 30);
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({
      userid: userId,
      username,
      email,
      password_hash: passwordHash,
      phone,
      role: 'owner'
    });

    const sql = `
      INSERT INTO users (userid, username, email, password_hash, phone, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const result: any = await db.query(sql, [
      user.getUserId(),
      user.getUsername(),
      user.getEmail(),
      user.getPasswordHash(),
      user.getPhone(),
      user.getRole()
    ]);

    if (result.affectedRows > 0) {
      return ApiResponse.success(res, "Usuário cadastrado com sucesso", { userId }, 201);
    }

    return ApiResponse.error(res, "Não foi possível criar o usuário", "CREATE_USER_FAILED", 500);
  } catch (err: any) {
    console.error('Error registering user:', err);
    return ApiResponse.error(res, "Erro interno ao cadastrar usuário", "REGISTER_FAILED", 500);
  }
}

async function login(req: any, res: any) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return ApiResponse.error(res, "Email e senha são obrigatórios", "MISSING_CREDENTIALS", 400);
    }

    const rows: any = await db.query(
      "SELECT userid, username, email, password_hash, role FROM users WHERE email = ?", 
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
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return ApiResponse.success(res, "Login realizado com sucesso", {
      user: {
        userid: user.userid,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err: any) {
    console.error('Error logging in:', err);
    return ApiResponse.error(res, "Erro ao fazer login", "LOGIN_FAILED", 500);
  }
}

export { register, login };