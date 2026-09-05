import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IAddToCart } from './cart.interface';
import { Cart } from './cart.model';
import { JwtPayload } from 'jsonwebtoken';
import { CartHelper } from './cart.helper';
import { Product } from '../product/product.model';
import { Types } from 'mongoose';

// ======================================================
// Add Product to Cart
// ======================================================

const addProductIntoCart = async (user: JwtPayload, data: IAddToCart) => {
  const { product, size, color, quantity } = data;

  if (!Types.ObjectId.isValid(product)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid product ID');
  }

  // 1. Find product
  const productInfo = await Product.findById(product);

  if (!productInfo) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
  }

  // 2. Check product status
  if (productInfo.status !== 'active') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'This product is not currently available for purchase',
    );
  }

  // 3. Find exact variant matching size & color (case-insensitive & trimmed)
  const variant = productInfo.variants.find(
    item =>
      item.size.trim().toLowerCase() === size.trim().toLowerCase() &&
      item.color.trim().toLowerCase() === color.trim().toLowerCase(),
  );

  if (!variant) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Selected size and color combination is not available',
    );
  }

  // 4. Check stock availability
  if (!variant.isPreOrder && variant.stock < quantity) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Only ${variant.stock} item(s) available in stock for ${variant.size} / ${variant.color}`,
    );
  }

  // 5. Check if user already has this variant in their cart
  const existingCart = await Cart.findOne({
    user: user.id,
    product,
    size: variant.size,
    color: variant.color,
  });

  if (existingCart) {
    const newQuantity = existingCart.quantity + quantity;

    // Check stock against total combined quantity
    if (!variant.isPreOrder && newQuantity > variant.stock) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Only ${variant.stock} item(s) available in stock. You already have ${existingCart.quantity} in your cart.`,
      );
    }

    existingCart.quantity = newQuantity;
    existingCart.unit_price = productInfo.price;
    existingCart.total_price =
      Math.round(productInfo.price * newQuantity * 100) / 100;

    await existingCart.save();

    return existingCart;
  }

  // 6. Create new cart item
  const result = await Cart.create({
    user: user.id,
    product,
    size: variant.size,
    color: variant.color,
    quantity,
    unit_price: productInfo.price,
    total_price: Math.round(productInfo.price * quantity * 100) / 100,
  });

  return result;
};

// ======================================================
// Increase / Decrease Quantity (+1 / -1)
// ======================================================

const increaseOrDecreaseQuantity = async (
  user: JwtPayload,
  cartId: string,
  quantity: number,
) => {
  if (!Types.ObjectId.isValid(cartId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid cart item ID');
  }

  const cart = await Cart.findOne({
    _id: cartId,
    user: user.id,
  });

  if (!cart) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Cart item not found');
  }

  // Decrease quantity by 1 (removes item if quantity reaches 0)
  if (quantity === -1) {
    if (cart.quantity <= 1) {
      await Cart.findByIdAndDelete(cart._id);
      return null;
    }

    cart.quantity -= 1;
    cart.total_price = Math.round(cart.unit_price * cart.quantity * 100) / 100;
    await cart.save();
    return cart;
  }

  // Increase quantity by 1
  if (quantity === 1) {
    const product = await Product.findById(cart.product);

    if (!product || product.status !== 'active') {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'This product is no longer available',
      );
    }

    const variant = product.variants.find(
      item =>
        item.size.trim().toLowerCase() === cart.size.trim().toLowerCase() &&
        item.color.trim().toLowerCase() === cart.color.trim().toLowerCase(),
    );

    if (!variant) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'This product variant is no longer available',
      );
    }

    const newQuantity = cart.quantity + 1;

    if (!variant.isPreOrder && newQuantity > variant.stock) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Only ${variant.stock} item(s) available in stock`,
      );
    }

    cart.quantity = newQuantity;
    cart.unit_price = product.price;
    cart.total_price = Math.round(product.price * newQuantity * 100) / 100;

    await cart.save();
    return cart;
  }

  throw new ApiError(
    StatusCodes.BAD_REQUEST,
    'Quantity adjustment must be either 1 or -1',
  );
};

// ======================================================
// Remove Single Item From Cart
// ======================================================

const removeProductFromCart = async (user: JwtPayload, cartId: string) => {
  if (!Types.ObjectId.isValid(cartId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid cart item ID');
  }

  const result = await Cart.findOneAndDelete({
    _id: cartId,
    user: user.id,
  });

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Cart item not found');
  }

  return null;
};

// ======================================================
// Get User Cart with Dynamic Price Breakdown
// ======================================================

const getCartOfUser = async (user: JwtPayload) => {
  const cart = await Cart.find({ user: user.id })
    .populate({
      path: 'product',
      select: 'name images price compareAtPrice status variants category',
    })
    .lean();

  const price_breakdown = CartHelper.calculateThePrice(cart);

  return {
    cart,
    price_breakdown,
  };
};

// ======================================================
// Clear Entire User Cart
// ======================================================

const clearCart = async (user: JwtPayload) => {
  await Cart.deleteMany({
    user: user.id,
  });

  return null;
};

export const CartServices = {
  addProductIntoCart,
  increaseOrDecreaseQuantity,
  removeProductFromCart,
  getCartOfUser,
  clearCart,
};
