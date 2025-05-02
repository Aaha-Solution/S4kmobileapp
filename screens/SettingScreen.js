import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image, SafeAreaView, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../Store/userSlice';
import Icon from 'react-native-vector-icons/Ionicons';

const menuItems = [
  { icon: 'person-outline', label: 'Profile', screen: 'Profile' },
  { icon: 'person-outline', label: 'Account', screen: 'Account' },
  { icon: 'notifications-outline', label: 'Notifications', screen: 'Notifications' },
  { icon: 'help-circle-outline', label: 'Support', screen: 'Support' },
  { icon: 'share-social-outline', label: 'Share', screen: 'Share' },
  { icon: 'log-out-outline', label: 'Log out', screen: 'Log out' },
];

const SettingsScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => {
            dispatch(logout());
            navigation.goBack();
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: 'https://www.shutterstock.com/image-vector/anime-boy-character-isolated-icon-260nw-2199560737.jpg' }}
            style={styles.avatar}
            resizeMode="cover"
          />
          <View>
            <Text style={styles.name}>{user.firstname} {user.surename}</Text>
            <Text style={styles.email}>{user.firstname === 'Guest User' ? 'guest@example.com' : `${user.firstname}@example.com`}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <Pressable 
            key={index} 
            style={styles.menuItem}
            onPress={() => {
              if (item.label === 'Log out') {
                handleLogout();
              } else {
                navigation.navigate(item.screen);
              }
            }}
          >
            <View style={styles.iconLabel}>
              <Icon name={item.icon} size={22} color="#5A5A5A" />
              <Text style={styles.label}>{item.label}</Text>
            </View>
            <Icon name="chevron-forward" size={20} color="#B0B0B0" />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    marginTop: -20,
    paddingVertical: 30,
    paddingHorizontal: 20,
    //backgroundColor: '#7F00FF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems:'center',
    justifyContent:'center',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 15,
    borderWidth: 2,
    borderColor: 'Black',
  },
  name: {
    color: 'Black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  email: {
    color: 'Black',
    fontSize: 14,
  },
  menuContainer: {
    marginTop: 10,
  },
  menuItem: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  iconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
});

export default SettingsScreen;