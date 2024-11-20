const Product = require('../../models/inventory')
const Category = require('../../models/category')


//Add new products
 const handleInventory =async (req, res) => {
    const { category, attributes } = req.body;
  
    try {
        // Fetch category rules from the database
      const categoryData = await Category.findOne({ name: category });
      if (!categoryData) {
        return res.status(400).json({ error: 'Invalid category' });
      }
  
       // Validate attributes against category rules
      const isValid = validateAttributes(attributes, categoryData.attributes);
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid attributes for the given category' });
      }
  
      // Save the product
      const product = new Product({ category, attributes });
      await product.save();
      res.status(201).json({ message: 'Product added successfully', product });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add product' });
    }
  };

  // Helper function to validate attributes
function validateAttributes(attributes, rules) {
    for (const key in rules) {
      const rule = rules[key];
      const value = attributes[key];
  
      if (rule.required && value === undefined) return false;
  
      if (rule.type === 'array') {
        if (!Array.isArray(value)) return false;
        if (rule.allowedValues && !value.every((v) => rule.allowedValues.includes(v))) {
          return false;
        }
        if (rule.min !== undefined || rule.max !== undefined) {
          if (!value.every((v) => v >= rule.min && v <= rule.max)) return false;
        }
      }
  
      if (rule.type === 'number') {
        if (typeof value !== 'number') return false;
      }
    }
  
    return true;
  }


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
    res.status(200).json({ message: 'Category added/updated successfully', category });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add/update category' });
  }
};



module.exports={handleInventory,handleAddNewProduct}

