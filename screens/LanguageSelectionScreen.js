import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ImageBackground,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { setLanguage } from '../Store/userSlice';
import PressableButton from '../component/PressableButton';

const languagesData = [
  { id: '1', name: 'Hindi (हिन्दी)' },
  { id: '2', name: 'Panjabi (ਪੰਜਾਬੀ)' },
  { id: '3', name: 'Gujarati (ગુજરાતી)' },
];

const LanguageSelectionScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const selectedLanguage = useSelector((state) => state.user.selectedLanguage);

  const toggleLanguage = (lang) => {
    dispatch(setLanguage(lang));
  };

  const handleNextPress = () => {
    if (selectedLanguage) {
      navigation.navigate('AgeSelectionScreen');
    } else {
      Alert.alert('Selection Required', 'Please select a language before proceeding.');
    }
  };

  const renderItem = ({ item, index }) => {
    const isSelected = selectedLanguage === item.name;
    const isLast = index === languagesData.length - 1;
    const isOddCount = languagesData.length % 2 !== 0;

    const itemStyle = [
      styles.languageBox,
      isSelected && styles.selectedBox,
      isOddCount && isLast && styles.centeredLastItem,
    ];

    return (
      <TouchableOpacity style={itemStyle} onPress={() => toggleLanguage(item.name)}>
        <Text style={styles.languageText}>{item.name}</Text>
        {isSelected && (
          <Icon name="check-circle" size={20} color="#F2766B" style={styles.icon} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground
      source={require('../assets/image/kids_bg.png')}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.heading}>Choose Your Language</Text>

        <FlatList
          data={languagesData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
        />

        <PressableButton
          title="Next"
          onPress={handleNextPress}
          style={styles.nextButton}
        />

      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  heading: {
    textAlign: 'center',
    fontSize: 26,
    fontWeight: 'bold',
    color: '#F2766B',
    marginBottom: 20,
  },
  grid: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 10,
  },
  languageBox: {
    width: '45%',
    aspectRatio: 1,
    backgroundColor: '#F9D6A1',
    margin: 10,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  selectedBox: {
    backgroundColor: '#F4A950',
    borderWidth: 2,
    borderColor: '#F2766B',
  },
  languageText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  icon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  centeredLastItem: {
    marginLeft: '27.5%',
  },
  nextButton: {
    padding: 15,
    borderRadius: 25,
    marginVertical: 20,
  },
 
});

export default LanguageSelectionScreen;
