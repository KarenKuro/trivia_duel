import { UserStatus } from '@common/enums';

export interface IUser {
  id: number;
  uid: string;
  name: string;
  email: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}
