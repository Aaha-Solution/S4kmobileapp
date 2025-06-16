import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text, Pressable, SafeAreaView, Image, ScrollView, Alert, Modal, TouchableOpacity, BackHandler } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/Ionicons';
import { setProfile } from '../Store/userSlice';
import PressableButton from '../component/PressableButton';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import profile_avatar from '../assets/image/profile_avatar.png';
import CustomAlert from '../component/CustomAlertMessage';
import { useDispatch, useSelector } from 'react-redux';

const EditProfileScreen = ({ route, navigation }) => {
    const dispatch = useDispatch();
    const profile = useSelector(state => state.user.user);
    const username = profile?.username || '';

    // Base URL - consider moving to config file
    const BASE_URL = 'http://192.168.0.241:3000';
    
    // State variables
    const [email, setemail] = useState(route.params?.email || '');
    const [address, setAddress] = useState(route.params?.address || '');
    const [dateOfBirth, setDateOfBirth] = useState(route.params?.dateOfBirth || '');
    const [dateError, setDateError] = useState('');
    const [phone, setPhone] = useState(route.params?.phone || '');
    const [selectedAvatar, setSelectedAvatar] = useState(profile_avatar);
    const [modalVisible, setModalVisible] = useState(false);
    const [phoneError, setPhoneError] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertTitle, setAlertTitle] = useState('');
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAvatar = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                const response = await fetch(`${BASE_URL}/api/images/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json(); 
                console.log('Fetched avatar images:', data);
                setImages(data);

            } catch (error) {
                console.error('Failed to fetch avatars:', error);
            }
        };
 
        fetchAvatar();
    }, []);

    //load avatar
    useEffect(() => {
        const loadAvatar = async () => {
            const storedAvatar = await AsyncStorage.getItem('selectedAvatar');
            if (storedAvatar) {
                dispatch(setProfile({ selectedAvatar: JSON.parse(storedAvatar) }));
            }
        };

        loadAvatar();
    }, []);

    // Handle back button
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            navigation.navigate('ViewProfile');
            return true;
        });

        // Cleanup function to remove the listener
        return () => backHandler.remove();
    }, [navigation]);

    const validateAndFormatDate = (inputDate, setDateError) => {
        let formattedDate = inputDate.replace(/[^0-9]/g, '');

        // Add slashes as user types
        if (formattedDate.length >= 4 && formattedDate.length <= 6) {
            formattedDate = `${formattedDate.slice(0, 4)}/${formattedDate.slice(4)}`;
        } else if (formattedDate.length > 6) {
            formattedDate = `${formattedDate.slice(0, 4)}/${formattedDate.slice(4, 6)}/${formattedDate.slice(6, 8)}`;
        }

        // Validate the date if fully entered
        if (formattedDate.length === 10) {
            const [year, month, day] = formattedDate.split('/').map(Number);
            const date = new Date(year, month - 1, day);

            if (
                isNaN(date.getTime()) ||
                date.getDate() !== day ||
                date.getMonth() !== month - 1 ||
                date.getFullYear() !== year
            ) {
                setDateError('Please enter a valid date');
            } else {
                setDateError('');
            }
        } else if (formattedDate.length > 0 && formattedDate.length < 10) {
            setDateError('Please complete the date');
        } else {
            setDateError('');
        }

        return formattedDate;
    };


    const HandlePhonenumber = (phoneNumber) => {
        // Remove any non-digit characters
        const cleanedNumber = phoneNumber.replace(/\D/g, '');

        // Check if empty
        if (!cleanedNumber) {
            setPhoneError('Phone number is required');
            setPhone(cleanedNumber);
            return;
        }

        // Check if length is 10 digits
        if (cleanedNumber.length !== 10) {
            setPhoneError('Phone number must be 10 digits');
            setPhone(cleanedNumber);
            return;
        }

        // Check if it's all numbers
        if (!/^\d+$/.test(cleanedNumber)) {
            setPhoneError('Phone number must contain only digits');
            setPhone(cleanedNumber);
            return;
        }

        setPhoneError('');
        setPhone(cleanedNumber);
    };

    const handleDateChange = (text) => {
        const formattedDate = validateAndFormatDate(text, setDateError);
        setDateOfBirth(formattedDate);
    };


    const handleSave = async () => {
        if (!email || !dateOfBirth || !phone || !address) {
            setAlertTitle('Validation Error');
            setAlertMessage('Please fill in all required fields.');
            setShowAlert(true);
            return;
        }

        // Check for validation errors
        if (dateError || phoneError) {
            setAlertTitle('Validation Error');
            setAlertMessage('Please fix the errors before saving.');
            setShowAlert(true);
            return;
        }

        try {
            const token = await AsyncStorage.getItem('token');
            const username = profile?.username || '';

            const response = await fetch(`${BASE_URL}/signup/update-profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    username,
                    email_id: email,
                    dob: dateOfBirth,
                    ph_no: phone,
                    address: address,
                }),
            });
            console.log('response', response);

            const data = await response.json();
            console.log('data:', data);

            if (data.message && data.message.toLowerCase().includes('profile updated successfully')) {
                dispatch(setProfile({
                    username,
                    dateOfBirth,
                    phone,
                    address,

                }));
                console.log('Profile updated in Redux:', {
                    username,
                    dateOfBirth,
                    phone,
                    address,
                });

                // Save selected avatar if changed
                if (selectedAvatar !== profile_avatar) {
                    await AsyncStorage.setItem('selectedAvatar', JSON.stringify(selectedAvatar));
                }

                await AsyncStorage.setItem('userProfile', JSON.stringify({
                    username, email, dateOfBirth, phone, address
                }));

                setAlertTitle('Success');
                setAlertMessage('Profile updated successfully');
                setShowAlert(true);
                navigation.navigate('ViewProfile');

            } else {
                setAlertTitle('Error');
                setAlertMessage(data.message || 'Failed to update profile');
                setShowAlert(true);
            }

        } catch (err) {
            console.error(err);
            setAlertTitle('Error');
            setAlertMessage('Something went wrong.');
            setShowAlert(true);
        }
    };
    const handleSelectAvatar = async (avatarUrl) => {
        setSelectedAvatar(avatarUrl); // update local state
        dispatch(setProfile({ selectedAvatar: avatarUrl })); // save in Redux
        await AsyncStorage.setItem('selectedAvatar', JSON.stringify(avatarUrl));
    };


