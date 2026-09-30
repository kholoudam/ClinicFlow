import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { stats } from '../controllers/dashboardController.js';
const r=Router();
r.get('/stats',authenticate,asyncHandler(stats));
export default r;