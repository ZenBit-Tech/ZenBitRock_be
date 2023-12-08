import { UserInfoResponse } from './user-info-response';

type UserSignInResponse = {
  user: UserInfoResponse;
  token: string;
};

export { type UserSignInResponse };
