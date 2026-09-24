const express = require('express');
const Inventory = require('../models/Inventory');
const Food = require('../models/Food');
const { authMiddleware } = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');

const router = express.Router();

const getStockStatus = (availableQuantity, lowStockThreshold) => {
  if (availableQuantity <= 0) return 'Out of Stock';
  if (availableQuantity <= lowStockThreshold) return 'Low Stock';
  return 'In Stock';
};

const serializeInventory = (inventory) => {
  if (!inventory) return null;

  const quantity = Number(inventory.quantity || 0);
  const reservedQuantity = Number(inventory.reservedQuantity || 0);
  const availableQuantity = Math.max(0, quantity - reservedQuantity);

  return {
    ...inventory.toObject(),
    availableQuantity,
    stockStatus: getStockStatus(availableQuantity, Number(inventory.lowStockThreshold || 0)),
  };
};

router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const foods = await Food.find().sort({ createdAt: -1 });

    const payload = await Promise.all(
      foods.map(async (food) => {
        const inventory = await Inventory.findOneAndUpdate(
          { foodId: food._id },
          {
            $setOnInsert: {
              foodId: food._id,
              quantity: 0,
              reservedQuantity: 0,
              lowStockThreshold: 10,
              isActive: food.inStock !== false,
            },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );

        inventory.foodId = food;
        return serializeInventory(inventory);
      }),
    );

    payload.sort((left, right) => {
      const leftDate = new Date(left.updatedAt || left.createdAt).getTime();
      const rightDate = new Date(right.updatedAt || right.createdAt).getTime();
      return rightDate - leftDate;
    });
    res.status(200).json(payload);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

router.get('/:foodId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const inventory = await Inventory.findOne({ foodId: req.params.foodId }).populate(
      'foodId',
      'name price image category inStock',
    );

    if (!inventory) {
      return res.status(404).json('Inventory not found');
    }

    res.status(200).json(serializeInventory(inventory));
  } catch (err) {
    res.status(500).json(err.message);
  }
});

router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { foodId, quantity, lowStockThreshold, isActive } = req.body;

    if (!foodId) {
      return res.status(400).json('Food ID is required');
    }

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json('Food item not found');
    }

    const qty = Math.max(0, Number(quantity) || 0);
    const numericThreshold = Number.isFinite(Number(lowStockThreshold)) ? Number(lowStockThreshold) : 10;
    const threshold = Math.max(0, numericThreshold);
    const active = isActive !== undefined ? Boolean(isActive) : true;

    const existingInventory = await Inventory.findOne({ foodId });
    if (existingInventory) {
      existingInventory.quantity = qty;
      existingInventory.lowStockThreshold = threshold;
      existingInventory.isActive = active;
      await existingInventory.save();
      return res.status(200).json(serializeInventory(existingInventory));
    }

    const inventory = await Inventory.create({
      foodId,
      quantity: qty,
      lowStockThreshold: threshold,
      isActive: active,
      reservedQuantity: 0,
    });

    res.status(201).json(serializeInventory(inventory));
  } catch (err) {
    res.status(500).json(err.message);
  }
});

router.put('/:foodId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { quantity, lowStockThreshold, isActive } = req.body;
    const inventory = await Inventory.findOne({ foodId: req.params.foodId });

    if (!inventory) {
      return res.status(404).json('Inventory not found');
    }

    if (quantity !== undefined) {
      inventory.quantity = Math.max(0, Number(quantity) || 0);
    }
    if (lowStockThreshold !== undefined) {
      inventory.lowStockThreshold = Math.max(0, Number(lowStockThreshold) || 0);
    }
    if (isActive !== undefined) {
      inventory.isActive = Boolean(isActive);
    }

    await inventory.save();
    res.status(200).json(serializeInventory(inventory));
  } catch (err) {
    res.status(500).json(err.message);
  }
});

router.patch('/:foodId/stock', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { action, quantity } = req.body;
    const food = await Food.findById(req.params.foodId);
    if (!food) {
      return res.status(404).json('Food item not found');
    }

    const inventory = await Inventory.findOneAndUpdate(
      { foodId: req.params.foodId },
      {
        $setOnInsert: {
          foodId: req.params.foodId,
          quantity: 0,
          reservedQuantity: 0,
          lowStockThreshold: 10,
          isActive: food.inStock !== false,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    if (!inventory) {
      return res.status(404).json('Inventory not found');
    }

    const amount = Number(quantity);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json('Quantity must be a positive number');
    }

    if (!['add', 'remove', 'set'].includes(action)) {
      return res.status(400).json('Invalid stock action');
    }

    if (action === 'add') {
      inventory.quantity += amount;
    } else if (action === 'remove') {
      if (inventory.quantity - inventory.reservedQuantity < amount) {
        return res.status(400).json(`Only ${Math.max(0, inventory.quantity - inventory.reservedQuantity)} units are available to remove.`);
      }
      inventory.quantity = Math.max(0, inventory.quantity - amount);
    } else if (action === 'set') {
      inventory.quantity = Math.max(0, amount);
    }

    await inventory.save();
    res.status(200).json(serializeInventory(inventory));
  } catch (err) {
    res.status(500).json(err.message);
  }
});

router.delete('/:foodId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const inventory = await Inventory.findOne({ foodId: req.params.foodId });
    if (!inventory) {
      return res.status(404).json('Inventory not found');
    }

    inventory.isActive = false;
    await inventory.save();

    await Food.findByIdAndUpdate(req.params.foodId, { inStock: false }, { new: true });
    res.status(200).json({ message: 'Inventory disabled successfully', inventory: serializeInventory(inventory) });
  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports = router;
