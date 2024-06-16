import React, { useState } from "react";
import { View, TextInput, Button, Text } from "react-native";
import { transferFunds } from "rn-okto-sdk";

const TransferTokensScreen = () => {
  const [networkName, setNetworkName] = useState("APTOS_TESTNET");
  const [tokenAddress, setTokenAddress] = useState(
    "0x1::aptos_coin::AptosCoin"
  );
  const [quantity, setQuantity] = useState("1");
  const [recipientAddress, setRecipientAddress] = useState(
    "0x6b244684313dd6a9fc75c8e76cb648d407374d59970583dd990c686cda767984"
  );

  const handleSubmit = () => {
    transferFunds(
      networkName,
      tokenAddress,
      recipientAddress,
      quantity,
      (result, error) => {
        if (error) {
          console.log("Transfer error:", error);
        } else {
          console.log("Transfer success:", result);
        }
      }
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", padding: 20 }}>
      <Text>Transfer Tokens</Text>
      <TextInput
        value={networkName}
        onChangeText={setNetworkName}
        placeholder="Enter Network Name"
      />
      <TextInput
        value={tokenAddress}
        onChangeText={setTokenAddress}
        placeholder="Enter Token Address"
      />
      <TextInput
        value={quantity}
        onChangeText={setQuantity}
        placeholder="Enter Quantity"
      />
      <TextInput
        value={recipientAddress}
        onChangeText={setRecipientAddress}
        placeholder="Enter Recipient Address"
      />
      <Button title="Transfer Tokens" onPress={handleSubmit} />
    </View>
  );
};

export default TransferTokensScreen;
