const userService = require("../services/user");

async function getUsers(req, res) {
  try {
    const users = await userService.getUsers();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);  // Log the error for debugging
    res.status(500).json({ message: "Failed to load users: " + error.message });
  }
}

module.exports = { getUsers };
