import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import useLocation from "../../hooks/useLocation";
import FooterMenu from "@/components/Menus/FooterMenu";

const PetrolScreen = () => {
  // location hook
  const { address, lat, long, erroMsg } = useLocation();
  const [liters, setLiters] = useState("");
  const [currentPetrolPrice, setCurrentPetrolPrice] = useState(null);
  const [totalCost, setTotalCost] = useState(0);
  const DELIVERY_CHARGE = 50;

  useEffect(() => {
    const fetchFuelPrices = async () => {
      try {
        const { data } = await axios.get(${process.env.RAPID_API_URL}, {
          headers: {
            "x-rapidapi-host": ${process.env.RAPID_API_HOST},
            "x-rapidapi-key": ${process.env.RAPID_API_KEY},
          },
        });

        if (data && data.fuel) {
          const petrolPrice = data.fuel.petrol.retailPrice;
          setCurrentPetrolPrice(petrolPrice);
        } else {
          console.error("Unexpected response structure:", data);
        }
      } catch (error) {
        if (error.response) {
          console.error("Error fetching fuel prices:", error.response.data);
          Alert.alert("Error", error.response.data.message);
        } else if (error.request) {
          console.error("No response received from the server:", error.request);
          Alert.alert(
            "Error",
            "No response from the server. Please check your connection."
          );
        } else {
          console.error("Error in setup:", error.message);
          Alert.alert("Error", "An unexpected error occurred.");
        }
      }
    };
    fetchFuelPrices();
  }, []);

  const handleOrder = async () => {
    if (!liters || !address) {
      Alert.alert("Error", "Please enter both liters and location");
      return;
    }

    try {
      await axios.post("/order", {
        type: "petrol",
        liters,
        location: address,
        latitude: lat,
        longitude: long,
        totalCost,
      });

      // Show success alert with response data if needed
      Alert.alert(
        "Success",
        Order placed successfully! Total cost: ${totalCost}
      );
      setLiters("");
    } catch (error) {
      console.log("Order failed:", error);
      Alert.alert("Error", "Failed to place order. Please try again.");
    }
  };
  const handleLitersChange = (text) => {
    const value = parseFloat(text);
    setLiters(text);
    if (!isNaN(value) && currentPetrolPrice) {
      // Update total cost whenever liters is changed
      setTotalCost(value * currentPetrolPrice + DELIVERY_CHARGE);
    } else {
      setTotalCost(DELIVERY_CHARGE); // Just the delivery charge if no valid liters
    }
  };
  return (
    <>
      <View style={styles.container}>
        <ScrollView>
          <Text style={styles.title}>Order Petrol</Text>

          <Text style={styles.infoText}>Petrol In Liters:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter liters"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={liters}
            onChangeText={handleLitersChange} // Updated handler
          />
          <Text style={styles.infoText}>Current Address:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter live location"
            placeholderTextColor="#888"
            value={address}
            multiline
            editable={false} // Make it readonly if only displaying address from location hook
          />
          <Text style={styles.infoText}>
            Current Price per Liter (Petrol):{" "}
            {currentPetrolPrice || "Loading..."}
          </Text>
          <Text style={styles.infoText}>
            Delivery Charge: {DELIVERY_CHARGE}
          </Text>
          <Text style={styles.infoText}>Total Charges: {totalCost}</Text>
          <Button
            style={{
              magin: "50",
            }}
            title="Order Petrol"
            onPress={handleOrder}
            color="#ff9966"
          />
        </ScrollView>
      </View>
      <FooterMenu />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#121212", // Dark background
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ff9966", // Primary color for dark theme
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    color: "#ddd", // Light text color
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#333",
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    color: "#fff",
    backgroundColor: "#1F1F1F",
  },
  subtitle: {
    fontSize: 18,
    color: "#ff9966",
    marginVertical: 10,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  itemText: {
    color: "#ddd",
  },
});