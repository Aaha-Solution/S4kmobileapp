import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { setLanguage } from '../Store/userSlice';
import PressableButton from '../component/PressableButton';
import LinearGradient from 'react-native-linear-gradient';
import CustomAlert from '../component/CustomAlertMessage';
// import LottieView from 'lottie-react-native'; // Uncomment if using Lottie

const { width } = Dimensions.get('window');

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
          <Text style={[styles.languageText, isSelected && styles.selectedText]}>
            {item.label}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#87CEEB', '#ADD8E6', '#F0F8FF']} style={styles.container}>
      <View style={styles.innerContainer}>

        {/* Top Cartoon Image */}
        <Image
          source={require('../assets/image/toy.png')}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.title}>🎨 Let's Pick a Language!</Text>
       
        <FlatList
          data={languagesData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.languageList}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.bottomButtonContainer}>
          <PressableButton title="Next ➡️" onPress={handleNextPress} style={styles.nextButton} />
        </View>
      </View>

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
	innerContainer: {
	  flex: 1,
	  alignItems: 'center',
	  paddingHorizontal: 20,
	  paddingTop: 60,
	},
	image: {
	  width: 140,
	  height: 140,
	  marginBottom: 20,
	},
	title: {
	  fontSize: 24,
	  fontWeight: 'bold',
	  color: '#4B0082',
	  marginTop: 10,
	  marginBottom: 6,
	  textAlign: 'center',
	},
	languageList: {
	  width: '100%',
	  alignItems: 'center',
	  paddingBottom: 20,
	},
	languageBox: {
	  width: 300,
	  height: 60,
	  backgroundColor: '#fff',
	  marginVertical: 8,
	  borderRadius: 25, // rounded pill look
	  justifyContent: 'center',
	  alignItems: 'center',
	//   elevation: 4,
	//   shadowColor: '#000',
	//   shadowOpacity: 0.1,
	//   shadowRadius: 5,
	//   shadowOffset: { width: 1, height: 2 },
	},
	selectedBox: {
	  backgroundColor: 'rgba(76, 175, 80, 0.9)',
	  borderColor: 'rgba(76, 175, 80, 0.9)',
	  borderWidth: 1.5,
	},
	languageText: {
	  fontSize: 17,
	  color: '#000',
	  fontWeight: '600',
	},
	selectedText: {
	  color: '#000080', // navy text
	  fontWeight: 'bold',
	},
	bottomButtonContainer: {
	  marginTop: 100,
	  marginBottom: 100,
	},
	nextButton: {
	  paddingVertical: 12,
	  paddingHorizontal: 35,
	  borderRadius: 15,
	},
  });
export default LanguageSelectionScreen;
