export const genOrderId = (existingOrders) => {
  const ids = new Set(existingOrders.map((o) => o.id));
  let id;
  do {
    id = Math.floor(Math.random() * 900000 + 100000);
  } while (ids.has(id));
  return id;
};