return (
    <View style={{ flex: 1 }}>
    <LinearGradient
        colors={['#87CEEB', '#ADD8E6', '#F0F8FF']}
        style={StyleSheet.absoluteFill}
    />
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.header}>
                    <View style={styles.profileContainer}>
                        <Image
                            source={selectedAvatar}
                            style={styles.avatar}
                            resizeMode="cover"
                        />
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => setModalVisible(true)}
                        >
                            <Ionicons name="camera" size={20} color="white" />
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

                                {loading ? (
                                    <Text style={styles.loadingText}>Loading avatars...</Text>
                                ) : (
                                    <ScrollView>
                                        <View style={styles.avatarGrid}>
                                            {images.map((image, index) => {
                                                const uri = `${BASE_URL}${image.path}`;
                                                const isSelected = selectedAvatar?.uri === uri;

                                                return (
                                                    <TouchableOpacity
                                                        key={index}
                                                        style={styles.avatarOption}
                                                        onPress={() => {
                                                            handleSelectAvatar()
                                                        }}
                                                    >
                                                        <Image
                                                            source={
                                                                profile?.selectedAvatar
                                                                    ? { uri: profile.selectedAvatar }
                                                                    : require('../assets/image/profile_avatar.png') // fallback image
                                                            }
                                                            style={styles.avatar}
                                                        />
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </ScrollView>
                                )}
                            </View>
                        </TouchableOpacity>
                    </Modal>

                    <View style={styles.formContainer}>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>UserName</Text>
                            <TextInput
                                style={styles.input}
                                value={profile.username}
                                placeholder="Enter your username"
                                autoCapitalize="none"
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                placeholder="Enter your email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Date of Birth</Text>
                            <TextInput
                                style={[styles.input, dateError ? styles.errorInput : null]}
                                value={dateOfBirth}
                                onChangeText={handleDateChange}
                                placeholder="YYYY/MM/DD"
                                keyboardType="numeric"
                                maxLength={10}
                            />
                            {dateError ? <Text style={styles.errorText}>{dateError}</Text> : null}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone Number</Text>
                            <TextInput
                                style={[styles.input, phoneError ? styles.errorInput : null]}
                                value={phone}
                                onChangeText={HandlePhonenumber}
                                placeholder="Enter your phone number"
                                keyboardType="phone-pad"
                                maxLength={10}
                            />
                            {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Address</Text>
                            <TextInput
                                style={styles.addressInput}
                                value={address}
                                onChangeText={setAddress}
                                placeholder="Type your Address"
                                multiline
                                numberOfLines={5}
                            />
                        </View>

                        <PressableButton
                            style={styles.saveButton}
                            title="Save"
                            onPress={handleSave}
                        />
                    </View>
                </ScrollView>

                <CustomAlert
                    visible={showAlert}
                    title={alertTitle}
                    message={alertMessage}
                    onConfirm={() => setShowAlert(false)}
                />
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
    loadingText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#666',
        padding: 20,
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
        width: '100%',
    },
    label: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    input: {
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
    addressInput: {
        height: 100,
        textAlignVertical: 'top',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    saveButton: {
       // backgroundColor: '#9346D2',
        padding: 15,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
});

export default EditProfileScreen;