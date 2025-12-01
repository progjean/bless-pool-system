export enum UserRole {
  ADMIN = 'admin',
  SUPERVISOR = 'supervisor',
  TECHNICIAN = 'technician'
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  name: string;
  // Preparado para expansão futura
  companyId?: string;
  companyName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading?: boolean;
}

