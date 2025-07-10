import React, { useState, useEffect } from 'react';
import {
    View, TextInput, StyleSheet, Text, Pressable, SafeAreaView, Image,
    ScrollView, Modal, TouchableOpacity, BackHandler
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import PressableButton from '../component/PressableButton';
import CustomAlert from '../component/CustomAlertMessage';
import { setProfile } from '../Store/userSlice';
import profile_avatar from '../assets/image/profile_avatar.png';

const EditProfileScreen = ({ route, navigation }) => {
    const dispatch = useDispatch();
    const currentProfile = useSelector((state) => state.user.user);
    const profile = useSelector(state => state.user.user);
    const routeAvatar = route.params?.selectedAvatar;
    const BASE_URL = 'https://smile4kidsbackend-production-159e.up.railway.app';

    const [email, setemail] = useState('');
    const [address, setAddress] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [phone, setPhone] = useState('');
    const [username,setUsername]=useState('');

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
                setImages(Array.isArray(data) ? data : []);
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
            if (routeAvatar) {
                setSelectedAvatar(routeAvatar);
                dispatch(setProfile({ ...currentProfile, selectedAvatar: routeAvatar }));
                await AsyncStorage.setItem('selectedAvatar', JSON.stringify(routeAvatar));
            } else {
                const storedAvatar = await AsyncStorage.getItem('selectedAvatar');
                if (storedAvatar) {
                    const parsed = JSON.parse(storedAvatar);
                    setSelectedAvatar(parsed);
                    dispatch(setProfile({ ...currentProfile, selectedAvatar: parsed }));
                }
            }
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

    const validateAndFormatDate = (inputDate) => {
        let raw = inputDate.replace(/\D/g, '');
        let formattedDate = '';
        if (raw.length >= 5 && raw.length <= 6) {
            formattedDate = `${raw.slice(0, 4)}/${raw.slice(4)}`;
        } else if (raw.length >= 7) {
            formattedDate = `${raw.slice(0, 4)}/${raw.slice(4, 6)}/${raw.slice(6, 8)}`;
        } else {
            formattedDate = raw;
        }
        if (raw.length === 8) {
            const year = parseInt(raw.slice(0, 4), 10);
            const month = parseInt(raw.slice(4, 6), 10);
            const day = parseInt(raw.slice(6, 8), 10);
            const date = new Date(year, month - 1, day);
            if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
                setDateError('Please enter a valid date');
            } else {
                setDateError('');
            }
        } else if (raw.length > 0 && raw.length < 8) {
            setDateError('Please complete the date');
        } else {
            setDateError('');
        }
        return formattedDate;
    };

    const toMySQLDate = (formattedDate) => {
        if (!formattedDate) return null;
        const parts = formattedDate.split('/');
        if (parts.length !== 3) return null;
        const [year, month, day] = parts;
        return `${year}-${month}-${day}`;
    };

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
                    dob: toMySQLDate(dateOfBirth),
                    ph_no: phone,
                    address,
                    avatar: selectedAvatar,
                }),
            });
            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch {
                throw new Error(text);
            }
            if (data.message?.toLowerCase().includes('profile updated')) {
                dispatch(setProfile({ username, dateOfBirth, phone, address, selectedAvatar }));
                console.log('Profile updated successfully:', data);
                console.log('Selected Avatar:', selectedAvatar);
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
                            <Image
                                source={typeof selectedAvatar === 'string' ? { uri: selectedAvatar } : selectedAvatar}
                                style={styles.avatar}
                            />
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
                                            {images.map((image, index) => {
                                                const uri = `${BASE_URL}${image.path}`;
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
                            <TextInput style={styles.input} value={email} editable={false} keyboardType="email-address" />
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
                        <PressableButton title="Save" onPress={handleSave} />
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
    header: { alignItems: 'center', paddingVertical: 20, marginTop: 130 },
    profileContainer: { position: 'relative' },
    avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: 'white' },
    editButton: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#FF8C00', padding: 8, borderRadius: 20 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 20, width: '90%', maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: 'purple' },
    closeButton: { padding: 5 },
    loadingText: { textAlign: 'center', fontSize: 16, color: '#666', padding: 20 },
    avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' },
    avatarOption: { width: '30%', aspectRatio: 1, marginBottom: 15 },
    selectedAvatar: { borderWidth: 3, borderColor: '#8A2BE2', transform: [{ scale: 1.1 }] },
    formContainer: { padding: 20 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 16, color: '#666', marginBottom: 8 },
    input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', color: '#000' },
    errorInput: { borderColor: 'red' },
    errorText: { color: 'red', fontSize: 12, marginTop: 5 },
    addressInput: { height: 100, textAlignVertical: 'top', backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' }
});

export default EditProfileScreen;