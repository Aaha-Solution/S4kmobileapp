import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const AboutScreen = ({ navigation }) => {
  const menuItems = [
    { label: 'Explore Topics', icon: 'compass', screen: 'Explore' },
    { label: 'Notifications', icon: 'bell', screen: 'Notifications' },
    { label: 'Settings', icon: 'settings', screen: 'Settings', selected: true },
    { label: 'Logout', icon: 'log-out', screen: 'Logout' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
          style={styles.avatar}
        />
        <Text style={styles.username}>Angga Risky</Text>
      </View>

      {menuItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.menuItem, item.selected && styles.selectedItem]}
          onPress={() => navigation.navigate(item.screen)}
        >
          <Icon name={item.icon} size={20} color="#A78BFA" />
          <Text style={styles.menuText}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginBottom: 8,
  },
  selectedItem: {
    backgroundColor: '#F3E8FF',
  },
  menuText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
  },
});

export default AboutScreen;
