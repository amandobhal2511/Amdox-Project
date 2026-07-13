/**
 * Inventory stock status business logic
 */

/**
 * Determine stock status based on quantity
 * @param {number} quantity
 * @returns {'Out of Stock' | 'Low Stock' | 'In Stock'}
 */
const getStockStatus = (quantity) => {
  const qty = parseInt(quantity, 10);
  if (qty === 0) return 'Out of Stock';
  if (qty < 10) return 'Low Stock';
  return 'In Stock';
};

module.exports = { getStockStatus };
