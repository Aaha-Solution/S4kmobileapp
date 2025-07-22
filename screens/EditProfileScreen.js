import React, { useState, useEffect } from 'react';
import {
    View, TextInput, StyleSheet, Text, Pressable, SafeAreaView, Image, Modal, TouchableOpacity, BackHandler
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import PressableButton from '../component/PressableButton';
import CustomAlert from '../component/CustomAlertMessage';
import { setProfile } from '../Store/userSlice';
import profile_avatar from '../assets/image/profile_avatar.png';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const EditProfileScreen = ({ route, navigation }) => {
    const dispatch = useDispatch();
    const currentProfile = useSelector((state) => state.user.user);
    const profile = useSelector(state => state.user.user);
    const routeAvatar = route.params?.selectedAvatar;
    const BASE_URL = 'https://smile4kidsbackend-production-2970.up.railway.app';

    const [email, setemail] = useState('');
    const [address, setAddress] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [phone, setPhone] = useState('');
    const [username, setUsername] = useState('');

    useEffect(() => {
        if (profile) {
            setemail(profile.email || '');
            setAddress(profile.address || '');
            setDateOfBirth(profile.dateOfBirth || '');
            setPhone(profile.phone || '');
            setUsername(profile?.username || '')
        }
    }, [profile]);

    const [selectedAvatar, setSelectedAvatar] = useState(profile_avatar);
    const [modalVisible, setModalVisible] = useState(false);
    const [phoneError, setPhoneError] = useState('');
    const [dateError, setDateError] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAvatar = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                const response = await fetch(`${BASE_URL}/api/images`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();
                console.log('Avatar data:', data);

                const imageUrls = Array.isArray(data)
                    ? data.map(file => `${BASE_URL}${file.path}`)
                    : [];


                console.log('First avatar object:', data[0]);
                console.log('Avatar URLs:', imageUrls);

                setImages(imageUrls);
                setLoading(false);

            } catch (error) {
                console.error('Failed to fetch avatars:', error);
                setImages([]);
                setLoading(false);
            }
        };

        fetchAvatar();
    }, []);
    useEffect(() => {
        const loadAvatar = async () => {
            let avatarToUse = profile_avatar; // fallback

            if (routeAvatar && typeof routeAvatar === 'string') {
                avatarToUse = routeAvatar;
                await AsyncStorage.setItem('selectedAvatar', JSON.stringify(routeAvatar));
            } else {
                const storedAvatar = await AsyncStorage.getItem('selectedAvatar');
                if (storedAvatar) {
                    try {
                        const parsed = JSON.parse(storedAvatar);
                        if (typeof parsed === 'string') {
                            avatarToUse = parsed;
                        }
                    } catch (err) {
                        console.warn('Invalid avatar format in storage:', storedAvatar);
                    }
                }
            }

            setSelectedAvatar(avatarToUse);
            dispatch(setProfile({ ...currentProfile, selectedAvatar: avatarToUse }));
        };

        loadAvatar();
    }, []);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            navigation.navigate('ViewProfile');
            return true;
        });
        return () => backHandler.remove();
    }, [navigation]);

    // const validateAndFormatDate = (inputDate) => {
    //     let raw = inputDate.replace(/\D/g, '');
    //     let formattedDate = '';
    //     if (raw.length >= 5 && raw.length <= 6) {
    //         formattedDate = `${raw.slice(0, 4)}/${raw.slice(4)}`;
    //     } else if (raw.length >= 7) {
    //         formattedDate = `${raw.slice(0, 4)}/${raw.slice(4, 6)}/${raw.slice(6, 8)}`;
    //     } else {
    //         formattedDate = raw;
    //     }
    //     if (raw.length === 8) {
    //         const year = parseInt(raw.slice(0, 4), 10);
    //         const month = parseInt(raw.slice(4, 6), 10);
    //         const day = parseInt(raw.slice(6, 8), 10);
    //         const date = new Date(year, month - 1, day);
    //         if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
    //             setDateError('Please enter a valid date');
    //         } else {
    //             setDateError('');
    //         }
    //     } else if (raw.length > 0 && raw.length < 8) {
    //         setDateError('Please complete the date');
    //     } else {
    //         setDateError('');
    //     }
    //     return formattedDate;
    // };

    const toMySQLDate = (formattedDate) => {
        if (!formattedDate) return null;
        const parts = formattedDate.split('/');
        if (parts.length !== 3) return null;
        const [year, month, day] = parts;
        return `${year}-${month}-${day}`;
    };

    //Phone number validation
    const HandlePhonenumber = (number) => {
        const cleanedNumber = number.replace(/\D/g, ''); // keep only digits
        const ukMobileRegex = /^07\d{9}$/;

        setPhone(number); // still show original input

        if (!cleanedNumber) {
            setPhoneError('Phone number is required');
        } else if (!ukMobileRegex.test(cleanedNumber)) {
            setPhoneError('Enter a valid UK mobile number (11 digits starting with 07)');
        } else {
            setPhoneError('');
        }
    };

    const handleSave = async () => {
        if (!email || !phone || !address) {
            setAlertTitle('Validation Error');
            setAlertMessage('Please fill in all required fields.');
            setShowAlert(true);
            return;
        }

        if (dateError || phoneError) {
            setAlertTitle('Validation Error');
            setAlertMessage('Please fix the errors before saving.');
            setShowAlert(true);
            return;
        }

        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/signup/update-profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    username,
                    email_id: email,
                    ph_no: phone,
                    address,
                    avatar: selectedAvatar,
                })
            });

            const text = await response.text();
            console.log('Raw backend response:', text); // ✅ Add this
            let data;
            try {
                data = JSON.parse(text);
            } catch {
                throw new Error(text); // If not JSON, will show HTML error
            }

            if (data.message?.toLowerCase().includes('profile updated')) {
                dispatch(setProfile({ username, dateOfBirth, phone, address, selectedAvatar }));
                await AsyncStorage.setItem('selectedAvatar', JSON.stringify(selectedAvatar));
                navigation.navigate('ViewProfile');
            } else {
                throw new Error(data.message || 'Failed to update profile');
            }
        } catch (err) {
            console.error('Profile update failed:', err.message);
            setAlertTitle('Error');
            setAlertMessage(err.message || 'Something went wrong.');
            setShowAlert(true);
        }
    };

    const handleSelectAvatar = (avatarUrl) => {
        setSelectedAvatar(avatarUrl);
        setModalVisible(false);
    };

    return (
        <LinearGradient colors={['#87CEEB', '#ADD8E6', '#F0F8FF']} style={styles.container}>
            <SafeAreaView style={styles.container}>
                <ScrollView>
                    <View style={styles.header}>
                        <View style={styles.profileContainer}>
                            <View style={styles.avatarWrapper}>
                                <Image
                                    source={
                                        typeof selectedAvatar === 'string'
                                            ? { uri: selectedAvatar }
                                            : profile_avatar
                                    }
                                    onError={(e) => console.log('❌ Image load failed', selectedAvatar, e.nativeEvent)}
                                    style={styles.avatar}
                                    resizeMode="contain"
                                />

                            </View>
                            <TouchableOpacity style={styles.editButton} onPress={() => setModalVisible(true)}>
                                <Ionicons name="camera" size={20} color="white" />
                            </TouchableOpacity>
                        </View>

                    </View>
                    <Modal animationType="slide" transparent={true} visible={modalVisible}>
                        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Choose Avatar</Text>
                                    <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                        <Ionicons name="close" size={24} color="black" />
                                    </TouchableOpacity>
                                </View>
                                {loading ? (
                                    <Text style={styles.loadingText}>Loading avatars...</Text>
                                ) : (
                                    <ScrollView>
                                        <View style={styles.avatarGrid}>
                                            {images.map((uri, index) => {
                                                const isSelected = selectedAvatar === uri;
                                                return (
                                                    <TouchableOpacity
                                                        key={index}
                                                        style={styles.avatarOption}
                                                        onPress={() => handleSelectAvatar(uri)}
                                                    >
                                                        <Image
                                                            source={{ uri }}
                                                            style={[styles.avatar, isSelected && styles.selectedAvatar]}
                                                            onError={() => console.log('Failed to load image:', uri)}  // ✅ LOG BROKEN URLS

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
                            <TextInput style={styles.input} value={username}
                                onChangeText={(text) => {
                                    const cleaned = text.replace(/[^a-z]/g, '').slice(0, 6);
                                    setUsername(cleaned);
                                }} />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput style={[styles.input, { backgroundColor: '#eee' }]} value={email} editable={false} keyboardType="email-address" />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone Number</Text>
                            <TextInput
                                style={[styles.input, phoneError && styles.errorInput]}
                                value={phone}
                                onChangeText={HandlePhonenumber}
                                keyboardType="phone-pad"
                                maxLength={11}
                            />
                            {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Address</Text>
                            <TextInput
                                style={styles.addressInput}
                                value={address}
                                onChangeText={setAddress}
                                multiline
                                numberOfLines={4}
                            />
                        </View>
                        <PressableButton title="Save" onPress={handleSave} style={{ marginTop: 20 }} />
                    </View>
                </ScrollView>

                <CustomAlert
                    visible={showAlert}
                    title={alertTitle}
                    message={alertMessage}
                    onConfirm={() => setShowAlert(false)}
                />
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        alignItems: 'center',
        paddingVertical: 20,
        marginTop: 110
    },
    profileContainer: {
        position: 'relative',

    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: 'white',
        overflow: 'hidden',

    },
    avatarWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',

    },
    editButton: {
        position: 'absolute',
        bottom: 0, right: 0,
        backgroundColor: '#FF8C00',
        padding: 8,
        borderRadius: 20
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: width * 0.05, // responsive padding
        width: width * 0.9, // 90% of screen width
        maxHeight: height * 0.8, // 80% of screen height
        marginTop: height * 0.02, // 2% top margin
        alignSelf: 'center', // center modal horizontally
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'purple'
    },
    closeButton: {
        padding: 5
    },
    loadingText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#666',
        padding: 20
    },
    avatarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around'
    },
    avatarOption: {
        width: 80,
        height: 80,
        borderRadius: 40,
        margin: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        overflow: 'hidden',
    },
    selectedAvatar: {
        borderWidth: 3,
        borderColor: '#8A2BE2',
        backgroundColor: '#E0E0FF',
    },
    formContainer: {
        padding: 20
    },
    inputGroup: {
        marginBottom: 20
    },
    label: {
        fontSize: 16,
        color: 'black',
        marginBottom: 8
    },
    input: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        color: '#000'
    },
    errorInput: {
        borderColor: 'red'
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 5
    },
    addressInput: {
        height: 100,
        textAlignVertical: 'top',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        color: '#000'
    }
});

export default EditProfileScreen;