import mongoose, { Schema } from 'mongoose';

const returnOrderSchema = new Schema({
  order: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  returnDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['requested', 'approved', 'rejected'],
    default: 'requested'
  }
});

export const ReturnOrder = mongoose.model('ReturnOrder', returnOrderSchema);
