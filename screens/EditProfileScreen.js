import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, Pressable, SafeAreaView, Image, ScrollView, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/Ionicons';
import PressableButton from '../Components/PressableButton';
 
const EditProfileScreen = ({ route, navigation, }) => {
    const [firstname, setFirstName] = useState(route.params?.username);
    const [surename, setSureName] = useState(route.params?.surename);
    const [address, setAddress] = useState(route.params?.address);
    const [dateOfBirth, setDateOfBirth] = useState(route.params?.dateOfBirth);
    const [dateError, setDateError] = useState('');
    const [phone, setPhone] = useState(route.params?.phone);


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

    const handleSave = () => {
        if(isValid) {
            Alert.alert('Profile saved successfully');
            navigation.navigate('Account');
        }else{
            Alert.alert('Please fill in all fields');
        }
    };


    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
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
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
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
    }, editButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#8A2BE2',
        padding: 8,
        borderRadius: 20,
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
        backgroundColor: 'purple',
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
