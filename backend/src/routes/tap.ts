import { Router, Request, Response } from 'express';
import { pool } from '../config/db';

const router = Router();

// Time-in and Time-out
router.post('/tap', async (req: Request, res: Response) => {
  const { card_id } = req.body;

  if (!card_id) {
    return res.status(400).json({ success: false, message: 'Card ID is required.' });
  }

  try {
    // Check if user is still active
    const userResult = await pool.query(
      'SELECT id, name, role, is_active FROM users WHERE card_id = $1',
      [card_id.trim()]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Card not registered to any user.' });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'User account is deactivated.' });
    }

    // Set Cooldown
    const recentLogResult = await pool.query(
      'SELECT time_in, time_out FROM attendance_logs WHERE user_id = $1 ORDER BY id DESC LIMIT 1',
      [user.id]
    );

    if (recentLogResult.rows.length > 0) {
      const lastLog = recentLogResult.rows.length > 0 ? recentLogResult.rows[0] : null;
      const lastTimestamp = lastLog.time_out ? new Date(lastLog.time_out) : new Date(lastLog.time_in);
      const secondsSinceLastTap = (Date.now() - lastTimestamp.getTime()) / 1000;

      const COOLDOWN_SECONDS = 2; // 2 sec cooldown

      if (secondsSinceLastTap < COOLDOWN_SECONDS) {
        return res.status(429).json({
          success: false,
          message: `Too fast! Please wait a few seconds before tapping again.`,
        });
      }
    }

    // Check if the user has an active session
    const activeSessionResult = await pool.query(
      'SELECT id, time_in FROM attendance_logs WHERE user_id = $1 AND time_out IS NULL',
      [user.id]
    );

    if (activeSessionResult.rows.length > 0) {
      const sessionId = activeSessionResult.rows[0].id;
      const updateResult = await pool.query(
        'UPDATE attendance_logs SET time_out = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
        [sessionId]
      );

      return res.status(200).json({
        success: true,
        action: 'TIME_OUT',
        message: `Goodbye, ${user.name}! Timed out successfully.`,
        data: updateResult.rows[0],
      });
    } else {
      const insertResult = await pool.query(
        'INSERT INTO attendance_logs (user_id, time_in) VALUES ($1, CURRENT_TIMESTAMP) RETURNING *',
        [user.id]
      );

      return res.status(200).json({
        success: true,
        action: 'TIME_IN',
        message: `Welcome, ${user.name}! Timed in successfully.`,
        data: insertResult.rows[0],
      });
    }
  } catch (error) {
    console.error('Error processing tap:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;