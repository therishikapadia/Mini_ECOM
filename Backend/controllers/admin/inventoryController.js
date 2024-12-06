const Inventory = require("../../models/inventory");
const Category = require("../../models/category");
const { validateAttributes } = require("../../utils/validateAttributes");

//Add new products
const handleAddInventory = async (req, res) => {
  const { category, attributes, quantity } = req.body;

  try {
    // Fetch category rules from the database
    const categoryData = await Category.findOne({ name: category, });
    if (!categoryData) {
      return res.status(400).json({ error: "Invalid category" });
    }

    // Validate attributes against category rules
    const isValid = validateAttributes(attributes, categoryData.attributes);
    if (!isValid) {
      return res
        .status(400)
        .json({ error: "Invalid attributes for the given category" });
    }

    // Check if a product with the same category and attributes exists
    const existingProduct = await Inventory.findOne({ category, attributes });

    if (existingProduct) {
      // Update the quantity if the product already exists
      existingProduct.attributes.quantity += quantity;
      await existingProduct.save();
      return res.status(200).json({
        message: "Product quantity updated successfully",
        product: existingProduct,
      }); 
    } else {
      // Create a new product if no existing product is found
      const product = new Inventory({ category, attributes, quantity });
      await product.save();
      return res.status(201).json({
        message: "Product added successfully",
        product,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add or update product" });
  }
};


const handleGetInventory = async (req, res) => {
  const { category } = req.query;

  try {
    if (category) {
      const products = await Inventory.find({ category });
      if (!products.length) {
        return res
          .status(404)
          .json({ error: "No products found for the given category" });
      }
      return res.status(200).json({ products });
    }

    const allProducts = await Inventory.find();
    res.status(200).json({ products: allProducts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve inventory" });
  }
};

const handleUpdateInventory = async (req, res) => {
  const { oldName, newName, attributes } = req.body;

  if (!oldName || !newName) {
    return res.status(400).json({ error: "Both oldName and newName are required" });
  }

  try {
    // Fetch the category data based on the old name
    const categoryData = await Category.findOne({ name: oldName });

    if (!categoryData) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Validate the attributes if provided
    if (attributes) {
      const isValid = validateAttributes(attributes, categoryData.attributes);
      if (!isValid) {
        return res
          .status(400)
          .json({ error: "Invalid attributes for the given category" });
      }
    }

    // Update the category name and attributes
    const updatedCategory = await Category.findOneAndUpdate(
      { name: oldName },
      { name: newName, attributes: attributes || undefined },
      { new: true }
    );

    res.status(200).json({
      message: "Category updated successfully",
      updatedCategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update category" });
  }
};

const handleDeleteInventory = async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ error: "Product ID is required" });
  }

  try {
    const deletedProduct = await Inventory.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res
      .status(200)
      .json({ message: "Product deleted successfully", deletedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete product" });
  }
};

module.exports = { handleAddInventory ,handleDeleteInventory,handleGetInventory,handleUpdateInventory};
