export interface LoginRequestDto {
  username: string
  password: string
}

export interface AuthenticationResponseDto {
  accessToken: string
}
