import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  type: 'patient' | 'hospital' | 'admin' | 'doctor' | 'receptionist' | 'nurse' | 'pharmacist' | 'manager';
}

export interface PendingHospital {
  id: string;
  name: string;
  email: string;
  date: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (data: Record<string, string>, type: 'patient' | 'hospital') => Promise<{ pending?: boolean }>;
  signOut: () => void;
  // Admin functions
  pendingHospitals: PendingHospital[];
  fetchPendingHospitals: () => Promise<void>;
  approveHospital: (id: string) => Promise<void>;
  rejectHospital: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = 'http://localhost:5000/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingHospitals, setPendingHospitals] = useState<PendingHospital[]>([]);

  // Initialize session from localStorage token
  useEffect(() => {
    const storedUser = localStorage.getItem('medicare_session');
    const storedToken = localStorage.getItem('medicare_token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (e) {
        localStorage.removeItem('medicare_session');
        localStorage.removeItem('medicare_token');
      }
    }
    setLoading(false);
  }, []);

  const setSession = (userData: User, tokenStr: string) => {
    setUser(userData);
    setToken(tokenStr);
    localStorage.setItem('medicare_session', JSON.stringify(userData));
    localStorage.setItem('medicare_token', tokenStr);
  };

  const clearSession = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('medicare_session');
    localStorage.removeItem('medicare_token');
  };

  const signIn = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    
    setSession(data.user, data.token);
    return data.user;
  };

  const signUp = async (data: Record<string, string>, type: 'patient' | 'hospital') => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, type })
    });
    
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.error || 'Registration failed');

    if (type === 'patient') {
      setSession(resData.user, resData.token);
    }
    
    return { pending: resData.pending };
  };

  const signOut = () => clearSession();

  // --- Admin API Calls ---
  
  const getAuthHeaders = () => {
    const token = localStorage.getItem('medicare_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchPendingHospitals = async () => {
    if (user?.type !== 'admin') return;
    try {
      const res = await fetch(`${API_URL}/admin/pending`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setPendingHospitals(data);
      }
    } catch (error) {
      console.error('Error fetching pending hospitals:', error);
    }
  };

  const approveHospital = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/approve/${id}`, { 
        method: 'POST', 
        headers: getAuthHeaders() 
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to approve');
      }
      setPendingHospitals(prev => prev.filter(h => h.id !== id));
    } catch (error: any) {
      alert(error.message);
    }
  };

  const rejectHospital = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/reject/${id}`, { 
        method: 'POST', 
        headers: getAuthHeaders() 
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to reject');
      }
      setPendingHospitals(prev => prev.filter(h => h.id !== id));
    } catch (error: any) {
      alert(error.message);
    }
  };

  // Automatically fetch pending hospitals if logged in as admin
  useEffect(() => {
    if (user?.type === 'admin') {
      fetchPendingHospitals();
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ 
      user, token, loading, signIn, signUp, signOut, 
      pendingHospitals, fetchPendingHospitals, approveHospital, rejectHospital 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
