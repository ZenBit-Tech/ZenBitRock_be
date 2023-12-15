import { Property } from './property-type';

type MatchingPropertiesResponse = {
  data: Property[];
  pagination: {
    count: number;
  };
};

export { type MatchingPropertiesResponse };
