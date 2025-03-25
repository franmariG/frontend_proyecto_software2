import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import ListaRestaurantes from "@/components/ListaRestaurantes";
import { useRouter } from "expo-router";
import { useCookies } from "react-cookie";
import { jwtDecode as decode } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import url from "@/constants/url";

export default function ListaMeGusta() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cookies] = useCookies(["token"]);

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

  const getUserId = async () => {
    const token = await getToken();
    if (!token) return null;

    const decoded = decode(token);
    return decoded.sub;
  };

  const getListaMeGusta = async () => {
    setLoading(true);
    const response = await fetch(
      url + "api/getRestaurantsLiked/" + (await getUserId()),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + (await getToken()),
        },
      }
    );

    //console.log(response);

    if (response.status === 200) {
      const data = await response.json();

      if (!data.restaurants) {
        setLoading(false);
        setRestaurants([]);
      }

      // Procesamos los datos para agregar promedio de calificación y cantidad de comentarios
      const processedRestaurants = data.restaurants.map((restaurant) => {
        const reviews = restaurant.reviews || []; // Si no tiene reviews, ponemos un array vacío
        const totalReviews = reviews.length;

        // Calcular promedio de calificación
        //console.log("Datos del restaurante:", restaurant.name, restaurant.reviews);
        const totalCalification = restaurant.reviews.reduce((sum, review) => {
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
          liked: true, // Add liked property to each restaurant
        };
      });
      setRestaurants(processedRestaurants);
    } else {
      console.log("Failed to fetch liked restaurants");
    }
    setLoading(false);
  };

  useEffect(() => {
    getListaMeGusta();
    //console.log(getUserId());
  }, []);

  const removeRestaurantFromLiked = async (restaurantId) => {
    const response = await fetch(
      url + `api/deleteRestaurantFromLiked/${await getUserId()}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + (await getToken()),
        },
        body: JSON.stringify({ idRestaurants: [restaurantId] }),
      }
    );

    // console.log(response);

    if (response.status === 200) {
      const data = await response.json();
      console.log("Restaurant removed:", data);
      return true;
    } else {
      console.log("Failed to remove restaurant");
      return false;
    }
  };

  const handleHeartPress = async (index) => {
    const restaurant = restaurants[index];
    //console.log("Restaurant ID:", restaurant._id);
    const success = await removeRestaurantFromLiked(restaurant._id);
    if (success) {
      setRestaurants((prevRestaurants) => {
        const updatedRestaurants = [...prevRestaurants];
        updatedRestaurants.splice(index, 1);
        return updatedRestaurants;
      });
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/historial (2).png")}
        style={styles.background}
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/mainpage")}>
          <Image
            source={require("@/assets/images/icono_atras.png")}
            style={styles.iconBack}
          />
        </TouchableOpacity>
        <Image
          source={require("@/assets/images/logo_recortado.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>FOODIGO</Text>
      </View>

      {/* Mostrar indicador de carga si los datos aún se están cargando */}
      <Text style={styles.meGustaTitle}>ME GUSTA</Text>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFF" />
        </View>
      ) : restaurants.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No has dado me gusta a un restaurante aún.
          </Text>
        </View>
      ) : (
        <ListaRestaurantes
          restaurants={restaurants}
          handleHeartPress={handleHeartPress}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  header: {
    marginLeft: 30,
    marginTop: 40,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  iconBack: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  logo: {
    width: 20,
    height: 30,
    marginRight: 2,
  },
  title: {
    fontFamily: "League-Gothic",
    fontSize: 32,
    color: "#fff",
  },
  meGustaTitle: {
    fontFamily: "Helios-Bold",
    fontSize: 24,
    color: "#fff",
    marginVertical: 15,
    marginLeft: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});
