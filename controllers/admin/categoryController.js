const Category = require('../../models/category')

const handleAddNewProduct = async (req, res) => {
  const { name, attributes } = req.body;

  if (!name || !attributes) {
    return res.status(400).json({ error: 'Category name and attributes are required' });
  }
  try {
    const category = await Category.findOneAndUpdate(
      { name },
      { attributes },
      { new: true, upsert: true } // Update if exists, create if not
    );
    res.status(200).json({ message: 'Category added successfully', category });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add category' });
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
    res.status(200).json({ message: "Category deleted successfully", deletedCategory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete category" });
  }
};

const handleUpdateNewProduct = async (req, res) => {
  const { oldName, newName, attributes } = req.body;

  if (!oldName || !newName) {
    return res.status(400).json({ error: "Both oldName and newName are required" });
  }

  try {
    const updatedCategory = await Category.findOneAndUpdate(
      { name: oldName }, // Search by the old name
      { name: newName, attributes: attributes || undefined }, // Update with the new name and optional attributes
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json({ message: "Category updated successfully", updatedCategory });
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



module.exports={handleAddNewProduct,handleDeleteNewProduct,handleGetNewProduct,handleUpdateNewProduct}

