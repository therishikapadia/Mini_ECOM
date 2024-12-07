const Category = require("../../models/category");

const handleAddNewProduct = async (req, res) => {
  const { name, attributes, categoryType } = req.body; // Extract name, attributes, and categoryType from the request body

  if (!name || !attributes || !categoryType) {
    return res
      .status(400)
      .json({
        error:
          "Product name, attributes, and category type (categoryType) are required",
      });
  }

  try {
    // Create a new product
    const newProduct = new Product({
      name,
      attributes,
      categoryType, // Assuming categoryType is part of your Product schema
    });

    // Save the product to the database
    await newProduct.save();

    res
      .status(200)
      .json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ error: "Failed to add product" });
  }
};

const handleDeleteNewProduct = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Category name is required" });
  }

  try {
    const deletedCategory = await Category.findOneAndDelete({ name });
    if (!deletedCategory) {
      return res.status(404).json({ error: "Category not found" });
    }
    res
      .status(200)
      .json({ message: "Category deleted successfully", deletedCategory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete category" });
  }
};

const handleUpdateNewProduct = async (req, res) => {
  const { oldName, newName, attributes,categoryType } = req.body;

  if (!oldName || !newName) {
    return res
      .status(400)
      .json({ error: "Both oldName and newName are required" });
  }

  try {
    const updatedCategory = await Category.findOneAndUpdate(
      { name: oldName }, // Search by the old name
      { name: newName, attributes: attributes || undefined ,categoryType:categoryType}, // Update with the new name and optional attributes
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    res
      .status(200)
      .json({ message: "Category updated successfully", updatedCategory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update category" });
  }
};

const handleGetNewProduct = async (req, res) => {
  const { name } = req.query;

  try {
    if (name) {
      const category = await Category.findOne({ name });
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      return res.status(200).json({ category });
    }

    const categories = await Category.find();
    res.status(200).json({ categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve categories" });
  }
};

module.exports = {
  handleAddNewProduct,
  handleDeleteNewProduct,
  handleGetNewProduct,
  handleUpdateNewProduct,
};
