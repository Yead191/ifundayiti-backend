import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ICart } from './cart.interface';
import { Cart } from './cart.model';
import { JwtPayload } from 'jsonwebtoken';
import { CartHelper } from './cart.helper';

const addProductIntoCart = async (data: ICart) => {
  const isExistCart = await Cart.findOne({
    user: data.user,
    product: data.product,
  });

  if (isExistCart) {
    const result = await Cart.findOneAndUpdate(
      { user: data.user, product: data.product },
      { $inc: { quantity: data.quantity } },
      { new: true },
    );
    return result;
  }

  const result = await Cart.create(data);
  return result;
};

const increaseOrDecreseQuantity = async (id: string, amount: number) => {
  const isCartExist = await Cart.findOne({ _id: id });

  if (!isCartExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Cart not found');
  }
  if (isCartExist.quantity === 1 && amount === -1) {
    const result = await Cart.findByIdAndDelete({ _id: id });
    return result;
  }

  const result = await Cart.findOneAndUpdate(
    { _id: id },
    { $inc: { quantity: amount } },
    { new: true },
  );
  return result;
};

const deleteProductFromCart = async (id: string) => {
  const result = await Cart.findByIdAndDelete({ _id: id });
  return result;
};

const getCartOfUser = async (user: JwtPayload) => {
  const myCart = await Cart.find(
    { user: user.id },
    { product: 1, quantity: 1, total_price: 1, unit_price: 1 },
  )
    .populate('product', 'title image')
    .exec();
  const price_breakdown = CartHelper.calculateThePrice(myCart);
  return { cart: myCart, price_breakdown };
};

export const CartServices = {
  increaseOrDecreseQuantity,
  addProductIntoCart,
  deleteProductFromCart,
  getCartOfUser,
};
