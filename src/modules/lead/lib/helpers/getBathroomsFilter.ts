import { Lead } from 'src/common/types';

const getBathroomsFilter = (
  from: Lead['bathrooms_from'],
  to: Lead['bathrooms_to'],
): string => {
  let filter = '';

  if (from) {
    filter = filter.concat(` and bathrooms >= ${from} `);
  }
  if (to) {
    filter = filter.concat(` and bathrooms <= ${to} `);
  }

  return filter;
};

export { getBathroomsFilter };
