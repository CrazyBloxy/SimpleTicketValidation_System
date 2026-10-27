import { Router, Request, Response } from 'express';
import { pool } from '../config/db';
import { requireAdmin } from '../middleware/authMiddleware';

const router = Router();

router.use('/admin', requireAdmin); // Authentication Check

// List all users (GET)
router.get('/admin/users', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, name, card_id, role, is_active, created_at FROM users ORDER BY id ASC'
    );
    return res.status(200).json({ success: true, users: result.rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Create User (POST)
router.post('/admin/users', async (req: Request, res: Response) => {
  const { name, card_id, role } = req.body;

  if (!name || !card_id || !role) {
    return res.status(400).json({ success: false, message: 'Name, card_id, and role are required.' });
  }

  const client = await pool.connect();
  try {
    // 1. Stage the transaction
    await client.query('BEGIN');

    const result = await client.query(
      'INSERT INTO users (name, card_id, role, is_active) VALUES ($1, $2, $3, TRUE) RETURNING *',
      [name.trim(), card_id.trim(), role.trim()]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: result.rows[0],
    });
  } catch (error: any) {
    await client.query('ROLLBACK');

    if (error.code === '23505') {
      return res.status(400).json({ success: false, message: 'A user with this card ID already exists.' });
    }
    console.error('Error creating user (Rolled back):', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Edit User Credentials (PUT)
router.put('/admin/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, card_id, role, is_active } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      `UPDATE users 
       SET name = COALESCE($1, name), 
           card_id = COALESCE($2, card_id), 
           role = COALESCE($3, role), 
           is_active = COALESCE($4, is_active) 
       WHERE id = $5 
       RETURNING *`,
      [name, card_id, role, is_active, id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: result.rows[0],
    });
  } catch (error: any) {
    await client.query('ROLLBACK');

    if (error.code === '23505') {
      return res.status(400).json({ success: false, message: 'Card ID is already assigned to another user.' });
    }
    console.error('Error updating user (Rolled back):', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Erase User (DELETE)
router.delete('/admin/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    console.error('Error deleting user (Rolled back):', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    client.release();
  }
});

export default router;