import { Lead } from 'src/common/types';

const getSellingPriceFilter = (
  from: Lead['list_selling_price_from'],
  to: Lead['list_selling_price_from'],
): string => {
  let filter = '';

  if (from) {
    filter = filter.concat(` and list_selling_price_amount >= ${from}`);
  }
  if (to) {
    filter = filter.concat(` and list_selling_price_amount <= ${to}`);
  }

  return filter;
};

export { getSellingPriceFilter };
