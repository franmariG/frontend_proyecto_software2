import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Entypo from "@expo/vector-icons/Entypo";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import url from "@/constants/url";

export default function BuscarUsuario() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
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
    setUsers([]);

    try {
      const token = await getToken();
      let response;
      if (searchType === "id") {
        response = await fetch(url + `api/getUser/${search}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        });
      } else {
        response = await fetch(url + `api/getUserByName`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({ name: search }),
        });
      }

      const data = await response.json();
      //console.log(data);

      if (searchType === "id") {
        setUsers(data.userFound ? [data.userFound] : []);
      } else {
        setUsers(Array.isArray(data.usersFound) ? data.usersFound : []);
      }
    } catch (error) {
      console.error("Error al buscar usuario", error);
      setUsers([]);
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

      <Text style={styles.Usuariostitle}>USUARIOS</Text>

      {/* barra de búsqueda */}
      <View style={styles.barra}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder={
              searchType === "id"
                ? "Buscar usuario por ID"
                : "Buscar usuario por nombre"
            }
            placeholderTextColor="#888"
            value={search}
            onChangeText={setSearch}
          />
          <MaterialCommunityIcons
            name="account-search-outline"
            size={26}
            color="#797979"
          />
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
      ) : (
        <ScrollView>
          {users.length > 0 ? (
            users.map((user) => (
              <View key={user._id} style={styles.userCard}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <View style={styles.icon}>
                    <FontAwesome name="user-circle" size={14} color="#8f2319" />
                    <Text style={styles.userDetail}> ID: {user._id}</Text>
                  </View>
                  <View style={styles.icon}>
                    <Entypo name="mail-with-circle" size={15} color="#8f2319" />
                    <Text style={styles.userDetail}> {user.email}</Text>
                  </View>
                </View>
                <View style={styles.circleContainer}>
                  <Image
                    source={{
                      uri: user.fotoPerfil || "https://via.placeholder.com/80",
                    }}
                    style={styles.userImage}
                  />
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noResults}>No se encontraron usuarios.</Text>
          )}
        </ScrollView>
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

  Usuariostitle: {
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
    marginBottom: 10,
  },

  linea: {
    width: "100%",
    borderWidth: 0.3,
    borderColor: "#ccc",
    marginBottom: 25,
  },

  input: {
    flex: 1,
    height: 40,
    color: "#000",
  },
  searchButton: {
    padding: 5,
  },

  button: {
    backgroundColor: "#029cec",
    paddingVertical: 10,
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
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontFamily: "OpenSans-Bold",
    marginBottom: 15,
  },
  icon: {
    marginLeft: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  userDetail: {
    fontSize: 11,
    fontFamily: "Open-Sans",
    color: "#000",
    marginBottom: 2,
    marginRight: 10,
  },
  userImage: {
    width: "98%",
    height: "98%",
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#fff",
  },
  circleContainer: {
    width: 80,
    height: 80,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#800000",
    justifyContent: "center",
    alignItems: "center",
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
