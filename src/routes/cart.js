const express = require("express");
const { User } = require("../db");
const { Product } = require("../db/models/Product");
const { getErrors } = require("../helpers");
const auth = require("./middlewares/auth");

const cartRouter = express.Router();

cartRouter.get("/api/cart", auth, async (req, res) => {
  const user = req.user;

  try {
    if (!user.cart) {
      throw new Error(`no cart for ${user._id}`);
    }

    let products = [];
    for (let pid of user.cart) {
      const prod = await Product.findById(pid);
      if (prod) {
        products.push(prod);
      }
    }

    res.send({ status: true, cart: products });
  } catch (error) {
    const validationErr = getErrors(error);
    console.log(validationErr);
    return res
      .status(401)
      .send({ status: false, type: "VALIDATION", error: validationErr });
  }
});

// Add product specified with _id to the cart for authorized users.
cartRouter.post("/api/cart/:_id", auth, async (req, res) => {
  const { _id } = req.params;
  const user = req.user;

  if (!_id) {
    return res
      .status(401)
      .send({ status: false, type: "INVALID", error: "invalid request body" });
  }

  try {
    const product = await Product.findById(_id);
    if (!product) {
      throw new Error(`no product found ${_id}`);
    }

    let u = await User.findByIdAndUpdate(
      user._id,
      { $push: { cart: _id } },
      { returnOriginal: false, new: true }
    );
    u = u.toObject();
    delete u.password;

    res.send({ status: true, user: u });
  } catch (error) {
    const validationErr = getErrors(error);
    console.log(validationErr);
    return res
      .status(401)
      .send({ status: false, type: "VALIDATION", error: validationErr });
  }
});

// Add product specified with _id to the cart for authorized users.
cartRouter.delete("/api/cart/:_id", auth, async (req, res) => {
  const { _id } = req.params;
  const user = req.user;

  if (!_id) {
    return res
      .status(401)
      .send({ status: false, type: "INVALID", error: "invalid request body" });
  }

  try {
    const product = await Product.findById(_id);
    if (!product) {
      throw new Error(`no product found ${_id}`);
    }

    let u = await User.findById(user._id);

    u = u.toObject();
    if (Array.isArray(u.cart) && u.cart.length > 0) {
      idx = u.cart.findIndex((pid) => pid == _id);
      if (idx > -1) {
        u.cart.splice(idx, 1);
      } else {
        throw new Error("cannot find product in the basket");
      }
    } else if (Array.isArray(u.cart) || u.cart.length == 0) {
      throw new Error("cart is empty");
    } else if (!Array.isArray(u.cart)) {
      throw new Error("invalid cart");
    }

    await User.findByIdAndUpdate(user._id, u);
    delete u.password;

    res.send({ status: true, user: u });
  } catch (error) {
    const validationErr = getErrors(error);
    console.log(validationErr);
    return res
      .status(401)
      .send({ status: false, type: "VALIDATION", error: validationErr });
  }
});

module.exports = { cartRouter };