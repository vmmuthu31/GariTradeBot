import axios from "axios";

const API_BASE_URL = "https://sandbox-api.okto.tech";

const oktoClientApiKey = "YOUR_CLIENT_API_KEY";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "x-api-key": oktoClientApiKey,
    "Content-Type": "application/json",
    accept: "application/json",
  },
});

const Google_Token =
  "0ATx3LY4pLoNwkxLrFvOYDPgfaUl36kArCjNKFqJjBLrdjx8IvhNeXQZVwAQJs3V_dw0DrQ";

export const authenticate = async (idToken) => {
  const response = await api.post("/api/v1/authenticate", {
    id_token: idToken,
  });
  return response.data;
};

export const setPin = async (idToken, token, pin) => {
  const response = await api.post("/api/v1/set_pin", {
    id_token: idToken,
    token: token,
    relogin_pin: pin,
    purpose: "set_pin",
  });
  return response.data;
};

export const createWallet = async (authToken) => {
  const response = await api.post(
    "/api/v1/wallet",
    {},
    {
      headers: { Authorization: `Bearer ${authToken}` },
    }
  );
  return response.data;
};

export const refreshToken = async (authToken, refreshToken, deviceToken) => {
  const response = await api.post(
    "/api/v1/refresh_token",
    {},
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "x-refresh-authorization": `Bearer ${refreshToken}`,
        "x-device-token": deviceToken,
      },
    }
  );
  return response.data;
};

export const logout = async (authToken) => {
  const response = await api.post(
    "/api/v1/logout",
    {},
    {
      headers: { Authorization: `Bearer ${authToken}` },
    }
  );
  return response.data;
};

export const getUserDetails = async (authToken) => {
  const response = await api.get("/api/v1/user_from_token", {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  return response.data;
};

export const getWallets = async (authToken) => {
  const response = await api.get("/api/v1/wallet", {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  return response.data;
};

export const getSupportedNetworks = async (authToken) => {
  const response = await api.get("/api/v1/supported/networks", {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  return response.data;
};

export const getSupportedTokens = async (authToken, page = 1, size = 10) => {
  const response = await api.get(
    `/api/v1/supported/tokens?page=${page}&size=${size}`,
    {
      headers: { Authorization: `Bearer ${authToken}` },
    }
  );
  return response.data;
};

export const getUserPortfolio = async (authToken) => {
  const response = await api.get("/api/v1/portfolio", {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  return response.data;
};

export const transferTokens = async (
  authToken,
  networkName,
  tokenAddress,
  quantity,
  recipientAddress
) => {
  const response = await api.post(
    "/api/v1/transfers/tokens/execute",
    {
      network_name: networkName,
      token_address: tokenAddress,
      quantity: quantity,
      recipient_address: recipientAddress,
    },
    {
      headers: { Authorization: `Bearer ${authToken}` },
    }
  );
  return response.data;
};

export const getOrderHistory = async (
  authToken,
  offset = 0,
  limit = 10,
  orderId,
  orderState
) => {
  const response = await api.get(
    `/api/v1/orders?offset=${offset}&limit=${limit}&order_id=${orderId}&order_state=${orderState}`,
    {
      headers: { Authorization: `Bearer ${authToken}` },
    }
  );
  return response.data;
};
