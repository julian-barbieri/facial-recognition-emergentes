import { View, Text, StyleSheet } from "react-native";

export default function index(){
    return(
        <View       
        style={styles.view}>
            <Text>The login page</Text>
        </View>
    );
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    }
  
})