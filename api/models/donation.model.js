import mongoose from 'mongoose';

const donationCaseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    amountOptions: {
      type: [Number],
      required: true,
      default: [10, 25, 50, 100], 
    },
    goalAmount: {
      type: Number,
      required: false,
    },
    raisedAmount: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      default: '',
    },
    active: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const donationTransactionSchema = new mongoose.Schema(
  {
    donationCase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DonationCase',
      required: true,
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, 
    },
    amount: {
      type: Number,
      required: true,
    },
    donorName: {
      type: String,
      default: 'Anonymous',
    },
    donorEmail: {
      type: String,
      required: false,
    },
    message: {
      type: String,
      default: '',
    },
    transactionId: {
      type: String,
      required: false, // Will be filled after payment processing
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    }
  },
  { timestamps: true }
);

export const DonationCase = mongoose.model('DonationCase', donationCaseSchema);
export const DonationTransaction = mongoose.model('DonationTransaction', donationTransactionSchema); 