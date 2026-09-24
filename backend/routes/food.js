const express = require('express');
const Food = require('../models/Food');
const Inventory = require('../models/Inventory');
const { authMiddleware } = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');
const multer = require('multer');
const { cloudinary } = require('../utils/cloudinary');
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

const getStockStatus = (availableQuantity, lowStockThreshold) => {
  if (availableQuantity <= 0) return 'Out of Stock';
  if (availableQuantity <= lowStockThreshold) return 'Low Stock';
  return 'In Stock';
};

const injectInventory = async (food) => {
  if (!food) return food;

  const inventory = await Inventory.findOne({ foodId: food._id }).lean();
  const quantity = Number(inventory?.quantity || 0);
  const reservedQuantity = Number(inventory?.reservedQuantity || 0);
  const lowStockThreshold = Number(inventory?.lowStockThreshold || 0);
  const availableQuantity = Math.max(0, quantity - reservedQuantity);

  return {
    ...food.toObject(),
    availableQuantity,
    lowStockThreshold,
    stockStatus: getStockStatus(availableQuantity, lowStockThreshold),
    inventory: inventory ? {
      _id: inventory._id,
      foodId: inventory.foodId,
      quantity,
      reservedQuantity,
      lowStockThreshold,
      isActive: inventory.isActive,
      availableQuantity,
      stockStatus: getStockStatus(availableQuantity, lowStockThreshold),
    } : null,
  };
};

router.get('/', async (req, res) => {
  try {
    const food = await Food.find({
      $or: [
        { inStock: true },
        { inStock: { $exists: false } },
      ],
    }).sort({ createdAt: -1 });

    const enrichedFood = await Promise.all(food.map(async (item) => {
      const inventory = await Inventory.findOne({ foodId: item._id });
      if (!inventory) {
        await Inventory.create({
          foodId: item._id,
          quantity: 0,
          reservedQuantity: 0,
          lowStockThreshold: 10,
          isActive: item.inStock !== false,
        });
      }
      return injectInventory(item);
    }));

    res.status(200).json(enrichedFood);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json('Food item not found');
    const enrichedFood = await injectInventory(food);
    res.status(200).json(enrichedFood);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      calories,
      protein,
      carbs,
      fat,
      category,
      image,
      initialStock,
      lowStockThreshold,
    } = req.body;

    const food = await Food.create({
      name,
      description,
      price,
      calories,
      protein,
      carbs,
      fat,
      category,
      image,
      inStock: true,
    });

    const parsedInitialStock = Number(initialStock);
    const parsedThreshold = Number(lowStockThreshold);
    const quantity = Number.isFinite(parsedInitialStock) && parsedInitialStock >= 0
      ? parsedInitialStock
      : 0;
    const threshold = Number.isFinite(parsedThreshold) && parsedThreshold >= 0
      ? parsedThreshold
      : 10;

    const inventory = await Inventory.findOneAndUpdate(
      { foodId: food._id },
      {
        foodId: food._id,
        quantity,
        reservedQuantity: 0,
        lowStockThreshold: threshold,
        isActive: true,
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );

    const enrichedFood = await injectInventory(food);
    const availableQuantity = Math.max(0, inventory.quantity - inventory.reservedQuantity);
    enrichedFood.availableQuantity = availableQuantity;
    enrichedFood.lowStockThreshold = inventory.lowStockThreshold;
    enrichedFood.stockStatus = getStockStatus(availableQuantity, inventory.lowStockThreshold);
    enrichedFood.inventory = {
      _id: inventory._id,
      foodId: inventory.foodId,
      quantity: inventory.quantity,
      reservedQuantity: inventory.reservedQuantity,
      lowStockThreshold: inventory.lowStockThreshold,
      isActive: inventory.isActive,
      availableQuantity,
      stockStatus: getStockStatus(availableQuantity, inventory.lowStockThreshold),
    };

    res.status(201).json(enrichedFood);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

router.post('/upload-image', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json('No image provided');
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'fitness-tracker-food',
    });
    res.status(200).json({ imageUrl: result.secure_url });
  } catch (err) {
    res.status(500).json('Failed to upload image');
  }
});

router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const food = await Food.findByIdAndUpdate(id, req.body, { new: true });

    if (!food) {
      return res.status(404).json('Food item not found');
    }

    if (req.body.initialStock !== undefined || req.body.lowStockThreshold !== undefined) {
      const inventory = await Inventory.findOne({ foodId: id });
      if (inventory) {
        if (req.body.initialStock !== undefined) {
          inventory.quantity = Math.max(0, Number(req.body.initialStock) || 0);
        }
        if (req.body.lowStockThreshold !== undefined) {
          inventory.lowStockThreshold = Math.max(0, Number(req.body.lowStockThreshold) || 10);
        }
        await inventory.save();
      }
    }

    const enrichedFood = await injectInventory(food);
    res.status(200).json(enrichedFood);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const food = await Food.findByIdAndUpdate(id, { inStock: false }, { new: true });
    if (!food) {
      return res.status(404).json('Food item not found');
    }

    await Inventory.findOneAndUpdate(
      { foodId: id },
      { isActive: false },
      { returnDocument: 'after' },
    );

    res.status(200).json(food);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports = router