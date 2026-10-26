import { Router, Request, Response } from 'express';
import { pool } from '../config/db.js';

const router = Router();

// GET /api/logs - Fetch all attendance records with user details
router.get('/logs', async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        logs.id AS log_id,
        users.name AS user_name,
        users.card_id,
        users.role,
        logs.time_in,
        logs.time_out
      FROM attendance_logs logs
      JOIN users ON logs.user_id = users.id
      ORDER BY logs.time_in DESC;
    `;

    const result = await pool.query(query);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      logs: result.rows,
    });
  } catch (error) {
    console.error('Error fetching attendance logs:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;