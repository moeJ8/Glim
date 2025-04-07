import { DonationCase, DonationTransaction } from '../models/donation.model.js';
import { errorHandler } from '../utils/error.js';

// Create a new donation case (admin only)
export const createDonationCase = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, 'You are not allowed to create donation cases'));
  }

  try {
    const { title, description, amountOptions, goalAmount, image } = req.body;
    
    if (!title || !description) {
      return next(errorHandler(400, 'Title and description are required'));
    }

    const newDonationCase = new DonationCase({
      title,
      description,
      amountOptions: amountOptions || [10, 25, 50, 100],
      goalAmount,
      image,
      createdBy: req.user.id,
    });

    const savedDonationCase = await newDonationCase.save();
    res.status(201).json(savedDonationCase);
  } catch (error) {
    next(error);
  }
};

// Get all donation cases
export const getDonationCases = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = parseInt(req.query.startIndex) || 0;
    
    // Build query based on active parameter
    const query = {};
    if (req.query.active === 'false') {
      query.active = false;
    } else if (req.query.active === 'true') {
      query.active = true;
    }
    // If active=all or not specified, don't filter by active status
    
    const donationCases = await DonationCase.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);
      
    const totalDonationCases = await DonationCase.countDocuments(query);
    
    res.status(200).json({ donationCases, totalDonationCases });
  } catch (error) {
    next(error);
  }
};

// Get a donation case by ID
export const getDonationCaseById = async (req, res, next) => {
  try {
    const donationCase = await DonationCase.findById(req.params.id);
    
    if (!donationCase) {
      return next(errorHandler(404, 'Donation case not found'));
    }
    
    res.status(200).json(donationCase);
  } catch (error) {
    next(error);
  }
};

// Update a donation case (admin only)
export const updateDonationCase = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, 'You are not allowed to update donation cases'));
  }
  
  try {
    const donationCase = await DonationCase.findById(req.params.id);
    
    if (!donationCase) {
      return next(errorHandler(404, 'Donation case not found'));
    }
    
    const updatedDonationCase = await DonationCase.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          title: req.body.title,
          description: req.body.description,
          amountOptions: req.body.amountOptions,
          goalAmount: req.body.goalAmount,
          image: req.body.image,
          active: req.body.active,
        },
      },
      { new: true }
    );
    
    res.status(200).json(updatedDonationCase);
  } catch (error) {
    next(error);
  }
};

// Create a donation transaction
export const createDonationTransaction = async (req, res, next) => {
  try {
    const { donationCaseId, amount, donorName, donorEmail, message } = req.body;
    
    if (!donationCaseId || !amount) {
      return next(errorHandler(400, 'Donation case ID and amount are required'));
    }
    
    const donationCase = await DonationCase.findById(donationCaseId);
    
    if (!donationCase) {
      return next(errorHandler(404, 'Donation case not found'));
    }
    
    if (!donationCase.active) {
      return next(errorHandler(400, 'This donation case is no longer active'));
    }
    
    const newDonationTransaction = new DonationTransaction({
      donationCase: donationCaseId,
      amount,
      donorName: donorName || 'Anonymous',
      donorEmail,
      message,
      donor: req.user ? req.user.id : null,
      status: 'pending', // Will be updated after payment processing
    });
    
    const savedDonationTransaction = await newDonationTransaction.save();
    
    // Update the raised amount for the donation case
    await DonationCase.findByIdAndUpdate(
      donationCaseId,
      {
        $inc: { raisedAmount: amount },
      }
    );
    
    res.status(201).json(savedDonationTransaction);
  } catch (error) {
    next(error);
  }
};

// Get donation transactions for a case
export const getDonationTransactions = async (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      return next(errorHandler(403, 'You are not allowed to view all donation transactions'));
    }
    
    const donationTransactions = await DonationTransaction.find({
      donationCase: req.params.caseId,
    })
      .sort({ createdAt: -1 })
      .populate('donor', 'username email');
    
    res.status(200).json(donationTransactions);
  } catch (error) {
    next(error);
  }
};

// Update donation transaction status (after payment processing)
export const updateDonationTransactionStatus = async (req, res, next) => {
  try {
    const { status, transactionId } = req.body;
    
    if (!status) {
      return next(errorHandler(400, 'Status is required'));
    }
    
    const donationTransaction = await DonationTransaction.findById(req.params.id);
    
    if (!donationTransaction) {
      return next(errorHandler(404, 'Donation transaction not found'));
    }
    
    // If the transaction failed, decrement the raised amount
    if (status === 'failed' && donationTransaction.status !== 'failed') {
      await DonationCase.findByIdAndUpdate(
        donationTransaction.donationCase,
        {
          $inc: { raisedAmount: -donationTransaction.amount },
        }
      );
    }
    
    const updatedDonationTransaction = await DonationTransaction.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status,
          transactionId,
        },
      },
      { new: true }
    );
    
    res.status(200).json(updatedDonationTransaction);
  } catch (error) {
    next(error);
  }
};

// Delete a donation case (admin only)
export const deleteDonationCase = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, 'You are not allowed to delete donation cases'));
  }
  
  try {
    const donationCase = await DonationCase.findById(req.params.id);
    
    if (!donationCase) {
      return next(errorHandler(404, 'Donation case not found'));
    }
    
    await DonationCase.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Donation case has been deleted' });
  } catch (error) {
    next(error);
  }
}; 