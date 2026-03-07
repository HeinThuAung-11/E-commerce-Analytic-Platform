import { apiClient } from "../../services/http";
import { clearAccessToken, setAccessToken } from "./token-store";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "ANALYST";
};

type AuthEnvelope = {
  data: {
    accessToken: string;
    user: AuthUser;
  };
};

export type LoginInput = {
  email: string;
  password: string;
};

export type LoginResult = {
  accessToken: string;
  user: AuthUser;
};

export async function login(input: LoginInput): Promise<LoginResult> {
  const response = await apiClient.post<AuthEnvelope>("/auth/login", input);
  const accessToken = response.data.data.accessToken;
  const user = response.data.data.user;

  setAccessToken(accessToken);

  return {
    accessToken,
    user,
  };
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post("/auth/logout", {});
  } finally {
    clearAccessToken();
  }
}
