import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, Pressable, Image, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AccountScreen = ({ route, navigation }) => {
  const { username } = route.params || { username: 'Guest User' };
  const [name, setName] = useState(username);
  const [email, setEmail] = useState(username === 'Guest User' ? 'guest@example.com' : `${username}@example.com`);
  const [phone, setPhone] = useState('+1 234 567 8900');

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

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
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

        <Pressable style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </Pressable>
      </View>
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
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
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
