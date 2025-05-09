import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList,Alert} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { setLanguage } from '../store/userSlice';
import PressableButton from '../component/PressableButton';

const languagesData = [
  { id: '1', name: 'Hindi (हिन्दी)' },
  { id: '2', name: 'Panjabi (ਪੰਜਾਬੀ)' },
  { id: '3', name: 'Gujarati (ગુજરાતી)' },
];

const LanguageSelectionScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const selectedLanguage = useSelector((state) => state.user.selectedLanguage);
  const [error, setError] = useState(false);

  const toggleLanguage = (lang) => {
    dispatch(setLanguage(lang));
    setError(false); // clear error once a language is selected
  };

  const handleNextPress = () => {
    if (selectedLanguage) {
        navigation.navigate('AgeSelectionScreen');  
      } else {
        Alert.alert('Selection Required', 'Please select an age group before proceeding.');
      }
    };

  const renderItem = ({ item, index }) => {
    const isSelected = selectedLanguage === item.name;
    const isLast = index === languagesData.length - 1;
    const isOddCount = languagesData.length % 2 !== 0;
  
    const itemStyle = [
      styles.languageBox,
      isSelected && styles.selectedBox,
      isOddCount && isLast && styles.centeredLastItem, // center Gujarati
    ];
  
    return (
      <TouchableOpacity style={itemStyle} onPress={() => toggleLanguage(item.name)}>
        <Text style={styles.languageText}>{item.name}</Text>
        {isSelected && (
          <Icon name="check-circle" size={20} color="#4a148c" style={styles.icon} />
        )}
      </TouchableOpacity>
    );
  };
  

  return (
    <View style={styles.container}>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5e6f7',
    padding: 20,
  },
  grid: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 20,
  },
  languageBox: {
    width: '45%',
    aspectRatio: 1,
    backgroundColor: '#d8b4e2',
    margin: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  selectedBox: {
    backgroundColor: '#c084d4',
  },
  languageText: {
    color: '#4a148c',
    fontSize: 16,
  },
  icon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 16,
  },
  nextButton: {
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  centeredLastItem: {
    marginLeft: '27.5%', // Center in a two-column layout
  },
  
});

export default LanguageSelectionScreen;
