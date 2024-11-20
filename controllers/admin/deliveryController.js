const User=require('../../models/user')
const {hashPassword}=require('../../utils/password')

  const handleAddDeliveryAgent = async (req, res) => {
    const { name, email, password } = req.body;
  
    if (!name || !email || !password ) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }
  
    try {
      // Hash the password before saving
      const hashedPassword = await hashPassword(password);
  
      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        role:"DELIVERY_AGENT",
      });
  
      res.status(201).json({ message: 'delivery agent added successfully', newUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to add delivery agent' });
    }
  };
  

  const handleUpdateDeliveryAgent = async (req, res) => {
    const { email, name, password,role} = req.body;
  

    if (!email || !name || !password ||!role) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }
  
    if (role !== 'DELIVERY_AGENT') {
      return res.status(400).json({ error: 'Role must be DELIVERY_AGENT' });
    }
  
    try {
      const hashedPassword = await hashPassword(password);
  
      // Update delivery agent by email
      const user = await User.findOneAndUpdate(
        { email, role: 'DELIVERY_AGENT' }, // Ensure it's a delivery agent
        { name, password: hashedPassword, role },
        { new: true }
      );
  
      if (!user) {
        return res.status(404).json({ error: 'Delivery not found or not a DELIVERY_AGENT' });
      }
  
      res.status(200).json({ message: 'delivery agent updated successfully', user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update delivery agent' });
    }
  };

  const handleDeleteDeliveryAgent = async (req, res) => {
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).json({ error: 'Email is required to delete delivery agent' });
    }
  
    try {
      // Delete delivery agent with the specified email and role "DELIVERY_AGENT"
      const user = await User.findOneAndDelete({ email, role: 'DELIVERY_AGENT' });
  
      if (!user) {
        return res.status(404).json({ error: 'delivery agent not found or not a DELIVERY_AGENT' });
      }
  
      res.status(200).json({ message: 'delivery agent deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete delivery agent' });
    }
  };
  

const handleGetAllDeliveryAgents = async (req, res) => {
  try {
    // Find all users with the role "DELIVERY_AGENT"
    const agent = await User.find({ role: 'DELIVERY_AGENT' });

    if (agent.length === 0) {
      return res.status(404).json({ error: 'No delivery agents found' });
    }

    // Return the list of delivery agent
    res.status(200).json({ message: 'Delivery agents retrieved successfully', agent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch delivery agents' });
  }
};





module.exports={handleAddDeliveryAgent,handleDeleteDeliveryAgent,handleGetAllDeliveryAgents,handleUpdateDeliveryAgent}