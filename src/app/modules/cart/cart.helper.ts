import { ICart } from './cart.interface';

const calculateThePrice = (cartItems: ICart[], discountPercent: number = 0) => {
  const products_price = cartItems.reduce(
    (acc, item) =>
      acc + (Number(item.unit_price) || 0) * (Number(item.quantity) || 1),
    0,
  );

  // If cart is empty, delivery fee & tax are 0
  const delivery_charge = products_price > 0 ? 8 : 0;
  const serviceFee = 0;
  const tax =
    products_price > 0 ? Math.round(products_price * 0.07 * 100) / 100 : 0;

  const subtotal = products_price;
  const baseTotal = subtotal + serviceFee + delivery_charge + tax;

  let discount_amount = 0;
  if (discountPercent > 0) {
    discount_amount =
      Math.round(subtotal * (discountPercent / 100) * 100) / 100;
  }

  const total_price = Math.max(
    0,
    Math.round((baseTotal - discount_amount) * 100) / 100,
  );

  return {
    products_price: Math.round(products_price * 100) / 100,
    subtotal: Math.round(subtotal * 100) / 100,
    serviceFee,
    delivery_charge,
    tax,
    discount_amount,
    total_price,
  };
};

export const CartHelper = {
  calculateThePrice,
};
