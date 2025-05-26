import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, Alert, ScrollView, Pressable } from 'react-native';
import PressableButton from '../Components/PressableButton';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

const ChangePasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCurrentPasswordVisible, setCurrentPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isCurrentPasswordValid, setIsCurrentPasswordValid] = useState(false);

  const validateCurrentPassword = (password) => {
    // Add your current password validation logic here
    // For example, check against stored password
    if (password.length >= 6) {
      setIsCurrentPasswordValid(true);
    } else {
      setIsCurrentPasswordValid(false);
    }
  };

  const handleCurrentPasswordChange = (text) => {
    setCurrentPassword(text);
    validateCurrentPassword(text);
  };

  const handleChangePassword = () => {
    if (!email || !currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      Alert.alert(
        'Error',
        'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    // Add password change logic here
    Alert.alert(
      'Success',
      'Password changed successfully',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

    const handleCancel = () => {
      navigation.goBack();
    };
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#f9f9f9', '#fff']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView style={styles.container}>
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-Mail</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your E-Mail"
              secureTextEntry={false}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current Password</Text>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={handleCurrentPasswordChange}
              placeholder="Enter current password"
              secureTextEntry={!isCurrentPasswordVisible}
              placeholderTextColor="#999"
            />
            <Pressable style={styles.icon} onPress={() => setCurrentPasswordVisible(!isCurrentPasswordVisible)}>
              <Icon name={isCurrentPasswordVisible ? 'eye-off' : 'eye'} size={20} color="#888" />
            </Pressable>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={[styles.input, !isCurrentPasswordValid && styles.disabledInput]}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              secureTextEntry={!isNewPasswordVisible}
              placeholderTextColor="#999"
              editable={isCurrentPasswordValid}
            />
            <Pressable 
              style={[styles.icon, !isCurrentPasswordValid && styles.disabledIcon]} 
              onPress={() => isCurrentPasswordValid && setNewPasswordVisible(!isNewPasswordVisible)}
            >
              <Icon 
                name={isNewPasswordVisible ? 'eye-off' : 'eye'} 
                size={20} 
                color={isCurrentPasswordValid ? "#888" : "#ccc"} 
              />
            </Pressable>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput
              style={[styles.input, !isCurrentPasswordValid && styles.disabledInput]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              secureTextEntry={!isConfirmPasswordVisible}
              placeholderTextColor="#999"
              editable={isCurrentPasswordValid}
            />
            <Pressable 
              style={[styles.icon, !isCurrentPasswordValid && styles.disabledIcon]} 
              onPress={() => isCurrentPasswordValid && setConfirmPasswordVisible(!isConfirmPasswordVisible)}
            >
              <Icon 
                name={isConfirmPasswordVisible ? 'eye-off' : 'eye'} 
                size={20} 
                color={isCurrentPasswordValid ? "#888" : "#ccc"} 
              />
            </Pressable>
          </View>

          <View style={styles.buttonContainer}>
          <PressableButton
            style={[styles.saveButton, !isCurrentPasswordValid && styles.disabledButton]}
            title="Update"
            onPress={handleChangePassword}
          />
          <PressableButton
            style={[styles.cancelButton, !isCurrentPasswordValid && styles.disabledButton]}
            title="Cancel"
            onPress={handleCancel}
          />

          </View>
         
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 20,
    position: 'relative',
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
    color: '#999',
  },
  icon: {
    position: 'absolute',
    right: 15,
    top: 45,
    zIndex: 1,
  },
  disabledIcon: {
    opacity: 0.5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    maxHeight: 80,
  },
  saveButton: {
    backgroundColor: '#8A2BE2',
    padding: 10,
    width: '100%',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    flex: 1,
    marginRight: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    padding: 10,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1, // Make it take up equal space
    marginLeft: 5,
  }
});

export default ChangePasswordScreen;