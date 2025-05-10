import React, { useState, useEffect } from 'react';  
import { useSelector } from 'react-redux';
import { setProfile } from '../Store/userSlice';
import { View, StyleSheet, Text, Pressable, SafeAreaView, Image, ScrollView } from 'react-native';
import PressableButton from '../Components/PressableButton';
import profile_avatar from '../assets/image/profile_avatar.png';
import LinearGradient from 'react-native-linear-gradient';



const ViewProfileScreen = ({ route, navigation }) => {
const [isValid, setIsValid] = useState(false);

// Update validation logic based on form fields
useEffect(() => {
  const isFormValid = firstname && surename && address && dateOfBirth && phone;
  setIsValid(isFormValid);
}, [firstname, surename, address, dateOfBirth, phone]);

 const { firstname, surename, address, dateOfBirth, phone } = useSelector((state) => state.user.user);



  const handleEditPress = () => {
    navigation.navigate('EditProfile');
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[ '#E0B0FF', '#ffffff']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <View style={styles.header}>
            <View style={styles.profileContainer}>
              <Image
                source={profile_avatar}
                style={styles.avatar}
                resizeMode="cover"
              />
              
            </View>
          </View>

          <Text style={styles.name}>{firstname}</Text>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name</Text>
              <Text style={styles.readonlyText}>{firstname}</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Sure Name</Text>
              <Text style={styles.readonlyText}>{surename}</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Birth</Text>
              <Text style={styles.readonlyText}>{dateOfBirth}</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <Text style={styles.readonlyText}>{phone}</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address</Text>
              <Text style={[styles.readonlyText, { minHeight: 80 }]}>{address}</Text>
            </View>

            <PressableButton 
              style={styles.saveButton} 
              title="Edit" 
              onPress={handleEditPress} 
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

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
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#8A2BE2',
    padding: 8,
    borderRadius: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'purple',
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: 'black',
    marginBottom: 8,
  },
  readonlyText: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#333',
  },
});

export default ViewProfileScreen;
