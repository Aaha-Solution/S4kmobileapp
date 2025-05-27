import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text, Pressable, SafeAreaView, Image, ScrollView, Alert, Modal, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/Ionicons';
import PressableButton from '../Components/PressableButton';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import profile_avatar from '../assets/image/profile_avatar.png';
import { useDispatch } from 'react-redux';
import { setProfile } from '../Store/userSlice';

const EditProfileScreen = ({ route, navigation, }) => {
    const dispatch = useDispatch();
    const [firstname, setFirstName] = useState(route.params?.username);
    const [surename, setSureName] = useState(route.params?.surename);
    const [address, setAddress] = useState(route.params?.address);
    const [dateOfBirth, setDateOfBirth] = useState(route.params?.dateOfBirth);
    const [dateError, setDateError] = useState('');
    const [phone, setPhone] = useState(route.params?.phone);
    const [selectedAvatar, setSelectedAvatar] = useState(profile_avatar);
    const [tempSelectedAvatar, setTempSelectedAvatar] = useState(profile_avatar);
    const [modalVisible, setModalVisible] = useState(false);

    const avatars = [
        require('../assets/image/profile_avatar.png'),
        require('../assets/image/avatar1.png'),
        require('../assets/image/avatar2.png'),
        require('../assets/image/avatar3.png'),
        require('../assets/image/avatar4.png'),
        require('../assets/image/avatar5.png'),
    ];

    const loadSelectedAvatar = async () => {
        try {
            const savedAvatar = await AsyncStorage.getItem('selectedAvatar');
            if (savedAvatar) {
                setSelectedAvatar(JSON.parse(savedAvatar));
                setTempSelectedAvatar(JSON.parse(savedAvatar));
            }
        } catch (error) {
            console.log('Error loading avatar:', error);
        }
    };

    useEffect(() => {
		loadSelectedAvatar();
	}, []);
    
    const validateDate = (date) => {
        // Remove any non-numeric characters
        const cleanedDate = date.replace(/[^\d]/g, '');
        
        // Format the date as user types
        let formattedDate = '';
        if (cleanedDate.length > 0) {
            formattedDate = cleanedDate.slice(0, 2);
            if (cleanedDate.length > 2) {
                formattedDate += '/' + cleanedDate.slice(2, 4);
                if (cleanedDate.length > 4) {
                    formattedDate += '/' + cleanedDate.slice(4, 8);
                }
            }
        }

        // Validate the date
        if (formattedDate.length === 10) {
            const [day, month, year] = formattedDate.split('/').map(Number);
            const date = new Date(year, month - 1, day);
            
            // Check if the date is valid
            if (isNaN(date.getTime()) || 
                date.getDate() !== day || 
                date.getMonth() !== month - 1 || 
                date.getFullYear() !== year) {
                setDateError('Please enter a valid date');
            } else {
                setDateError('');
            }
        } else if (formattedDate.length > 0) {
            setDateError('Please complete the date');
        } else {
            setDateError('');
        }

        return formattedDate;
    };

    const handleDateChange = (text) => {
        const formattedDate = validateDate(text);
        setDateOfBirth(formattedDate);
    };

    const isValid = firstname && surename && dateOfBirth && phone && address;

    const handleSave = async () => {
        if(isValid) {
            try {
                // Save avatar
                setSelectedAvatar(tempSelectedAvatar);
                await AsyncStorage.setItem('selectedAvatar', JSON.stringify(tempSelectedAvatar));

                // Save profile data to Redux
                const profileData = {
                    username: firstname,
                    surename: surename,
                    address: address,
                    dateOfBirth: dateOfBirth,
                    phone: phone,
                    selectedAvatar: tempSelectedAvatar
                };
                
                dispatch(setProfile(profileData));

                // Save profile data to AsyncStorage for persistence
                await AsyncStorage.setItem('userProfile', JSON.stringify(profileData));

                Alert.alert('Profile saved successfully');
                navigation.navigate('ViewProfile');
            } catch (error) {
                console.log('Error saving profile:', error);
                Alert.alert(
                    'Error',
                    'Failed to save profile. Please try again.',
                    [{ text: 'OK' }]
                );
            }
        } else {
            Alert.alert('Please fill in all fields');
        }
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
                        source={tempSelectedAvatar}
                        style={styles.avatar}
                        resizeMode="cover"
                    />
                    <TouchableOpacity 
                        style={styles.editButton}
                        onPress={() => setModalVisible(true)}
                    >
                        <Ionicons name="camera" size={20} color="white"/>
                    </TouchableOpacity>
                </View>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Choose Avatar</Text>
                            <TouchableOpacity 
                                onPress={() => setModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={24} color="black" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.avatarGrid}>
                            {avatars.map((avatar, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.avatarOption}
                                    onPress={() => {
                                        setTempSelectedAvatar(avatar);
                                        setModalVisible(false);
                                    }}
                                >
                                    <Image
                                        source={avatar}
                                        style={[
                                            styles.avatarThumbnail,
                                            tempSelectedAvatar === avatar && styles.selectedAvatar
                                        ]}
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            <View style={styles.formContainer}>
               
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>First Name</Text>
                    <TextInput
                        style={styles.firstnameinput}
                        value={firstname}
                        onChangeText={setFirstName}
                        placeholder="Enter your first name"
                    />
                    <Text style={styles.label}>Sure Name</Text>
                    <TextInput
                        style={styles.surenameinput}
                        value={surename}
                        onChangeText={setSureName}
                        placeholder="Enter your sure name"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Date of Birth</Text>
                    <TextInput
                        style={[styles.dateinput, dateError ? styles.errorInput : null]}
                        value={dateOfBirth}
                        onChangeText={handleDateChange}
                        placeholder="DD/MM/YYYY"
                        keyboardType="numeric"
                        maxLength={10}
                    />
                    {dateError ? <Text style={styles.errorText}>{dateError}</Text> : null}
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

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Address</Text>
                    <TextInput
                        style={[styles.addressinput]}
                        value={address}
                        onChangeText={setAddress}
                        placeholder="Type your Address"
                        multiline
                        numberOfLines={5}
                    />
                </View>

                <PressableButton style={styles.saveButton} title="Save" onPress={handleSave} />
                
            </View>
            </ScrollView>

        </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F8F8',
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'purple',
    },
    closeButton: {
        padding: 5,
    },
    avatarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
    },
    avatarOption: {
        width: '30%',
        aspectRatio: 1,
        marginBottom: 15,
    },
    selectedAvatar: {
        borderWidth: 3,
        borderColor: '#8A2BE2',
        transform: [{ scale: 1.1 }],
    },
    avatarThumbnail: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#8A2BE2',
    },
    formContainer: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    firstnameinput: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 20,
    },
    surenameinput: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    dateinput: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    errorInput: {
        borderColor: 'red',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 5,
    },
    input: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 20,
      },
    addressinput: {
        height: 100,
        textAlignVertical: 'top',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    saveButton: {
        backgroundColor: '#9346D2',
        padding: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    saveButtonText: {
        color: 'Black',
        fontSize: 16,
        fontWeight: 'bold',
    },
   
});

export default EditProfileScreen;
