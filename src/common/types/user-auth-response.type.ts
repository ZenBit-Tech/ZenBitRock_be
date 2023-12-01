import { UserProfileResponse } from './user-profile-response.type';

type UserAuthResponse = {
  user: UserProfileResponse;
  token: string;
};

export { type UserAuthResponse };
