const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const InventorySchema = new Schema(
  {
    foodId: {
      type: Schema.Types.ObjectId,
      ref: 'Food',
      required: true,
      unique: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    reservedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

InventorySchema.virtual('availableQuantity').get(function () {
  return Math.max(0, Number(this.quantity || 0) - Number(this.reservedQuantity || 0));
});

InventorySchema.virtual('stockStatus').get(function () {
  const available = this.availableQuantity;
  if (available <= 0) return 'Out of Stock';
  if (available <= this.lowStockThreshold) return 'Low Stock';
  return 'In Stock';
});

InventorySchema.set('toJSON', { virtuals: true });
InventorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Inventory', InventorySchema);
