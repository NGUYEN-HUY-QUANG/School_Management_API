import { Role } from '../emuns/role.enum';

export interface AuthUser {
  id: string; // userId
  email: string;
  role: Role;
}