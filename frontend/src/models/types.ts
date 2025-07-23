// Matches the backend User model
export interface User {
  id: number;
  uuid: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced' | 'pro';
  weight?: string;
  height?: number;
  avatarUrl?: string;
  createdAt: string;
}

// For user registration
export type RegisterData = Omit<User, 'id' | 'uuid' | 'createdAt'> & {
  password?: string;
};
