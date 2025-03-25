import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import ModalCrearLocal from "../components/ModalCrearLocal";
import Notificacion from "@/components/ModalNotificacion";
import ListaRestaurantes from "@/components/ListaRestaurantes";
import { useCookies } from "react-cookie";
import { jwtDecode as decode } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import url from "@/constants/url";

export default function LocalesPropios() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [cookies] = useCookies(["token"]);
  const [notificacionVisible, setNotificacionVisible] = useState(false);
  const [notificacionMensaje, setNotificacionMensaje] = useState("");
  const [notificacionExito, setNotificacionExito] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const getLocalesPropios = async () => {
    const response = await fetch(url + "api/getRestaurants", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + (await getToken()),
      },
    });

    if (response.status === 200) {
      const data = await response.json();

      if (!data.restaurantsFound) {
        setLoading(false);
        setRestaurants([]);
      }
      // Procesamos los datos para agregar promedio de calificación y cantidad de comentarios
      const processedRestaurants = data.restaurantsFound.map((restaurant) => {
        const reviews = restaurant.reviews || []; // Si no tiene reviews, ponemos un array vacío
        const totalReviews = reviews.length;

        // Calcular promedio de calificación
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
        };
      });
      setRestaurants(processedRestaurants);
    } else {
      console.log("error");
      console.log(response);
    }
    setLoading(false);
  };

  useEffect(() => {
    getLocalesPropios();
  }, []);

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
      <View style={styles.titleContainer}>
        <Text style={styles.localTitle}>LOCAL</Text>
        <TouchableOpacity
          style={{
            padding: 10,
          }}
          onPress={() => setModalVisible(true)}
        >
          <View style={styles.createButton}>
            <Text style={styles.createButtonText}>Crear</Text>
            <Ionicons name="add-circle-outline" size={22} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFF" />
        </View>
      ) : restaurants.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No has creado ningún Local aún.</Text>
        </View>
      ) : (
        <ListaRestaurantes restaurants={restaurants} />
      )}
      <ModalCrearLocal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={(mensaje, esExito) => {
          setNotificacionMensaje(mensaje);
          setNotificacionExito(esExito);
          setNotificacionVisible(true);

          if (esExito) {
            setLoading(true);
            getLocalesPropios(); // Recargar la lista de locales solo si fue exitoso
            setModalVisible(false); // Cerrar modal de creación
          }
        }}
      />

      <Notificacion
        isVisible={notificacionVisible}
        isSuccess={notificacionExito}
        message={notificacionMensaje}
        onClose={() => setNotificacionVisible(false)}
      />
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
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
  },
  localTitle: {
    fontFamily: "Helios-Bold",
    fontSize: 24,
    color: "#fff",
    marginVertical: 15,
    marginLeft: 20,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00bf62",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 5,
    marginRight: 20,
    right: -10,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 14,
    marginRight: 5,
    fontFamily: "OpenSans-Bold",
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
