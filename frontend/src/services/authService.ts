/**
 * Authentication service for backend API
 */

export interface User {
  user_id: string;
  email: string;
  full_name: string;
  name?: string; // Alias for full_name
  jobTitle?: string;
  location?: string;
  skills?: string[];
  experience?: string;
  bio?: string;
  profilePicture?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

class AuthService {
  private baseUrl = 'http://localhost:8000/api/v1/auth';
  private currentUser: User | null = null;
  private accessToken: string | null = null;

  constructor() {
    // Load user from localStorage on initialization
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    try {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('access_token');
      
      if (userData && token) {
        this.currentUser = JSON.parse(userData);
        this.accessToken = token;
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      this.clearStorage();
    }
  }

  private saveUserToStorage(user: User, token: string) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('access_token', token);
    this.currentUser = user;
    this.accessToken = token;
  }

  private clearStorage() {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUser = null;
    this.accessToken = null;
  }

  async register(data: RegisterRequest): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      const result: LoginResponse = await response.json();
      
      // Save tokens
      localStorage.setItem('refresh_token', result.refresh_token);
      this.saveUserToStorage(result.user, result.access_token);
      
      return result.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async login(data: LoginRequest): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const result: LoginResponse = await response.json();
      
      // Save tokens
      localStorage.setItem('refresh_token', result.refresh_token);
      this.saveUserToStorage(result.user, result.access_token);
      
      return result.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  logout() {
    this.clearStorage();
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null && this.accessToken !== null;
  }

  // Helper method to get authorization headers
  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }
}

export const authService = new AuthService();