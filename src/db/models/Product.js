const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ProductSchema = new Schema(
  {
    productName: {
      type: String,
      required: [true, "Product Name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product Description is required"],
      trim: true,
    },
    unitPrice: {
      type: Number,
      required: [true, "Unit Price is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    imagePath: { type: String, default: "" },
  },
  { versionKey: false }
);

const Product = mongoose.model("Product", ProductSchema);
module.exports = { Product, ProductSchema };
