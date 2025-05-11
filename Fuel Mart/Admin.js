import FooterMenu from "@/components/Menus/FooterMenu";
import AdminOrderCard from "@/components/Orders/AdminOrderCard"; // Import AdminOrderCard directly
import { OrderContext } from "@/context/orderContext"; // Importing OrderContext
import axios from "axios";
import React, { useCallback, useContext, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const AdminDashboard = () => {
  const orderContext = useContext(OrderContext);

  // Ensure orderContext is an array before destructuring
  if (!Array.isArray(orderContext)) {
    console.error("OrderContext is not an array:", orderContext);
    return null; // Return null or a fallback UI
  }

  // Destructure context values: orders, loading, and getAllOrders function
  const [orders, loading, getAllOrders] = orderContext;
  const [refreshing, setRefreshing] = useState(false);

  // Handle status update by passing the orderId and new status to the backend
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      // Make a PUT request to update the status of the order
      const response = await axios.put(/order/${orderId}/status, {
        status: newStatus,
      });

      if (response.status === 200) {
        await getAllOrders(); // Refresh the orders after successful update
      } else {
        console.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true); // Start the refreshing animation
    await getAllOrders(); // Re-fetch orders
    setRefreshing(false); // Stop the refreshing animation after fetching
  }, [getAllOrders]);
  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <Text style={styles.loadingText}>Loading orders...</Text>
        ) : orders?.length === 0 ? (
          <Text style={styles.noOrdersText}>No orders available.</Text>
        ) : (
          orders?.map((order) => (
            <AdminOrderCard
              key={order._id}
              order={order}
              onUpdateStatus={handleUpdateStatus}
            />
          ))
        )}
      </ScrollView>
      <FooterMenu />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212", // Dark background
  },
  loadingText: {
    color: "#ff9966",
    textAlign: "center",
    marginTop: 20,
  },
  noOrdersText: {
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 20,
  },
});
