import { Request, Response, NextFunction } from 'express';

export const tenantMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  if (!user || !user.barbershopid) {
    return res.status(401).json({
      success: false,
      message: "Barbearia não identificada. Faça login novamente."
    });
  }

  (req as any).barbershopid = user.barbershopid;
  next();
};