import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import ListaRestaurantes from "@/components/ListaRestaurantes";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import url from "@/constants/url";

export default function BuscarLocal() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [searchType, setSearchType] = useState("id");
  const [loading, setLoading] = useState(false);

  const getToken = async () => {
    try {
      const value = await AsyncStorage.getItem("token");
      if (value != null) {
        return value;
      }
    } catch (e) {
      console.log(e);
      return null;
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setResults([]);

    try {
      const token = await getToken();
      let response;
      if (searchType === "id") {
        response = await fetch(url + `api/getRestaurant/${search}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        });
      } else {
        response = await fetch(url + `api/getRestaurantsByName`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({ name: search }),
        });
      }

      const data = await response.json();
      console.log(response.status);
      //console.log(data);

      if (response.status === 200) {
        console.log("Buscando usuario con:", JSON.stringify({ name: search }));
        // Procesar los restaurantes
        const processedRestaurants = (
          searchType === "id" ? [data.restaurantFound] : data.restaurantsFound
        ).map((restaurant) => {
          const reviews = restaurant.reviews || [];
          const totalReviews = reviews.length;
          console.log(
            "Buscando usuario2 con:",
            JSON.stringify({ name: search })
          );
          // Calcular promedio de calificación
          const totalCalification = reviews.reduce((sum, review) => {
            const calification = Number(review.calification);
            return !isNaN(calification) ? sum + calification : sum;
          }, 0);

          const avgCalification =
            totalReviews > 0
              ? (totalCalification / totalReviews).toFixed(1)
              : "N/A";

          return {
            ...restaurant,
            avgCalification,
            totalReviews,
          };
        });

        setResults(processedRestaurants);
      } else {
        console.log("Error al buscar");
        setResults([]);
      }
    } catch (error) {
      console.error("Error al buscar restaurant", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={require("@/assets/images/backButtonLocal.png")}
            style={styles.iconBack}
          />
        </TouchableOpacity>
        <Image
          source={require("@/assets/images/logo_recortado.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>FOODIGO</Text>
      </View>

      <Text style={styles.sectionTitle}>LOCALES</Text>

      <View style={styles.barra}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder={
              searchType === "id"
                ? "Buscar local por ID"
                : "Buscar local por nombre"
            }
            placeholderTextColor="#888"
            value={search}
            onChangeText={setSearch}
          />

          <MaterialCommunityIcons name="magnify" size={26} color="#797979" />
        </View>

        <View style={styles.toggleContainer}>
          <TouchableOpacity onPress={() => setSearchType("id")}>
            <Text
              style={searchType === "id" ? styles.activeToggle : styles.toggle}
            >
              Buscar por ID
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSearchType("nombre")}>
            <Text
              style={
                searchType === "nombre" ? styles.activeToggle : styles.toggle
              }
            >
              Buscar por Nombre
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSearch}>
          <Text style={styles.buttonText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.linea}></View>

      {loading ? (
        <ActivityIndicator size="large" color="#029cec" />
      ) : results.length === 0 ? (
        <Text style={styles.noResults}>No se encontro ningun local </Text>
      ) : (
        <ListaRestaurantes restaurants={results} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    marginLeft: 20,
    marginTop: 40,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  iconBack: {
    width: 35,
    height: 35,
    marginRight: 10,
  },
  logo: {
    width: 20,
    height: 30,
    marginRight: 2,
  },
  title: {
    fontFamily: "League-Gothic",
    fontSize: 32,
    color: "#000",
  },
  sectionTitle: {
    fontFamily: "Helios-Bold",
    fontSize: 28,
    color: "#000",
    marginVertical: 15,
    marginLeft: 40,
  },

  barra: {
    alignItems: "center",
  },

  searchContainer: {
    width: "80%",
    marginTop: 25,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 35,
  },
  input: {
    flex: 1,
    height: 40,
    color: "#000",
  },

  button: {
    backgroundColor: "#029cec",
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 35,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "OpenSans-Bold",
  },

  linea: {
    width: "100%",
    borderWidth: 0.3,
    borderColor: "#ccc",
    marginBottom: 25,
  },

  noResults: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#888",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  toggle: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginHorizontal: 5,
    backgroundColor: "#f9f9f9",
    color: "#888",
  },
  activeToggle: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: "#029cec",
    borderRadius: 8,
    marginHorizontal: 5,
    backgroundColor: "#f9f9f9",
    color: "#000",
  },
});
