import { Router, Request, Response } from 'express';

const router = Router();

router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASS || 'password';

  if (username === adminUser && password === adminPass) {
    // Set a simple cookie to mark the admin as logged in
    res.cookie('isAdminAuthenticated', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res.status(200).json({ success: true, message: 'Admin logged in successfully' });
  }

  return res.status(401).json({ success: false, message: 'Invalid username or password' });
});

router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('isAdminAuthenticated');
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
});

export default router;