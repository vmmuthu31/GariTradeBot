const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");

const GOOGLE_CLIENT_ID =
  "948097968037-19c38q8nidr4l1rjpk0cqlj70r7gbn8h.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";
const GOOGLE_REDIRECT_URI = "http://localhost:8000/oauth2/callback/google";
const OKTO_API_BASE_URL = "https://sandbox-api.okto.tech";
const OKTO_CLIENT_API_KEY = "2272ebbe-9201-424c-a2d7-5e7b903e0bea";

const googleClient = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

const oktoApi = axios.create({
  baseURL: OKTO_API_BASE_URL,
  headers: {
    "x-api-key": OKTO_CLIENT_API_KEY,
    "Content-Type": "application/json",
    accept: "application/json",
  },
});

async function authenticateWithGoogle() {
  const authUrl = googleClient.generateAuthUrl({
    access_type: "offline",
    scope: ["profile", "email"],
  });

  console.log("Authorize this app by visiting this url:", authUrl);

  // Get the authorization code from the user
  const code =
    "0ATx3LY4pLoNwkxLrFvOYDPgfaUl36kArCjNKFqJjBLrdjx8IvhNeXQZVwAQJs3V_dw0DrQ";

  const { tokens } = await googleClient.getToken(code);
  googleClient.setCredentials(tokens);
  return tokens.id_token;
}

export async function authenticateWithOkto(idToken) {
  const response = await oktoApi.post("/api/v1/authenticate", {
    id_token: idToken,
  });
  return response.data.token;
}

async function main() {
  try {
    const idToken = await authenticateWithGoogle();
    const oktoToken = await authenticateWithOkto(idToken);
    console.log("Okto Authentication successful, token:", oktoToken);
    return oktoToken;
  } catch (error) {
    console.error("Error during authentication:", error);
  }
}

main();
