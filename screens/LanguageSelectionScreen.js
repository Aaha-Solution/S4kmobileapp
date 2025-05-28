import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  FlatList,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { setLanguage } from '../Store/userSlice';
import PressableButton from '../component/PressableButton';
import LinearGradient from 'react-native-linear-gradient';

const languagesData = [
  { id: '1', label: 'Hindi', value: 'Hindi' },
  { id: '2', label: 'Panjabi', value: 'Panjabi' },
  { id: '3', label: 'Gujarati', value: 'Gujarati' },
];

const LanguageSelectionScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const selectedLanguage = useSelector((state) => state.user.selectedLanguage);
  const [animations, setAnimations] = useState(
    languagesData.reduce((acc, lang) => {
      acc[lang.id] = new Animated.Value(1);
      return acc;
    }, {})
  );

  const animateSelection = (id) => {
    const anim = animations[id];
    if (!anim) return;
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(anim, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleLanguage = (item) => {
    animateSelection(item.id);
    dispatch(setLanguage(item.value));
  };

  const handleNextPress = () => {
    if (selectedLanguage) {
    navigation.reset({
      index: 0,
      routes: [{ name: 'AgeSelectionScreen' }],
  }); 

    } else {
      Alert.alert('Selection Required', 'Please select a language before proceeding.');
    }
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedLanguage === item.value;
    return (
      <TouchableOpacity onPress={() => toggleLanguage(item)} style={{ width: '100%', alignItems: 'center' }}>
        <Animated.View
          style={[
            styles.languageBox,
            isSelected && styles.selectedBox,
            { transform: [{ scale: animations[item.id] }] },
          ]}
        >
          <Text style={styles.languageText}>{item.label}</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#9346D2', '#5BC3F5']} style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Let’s Pick a Language!</Text>

        <FlatList
          data={languagesData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.languageList}
          numColumns={1}
        />

        <PressableButton title="Next" onPress={handleNextPress} style={styles.nextButton} />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent:'center'
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 180, // pushed downward
    justifyContent: 'space-between',
    alignContent:'center',
    justifyContent:'center'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  languageList: {
    width: '100%',
    alignItems: 'center',
  },
  languageBox: {
    width: '90%',
    height: 70,
    backgroundColor: '#ffffff',
    marginVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    flexDirection: 'row',
  },
  selectedBox: {
    backgroundColor: '#5BC3F5',
    borderWidth: 1,
    borderColor: '#fff',
    shadowColor: '#fff',
  },
  languageText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    flex: 1,
  },
  nextButton: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 150, 
  },
});

export default LanguageSelectionScreen;
