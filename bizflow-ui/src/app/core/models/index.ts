export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  organizationId: string;
  branchId?: string;
  role: UserRole;
  status: UserStatus;
  theme: 'light' | 'dark';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  organization?: Organization;
  branch?: Branch;
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

export interface Organization {
  id: string;
  name: string;
  code: string;
  logo?: string;
  description?: string;
  email: string;
  phone?: string;
  address?: string;
  country?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  organizationId: string;
  location?: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: Date;
}
