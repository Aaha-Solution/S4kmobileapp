import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { setLanguage } from '../Store/userSlice';
import PressableButton from '../component/PressableButton';
import LinearGradient from 'react-native-linear-gradient';
import CustomAlert from '../component/CustomAlertMessage';

const { width, height } = Dimensions.get('window');

const languagesData = [
  { id: '1', label: 'Hindi', value: 'Hindi' },
  { id: '2', label: 'Panjabi', value: 'Panjabi' },
  { id: '3', label: 'Gujarati', value: 'Gujarati' },
];

const LanguageSelectionScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const selectedLanguage = useSelector((state) => state.user.selectedLanguage);
  const [animations] = useState(
    languagesData.reduce((acc, lang) => {
      acc[lang.id] = new Animated.Value(1);
      return acc;
    }, {})
  );
  const [showAlert, setShowAlert] = useState(false);

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
      setShowAlert(true);
    }
  };

  const handleConfirmAlert = () => {
    setShowAlert(false);
  };

  return (
    <LinearGradient colors={['#87CEEB', '#ADD8E6', '#F0F8FF']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={require('../assets/image/toy.png')}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.title}>🎨 Let's Pick a Language!</Text>

        <View style={styles.languageList}>
          {languagesData.map((item) => {
            const isSelected = selectedLanguage === item.value;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => toggleLanguage(item)}
                style={styles.languageTouchable}
              >
                <Animated.View
                  style={[
                    styles.languageBox,
                    isSelected && styles.selectedBox,
                    { transform: [{ scale: animations[item.id] }] },
                  ]}
                >
                  <Text style={[styles.languageText, isSelected && styles.selectedText]}>
                    {item.label}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.bottomButtonContainer}>
          <PressableButton title="Next ➡️" onPress={handleNextPress} style={styles.nextButton} />
        </View>
      </ScrollView>

      <CustomAlert
        visible={showAlert}
        title="Selection Required"
        message="Please select a language to continue"
        onConfirm={handleConfirmAlert}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.05,
    paddingHorizontal: width * 0.05,
  },
  image: {
    width: width * 0.35,
    height: height * 0.2,
    marginBottom: height * 0.025,
  },
  title: {
    fontSize: width * 0.065,
    fontWeight: 'bold',
    color: '#4B0082',
    textAlign: 'center',
    marginBottom: height * 0.02,
  },
  languageList: {
    width: '100%',
    alignItems: 'center',
  },
  languageTouchable: {
    width: '100%',
    alignItems: 'center',
    marginBottom: height * 0.015,
  },
  languageBox: {
    width: '85%',
    height: height * 0.07,
    backgroundColor: '#fff',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    // elevation: 4,
    // shadowColor: '#000',
    // shadowOffset: { width: 1, height: 2 },
    // shadowOpacity: 0.2,
    // shadowRadius: 4,
  },
  selectedBox: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  languageText: {
    fontSize: width * 0.05,
    color: '#000',
    fontWeight: '600',
  },
  selectedText: {
    color: '#000080',
    fontWeight: 'bold',
  },
  bottomButtonContainer: {
    marginTop: height * 0.05,
  },
  nextButton: {
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.15,
    borderRadius: 15,
    backgroundColor: '#FF8C00',
  },
});

export default LanguageSelectionScreen;
