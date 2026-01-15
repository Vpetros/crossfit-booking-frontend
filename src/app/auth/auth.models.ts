export interface LoginRequest {
  username: string;
  password: string;
}


export interface LoginResponse {
  token: string;
  username: string;
  role: string;
  type: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  roles?: string[]; 
}

export interface MessageResponse {
  message: string;
}