import React, { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";
import { authenticate } from "./services/oktoService"; // Ensure this path is correct
import { makeRedirectUri } from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest(
    {
      androidClientId:
        "948097968037-ropins17kslkieuuvv751sm1jq6jj481.apps.googleusercontent.com",
      iosClientId:
        "948097968037-ropins17kslkieuuvv751sm1jq6jj481.apps.googleusercontent.com",
      webClientId:
        "948097968037-ropins17kslkieuuvv751sm1jq6jj481.apps.googleusercontent.com",
    },
    { native: "myapp" } // Use your scheme here
  );

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;

      // Authenticate with Okto using the obtained id_token
      authenticate(id_token)
        .then((result) => {
          console.log("Authentication successful:", result);
          // Handle successful authentication (e.g., navigate to another screen)
        })
        .catch((error) => {
          console.error("Authentication error:", error);
          // Handle authentication error (e.g., show an error message)
        });
    }
  }, [response]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Pressable
        disabled={!request}
        onPress={() => {
          promptAsync();
        }}
        style={{ padding: 10, backgroundColor: "#4285F4", borderRadius: 5 }}
      >
        <Text style={{ color: "#fff" }}>Connect with Google</Text>
      </Pressable>
    </View>
  );
};

export default LoginScreen;
