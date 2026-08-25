import { post, type ApiResponse } from '@/api/client';

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface RegisterResponse {
  id: number;
  username: string;
}

interface LoginDto {
  username: string;
  password: string;
}

interface RegisterDTO extends LoginDto {
  confirm_password: string;
}

export const authApi = {
  login: async (credentials: LoginDto): Promise<ApiResponse<LoginResponse>> => {
    return post<LoginResponse, LoginDto>('token/', credentials);
  },
  register: async (credentials: RegisterDTO): Promise<ApiResponse<RegisterResponse>> => {
    return post<RegisterResponse, RegisterDTO>('register/', credentials);
  }
};
