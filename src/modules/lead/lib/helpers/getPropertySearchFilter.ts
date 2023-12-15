import { Lead } from 'src/common/types';
import { getBathroomsFilter } from './getBathroomsFilter';
import { getSellingPriceFilter } from './getSellingPriceFilter';

const DEFAULT_FILTER = `status == "available"`;

const getPropertySearchFilter = (lead: Lead): string => {
  let filter = DEFAULT_FILTER;

  const {
    bathrooms_from,
    bathrooms_to,
    list_selling_price_from,
    list_selling_price_to,
  } = lead;

  filter = filter
    .concat(getBathroomsFilter(bathrooms_from, bathrooms_to))
    .concat(
      getSellingPriceFilter(list_selling_price_from, list_selling_price_to),
    );

  return filter;
};

export { getPropertySearchFilter };
