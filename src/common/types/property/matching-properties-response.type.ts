import { Property } from './property-type';

type MatchingPropertiesResponse = {
  data: Property[];
  pagination: {
    count: number;
    page_count: number;
    current_page: number;
    has_next_page: boolean;
    has_prev_page: boolean;
  };
};

export { type MatchingPropertiesResponse };
