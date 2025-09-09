import { Tabs } from "expo-router";
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';

export default function RootLayout() {
  return(
    <Tabs screenOptions={{tabBarActiveTintColor: "coral"}}>
      <Tabs.Screen name="index" options={{title: "Home", tabBarIcon: ({color})=> (
        <AntDesign name="home" size={24} color={color} />)
      }}></Tabs.Screen>
      <Tabs.Screen name="logout" options={{title: "Logout", tabBarIcon: ({color}) => (
        <Entypo name="log-out" size={24} color={color} />
      )}}/>
    </ Tabs>
  );
}
