
export type ProfileType = {
  address1?: string;
  address2?: string;
  city?: string;
  county?: string;
  postcode?: string;
  country?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_status?: string;
  subscription_tier?: string;
};

export type AuthUser = {
  id: string;
  email?: string;
  [key: string]: any;
};
