export type UserRole = "admin" | "user";

export interface UserDTO {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash?: string;
}
