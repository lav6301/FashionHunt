import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const User = sequelize.define(
  "User", // This will map to `users` table
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    underscored: true, 
    createdAt: "created_at", 
    updatedAt: "updated_at", 
  }
);

export default User;
