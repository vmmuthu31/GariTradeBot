import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { useRoute } from "@react-navigation/native";
import { orderHistory } from "rn-okto-sdk";

const OrderDetailsScreen = () => {
  const route = useRoute();
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);

  useEffect(() => {
    orderHistory((result, error) => {
      if (error) {
        console.error("Error fetching order details:", error);
        return;
      }
      const order = result.find((order) => order.order_id === orderId);
      if (order) setOrder(order);
    });
  }, [orderId]);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", padding: 20 }}>
      <Text>Order Details</Text>
      {order ? (
        <View>
          <Text>Order ID: {order.order_id}</Text>
          <Text>Order Type: {order.order_type}</Text>
          <Text>Order Status: {order.status}</Text>
          <Text>Transaction Hash: {order.transaction_hash}</Text>
          <Text>Network Name: {order.network_name}</Text>
        </View>
      ) : (
        <Text>Loading order details...</Text>
      )}
    </View>
  );
};

export default OrderDetailsScreen;
