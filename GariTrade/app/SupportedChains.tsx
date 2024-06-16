import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { getSupportedNetworks, getSupportedTokens } from "rn-okto-sdk";

const SupportedChainScreen = () => {
  const [networks, setNetworks] = useState([]);
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    getSupportedNetworks((result, error) => {
      if (error) {
        console.error("Error fetching supported networks:", error);
      } else {
        setNetworks(result);
      }
    });

    getSupportedTokens((result, error) => {
      if (error) {
        console.error("Error fetching supported tokens:", error);
      } else {
        setTokens(result);
      }
    });
  }, []);

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: "#fff",
        flex: 1,
        padding: 20,
      }}
    >
      <View style={{ flex: 0.5 }}>
        <Text>Supported Networks</Text>
        <View>
          {networks.map((network, index) => (
            <View key={index} style={{ marginVertical: 10 }}>
              <Text>{network.network_name}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={{ flex: 0.5 }}>
        <Text>Supported Tokens</Text>
        <View>
          {tokens.map((token, index) => (
            <View key={index} style={{ marginVertical: 10 }}>
              <Text>{token.token_name}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default SupportedChainScreen;
