import express from "express";
import sequelize from "./db.js";
import userRoutes from "./routes/userRoutes.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const app = express();
const SECRET_KEY = "your_jwt_secret_key"; // Use environment variables for security

app.use(express.json());

// Use user routes
app.use("/users", userRoutes);

// Middleware for checking JWT token
const authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Authorization token is required" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next(); // User is authenticated, proceed to the next middleware/route
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Login route to authenticate user and return JWT token
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ userId: user.id }, SECRET_KEY, {
      expiresIn: "1h", // Token expiration time
    });

    res.status(200).json({ token, userId: user.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError") {
    return res.status(400).json({
      error: err.errors.map((e) => e.message).join(", "),
    });
  }

  res.status(err.status || 500).json({
    error: err.message || "An unexpected error occurred.",
  });
});

// Start the server
const PORT = 5000;

sequelize
  .sync()
  .then(() => {
    console.log("Database connected successfully!");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to the database:", err.message);
  });
