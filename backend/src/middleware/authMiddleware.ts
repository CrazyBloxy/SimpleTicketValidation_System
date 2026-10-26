import { Request, Response, NextFunction } from 'express';

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const isAdmin = req.cookies && req.cookies.isAdminAuthenticated === 'true';

  if (!isAdmin) {
    return res.status(403).json({ 
      success: false, 
      message: 'Unauthorized. Admin access required.' 
    });
  }

  next();
};