import React, { useState, useEffect } from 'react';
import { View,  StyleSheet, Text, Pressable, Image, ScrollView, BackHandler } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import profile_avatar from '../assets/image/profile_avatar.png';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AccountScreen = ({ route, navigation }) => {
  const { email } = route.params || { email: 'Guest User' };
  const [name, setName] = useState(email);
  const [selectedAvatar, setSelectedAvatar] = useState(profile_avatar);
  
  useEffect(() => {
    loadSelectedAvatar();
  }, []);

  const loadSelectedAvatar = async () => {
    try {
      const savedAvatar = await AsyncStorage.getItem('selectedAvatar');
      if (savedAvatar) {
        setSelectedAvatar(JSON.parse(savedAvatar));
      }
    } catch (error) {
      console.log('Error loading avatar:', error);
    }
  };

  const menuItems = [
    { icon: 'person-outline', label: 'Profile', screen: 'ViewProfile', params: { email: name }},
    { icon: 'lock-closed-outline', label: 'Change Password', screen: 'ChangePasswordScreen' },
  ];

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.navigate('MainTabs', {
        screen: 'Setting'
      });
      return true;
    });

    return () => backHandler.remove();
  }, [navigation]);

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={['#87CEEB', '#ADD8E6', '#F0F8FF']} style={styles.container}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.profileContainer}>
            <Image
              source={selectedAvatar}
              style={styles.avatar}
              resizeMode="cover"
            />
            <Text style={styles.name}>
				<Text style={{color: '#6E00B3'}}>My </Text>
				<Text style={{color: 'black'}}>Account</Text>
			</Text>
          </View>
        </View>

        {/* list item */}
        <ScrollView style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <Pressable 
              key={index} 
              style={({ pressed }) => [
								styles.menuItem,
								pressed && styles.menuItemPressed
							]}
              onPress={() => {
                if (item.label === 'Log out') {
                  handleLogout();
                } else {
                  navigation.navigate(item.screen, item.params);
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

        

      </ScrollView>
      </LinearGradient>
    </View>
  );
};

export default AccountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
   
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 110,
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
  name: {
    color: 'Black',
    fontSize: 18,
    fontWeight: 'bold',
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
  menuItemPressed: {
		transform: [{ scale: 0.98 }],
		shadowOpacity: 0.22,
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
