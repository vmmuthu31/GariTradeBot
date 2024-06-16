import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  getUserDetails,
  getWallets,
  authenticate,
} from "./services/oktoService";
import axios from "axios";

const UserProfileScreen = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [userWallets, setUserWallets] = useState([]);
  const [authToken, setAuthToken] = useState("");
  const navigation = useNavigation();
  const idToken =
    "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36kArCjNKFqJjBLrdjx8IvhNeXQZVwAQJs3V_dw0DrQ"; // Replace with the actual ID token
  const oktoClientApiKey = "2272ebbe-9201-424c-a2d7-5e7b903e0bea";
  const API_BASE_URL = "https://sandbox-api.okto.tech";

  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "x-api-key": oktoClientApiKey,
      "Content-Type": "application/json",
      accept: "application/json",
    },
  });

  useEffect(() => {
    const authenticateAndFetchData = async () => {
      try {
        const authResponse = await authenticate(idToken);
        const token = authResponse.data.token;
        setAuthToken(token);

        const userDetailsResponse = await getUserDetails(token);
        setUserDetails(userDetailsResponse.data);

        const userWalletsResponse = await getWallets(token);
        setUserWallets(userWalletsResponse.data.wallets);
      } catch (error) {
        console.error(
          "Error during authentication or fetching data:",
          error.response.data
        );
      }
    };

    authenticateAndFetchData();
  }, [idToken]);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", padding: 20 }}>
      <Text>User Details</Text>
      {userDetails ? (
        <View>
          <Text>ID: {userDetails.user_id}</Text>
          <Text>Email: {userDetails.email}</Text>
        </View>
      ) : (
        <Text>Loading user details...</Text>
      )}
      <Text>User Wallets</Text>
      {userWallets.length > 0 ? (
        userWallets.map((wallet, index) => (
          <View key={index} style={{ marginVertical: 10 }}>
            <Text>Network: {wallet.network_name}</Text>
            <Text>Address: {wallet.address}</Text>
          </View>
        ))
      ) : (
        <Text>Loading user wallets...</Text>
      )}
    </View>
  );
};

export default UserProfileScreen;
