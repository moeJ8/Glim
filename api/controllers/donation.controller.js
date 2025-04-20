import { DonationCase, DonationTransaction } from '../models/donation.model.js';
import { errorHandler } from '../utils/error.js';
import { createNewDonationNotifications, createDonationTransactionNotifications } from '../utils/createNotification.js';

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
    // Create notifications for all non-admin users
    await createNewDonationNotifications(
      req,
      savedDonationCase._id,
      savedDonationCase.title,
      req.user.id
    );
    res.status(201).json(savedDonationCase);
  } catch (err) {
    next(err);
  }
};

export const getDonationCases = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = parseInt(req.query.startIndex) || 0;
    
    const query = {};
    if (req.query.active === 'false') {
      query.active = false;
    } else if (req.query.active === 'true') {
      query.active = true;
    }
    
    const donationCases = await DonationCase.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);
      
    const totalDonationCases = await DonationCase.countDocuments(query);
    
    res.status(200).json({ donationCases, totalDonationCases });
  } catch (err) {
    next(err);
  }
};

export const getDonationCaseById = async (req, res, next) => {
  try {
    const donationCase = await DonationCase.findById(req.params.id);
    
    if (!donationCase) {
      return next(errorHandler(404, 'Donation case not found'));
    }
    
    res.status(200).json(donationCase);
  } catch (err) {
    next(err);
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
  } catch (err) {
    next(err);
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
    
    // Create notifications for admins
    await createDonationTransactionNotifications(
      req,
      donationCaseId,
      donationCase.title,
      amount,
      newDonationTransaction.donorName,
      req.user ? req.user.id : null
    );
    
    res.status(201).json(savedDonationTransaction);
  } catch (err) {
    next(err);
  }
};

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
  } catch (err) {
    next(err);
  }
};

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
    // Only create notification for successful transactions
    if (status === 'completed' && donationTransaction.status !== 'completed') {
      // Get the donation case details
      const donationCase = await DonationCase.findById(donationTransaction.donationCase);

      if (donationCase) {
        // Create notifications for admins about the completed donation
        await createDonationTransactionNotifications(
          req,
          donationTransaction.donationCase,
          donationCase.title,
          donationTransaction.amount,
          donationTransaction.donorName,
          donationTransaction.donor
        );
      }
    }
    
    res.status(200).json(updatedDonationTransaction);
  } catch (err) {
    next(err);
  }
};

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
  } catch (err) {
    next(err);
  }
}; 