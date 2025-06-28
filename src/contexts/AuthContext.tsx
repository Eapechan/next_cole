import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'mine-operator' | 'regulator' | 'admin';
  mineId?: string;
  organization: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, name: string, role: string, organization: string, mineId?: string) => Promise<boolean>;
  isLoading: boolean;
  isAuthenticated: boolean;
  setDataInitializer: (initializer: (userId: string) => void) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user database - now stored in localStorage for persistence
const getMockUsers = () => {
  const stored = localStorage.getItem('coalmine_mock_users');
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Default users
  const defaultUsers = [
    {
      id: '1',
      email: 'operator@nextcoal-initiative.gov.in',
      password: 'password123',
      name: 'Rajesh Kumar',
      role: 'mine-operator' as const,
      mineId: 'MINE001',
      organization: 'Eastern Coalfields Limited'
    },
    {
      id: '2',
      email: 'regulator@nextcoal-initiative.gov.in',
      password: 'password123',
      name: 'Dr. Priya Sharma',
      role: 'regulator' as const,
      organization: 'Central Pollution Control Board'
    },
    {
      id: '3',
      email: 'admin@nextcoal-initiative.gov.in',
      password: 'password123',
      name: 'Administrator',
      role: 'admin' as const,
      organization: 'Ministry of Coal'
    }
  ];
  
  localStorage.setItem('coalmine_mock_users', JSON.stringify(defaultUsers));
  return defaultUsers;
};

const saveMockUsers = (users: any[]) => {
  localStorage.setItem('coalmine_mock_users', JSON.stringify(users));
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataInitializer, setDataInitializer] = useState<((userId: string) => void) | null>(null);

  useEffect(() => {
    // Check for stored user data on app load
    const storedUser = localStorage.getItem('coalmine_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('coalmine_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUsers = getMockUsers();
    const foundUser = mockUsers.find(u => 
      u.email === email && 
      u.password === password && 
      u.role === role
    );

    if (foundUser) {
      const userData: User = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role,
        mineId: foundUser.mineId,
        organization: foundUser.organization
      };
      
      setUser(userData);
      localStorage.setItem('coalmine_user', JSON.stringify(userData));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const register = async (
    email: string, 
    password: string, 
    name: string, 
    role: string, 
    organization: string, 
    mineId?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockUsers = getMockUsers();
    
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      setIsLoading(false);
      return false; // User already exists
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(), // Simple ID generation
      email,
      password,
      name,
      role: role as 'mine-operator' | 'regulator' | 'admin',
      organization,
      mineId: role === 'mine-operator' ? mineId : undefined
    };
    
    // Add to mock database
    mockUsers.push(newUser);
    saveMockUsers(mockUsers);
    
    // Initialize empty emission data for the new user
    if (dataInitializer) {
      dataInitializer(newUser.id);
    }
    
    // Auto-login the new user
    const userData: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      mineId: newUser.mineId,
      organization: newUser.organization
    };
    
    setUser(userData);
    localStorage.setItem('coalmine_user', JSON.stringify(userData));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('coalmine_user');
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    register,
    isLoading,
    isAuthenticated: !!user,
    setDataInitializer
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 