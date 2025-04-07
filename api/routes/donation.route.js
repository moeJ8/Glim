import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import {
  createDonationCase,
  getDonationCases,
  getDonationCaseById,
  updateDonationCase,
  createDonationTransaction,
  getDonationTransactions,
  updateDonationTransactionStatus,
  deleteDonationCase,
} from '../controllers/donation.controller.js';

const router = express.Router();

// Donation cases routes
router.post('/case', verifyToken, createDonationCase);
router.get('/cases', getDonationCases);
router.get('/case/:id', getDonationCaseById);
router.put('/case/:id', verifyToken, updateDonationCase);
router.delete('/case/:id', verifyToken, deleteDonationCase);

// Donation transactions routes
router.post('/transaction', verifyToken, createDonationTransaction);
router.get('/transactions/:caseId', verifyToken, getDonationTransactions);
router.put('/transaction/:id', verifyToken, updateDonationTransactionStatus);

export default router; 