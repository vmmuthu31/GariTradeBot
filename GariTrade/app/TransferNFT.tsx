import React, { useState } from "react";
import { View, TextInput, Button, Text } from "react-native";
import { transferNFT } from "rn-okto-sdk";

const TransferNFTScreen = () => {
  const [networkName, setNetworkName] = useState("APTOS_TESTNET");
  const [collectionAddress, setCollectionAddress] = useState(
    "0x171e643e8e8dabc66b838b9055dbdf88647cf6601b164f5987f50a497bedfbe1"
  );
  const [collectionName, setCollectionName] = useState("super avengers");
  const [quantity, setQuantity] = useState("1");
  const [recipientAddress, setRecipientAddress] = useState(
    "0x46e5fb2f9af287a5bcd9756ff35494c41b7371446da3daf98e1f1de58331c55f"
  );
  const [nftAddress, setNftAddress] = useState(
    "0xf137ad32d4d695c9eb7cb4831e6198924afe5fb8c51576e8a5b5b07f6da8e0d3"
  );

  const handleSubmit = () => {
    transferNFT(
      "NFT_TRANSFER",
      quantity,
      recipientAddress,
      networkName,
      nftAddress,
      collectionAddress,
      collectionName,
      (result, error) => {
        if (error) {
          console.error("Error:", error);
        } else {
          console.log(result);
        }
      }
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", padding: 20 }}>
      <Text>Transfer NFT</Text>
      <TextInput
        value={networkName}
        onChangeText={setNetworkName}
        placeholder="Enter Network Name"
      />
      <TextInput
        value={collectionAddress}
        onChangeText={setCollectionAddress}
        placeholder="Enter Collection Address"
      />
      <TextInput
        value={collectionName}
        onChangeText={setCollectionName}
        placeholder="Enter Collection Name"
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
      <TextInput
        value={nftAddress}
        onChangeText={setNftAddress}
        placeholder="Enter NFT Address"
      />
      <Button title="Transfer NFT" onPress={handleSubmit} />
    </View>
  );
};

export default TransferNFTScreen;
