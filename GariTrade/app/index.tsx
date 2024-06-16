import { Link } from "@react-navigation/native";
import React from "react";
import { View, Text } from "react-native";

export default function Home() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Home Screen</Text>
      <Link to="/Login">Go to Login Details</Link>
      <Link to="/UserProfile">Go to User Profile Details</Link>
      <Link to="/SupportedChains">Go to Supported Chains</Link>
      <Link to="/TransferNFT">Go to Transfer NFT</Link>
      <Link to="/TransferTokens">Go to Transfer Tokens</Link>
    </View>
  );
}
