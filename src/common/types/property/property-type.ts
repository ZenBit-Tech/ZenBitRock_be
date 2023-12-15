type Property = {
  id: string;
  bathrooms: number | null;
  bedrooms: number | null;
  property_type: string;
  sale_rent: string | null;
  saleRent: string | null;
  status: string | null;
  country: string;
  city: string;
  price: number;
  list_selling_price_amount: number;
  list_rental_price_amount: number | null;
  media: { file: { thumbnails: { medium: string } } }[];
  photo: string;
};

export { type Property };
