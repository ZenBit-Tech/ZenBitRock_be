type UserInfoResponse = {
  email: string;
  id: string;
  isAdmin: boolean;
  isVerified: boolean;
  isNewbie: boolean;
  firstName: string;
  lastName: string;
  role: string;
  city: string;
  country: string;
  phone: string;
  qobrixContactId: string;
  qobrixAgentId: string;
  qobrixUserId: string;
  agencyName: string;
  description: string;
  avatarUrl: string;
  avatarPublicId: string;
  isDeleted: boolean;
  receiveNotifications: boolean;
};

export { type UserInfoResponse };
