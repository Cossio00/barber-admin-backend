import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  process.exit(1);
}

const SECRET: string = JWT_SECRET;

interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];

  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: "Acesso negado. Token não fornecido." });
  }
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err: any) {
    return res.status(403).json({
      success: false,
      message: "Token inválido ou expirado."
    });
  }
};

export const isOwner = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'owner') {
    return res.status(403).json({
      success: false,
      message: "Acesso permitido apenas para o proprietário."
    });
  }
  next();
};