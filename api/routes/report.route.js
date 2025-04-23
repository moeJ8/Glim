import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { createReport, getReports, updateReportStatus, deleteReport } from '../controllers/report.controller.js';

const router = express.Router();

router.post('/', verifyToken, createReport);
router.get('/', verifyToken, getReports);
router.put('/:id', verifyToken, updateReportStatus);
router.delete('/:id', verifyToken, deleteReport);

export default router; 