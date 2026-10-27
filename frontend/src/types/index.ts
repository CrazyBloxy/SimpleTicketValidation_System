export interface AttendanceLog {
  log_id: number;
  user_name: string;
  card_id: string;
  role: string;
  time_in: string;
  time_out: string | null;
}

export interface TapResponse {
  success: boolean;
  action?: 'TIME_IN' | 'TIME_OUT';
  message: string;
  data?: AttendanceLog;
}

export interface User {
  id: number;
  name: string;
  card_id: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface UserResponse {
  success: boolean;
  message?: string;
  users?: User[];
}