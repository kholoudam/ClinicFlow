import { pool } from '../config/db.js';
import { stats } from '../repositories/dashboardRepository.js';
export const getStats=()=>stats(pool);