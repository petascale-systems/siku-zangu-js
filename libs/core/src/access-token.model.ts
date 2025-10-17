import { User } from './user.model';

export type AccessToken = {
  token: string;
  expires_in: number;  
  user: User;
}