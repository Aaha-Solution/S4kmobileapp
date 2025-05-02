import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, Pressable, Image, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/Ionicons';


const AccountScreen = ({ route, navigation }) => {
  const { username } = route.params || { username: 'Guest User' };
   const [name, setName] = useState(username);
  // const [email, setEmail] = useState(username === 'Guest User' ? 'guest@example.com' : `${username}@example.com`);
  // const [phone, setPhone] = useState('');

  const menuItems = [
    { icon: 'person-outline', label: 'Profile', screen: 'EditProfile'},
    { icon: 'lock-closed-outline', label: 'Change Password', screen: 'Change Password' },
  ];
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: 'https://www.shutterstock.com/image-vector/anime-boy-character-isolated-icon-260nw-2199560737.jpg' }}
            style={styles.avatar}
            resizeMode="cover"
          />
          <Pressable style={styles.editButton}>
            <Ionicons name="camera" size={20} color="#fff" />
          </Pressable>
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

      {/* <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setUsername}
            placeholder="Enter your full name"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
          />
        </View>

        <Pressable style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </Pressable>

      </View> */}

    </ScrollView>
  );
};

export default AccountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#7F00FF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
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
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#8A2BE2',
    padding: 8,
    borderRadius: 20,
  },
  formContainer: {
    padding: 20,
    marginTop: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  saveButton: {
    backgroundColor: '#7F00FF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
