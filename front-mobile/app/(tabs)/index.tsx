import { Text, View, StyleSheet } from "react-native";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View
      style={styles.view}
    >
      <Text>Bienvenido</Text>
      <Link href="/logout" style={styles.linkButton}>
        <Text style={styles.linkButtonText}>Face ID</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  linkButton:{
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkButtonText:{
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
  
})
