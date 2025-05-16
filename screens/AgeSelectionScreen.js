import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { setAgeGroup } from '../Store/userSlice';
import PressableButton from '../component/PressableButton';
import LinearGradient from 'react-native-linear-gradient';

const ageGroups = [
  { id: '1', name: 'Pre-Prep (4–6 years)' },
  { id: '2', name: 'Junior (7–10 years)' },
];

const AgeSelectionScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const selectedAgeGroup = useSelector(state => state.user.selectedAgeGroup);

  const handleAgeSelect = (age) => {
    dispatch(setAgeGroup(age));
  };

  const handleNext = () => {
    if (selectedAgeGroup) {
      navigation.navigate('VideoListScreen');
    } else {
      Alert.alert('Selection Required', 'Please select an age group before proceeding.');
    }
  };

  return (
    <LinearGradient colors={['#9346D2', '#5BC3F5']} style={styles.container}>
      <View style={styles.content}>
        {ageGroups.map(group => (
          <TouchableOpacity
            key={group.id}
            style={[
              styles.ageBox,
              selectedAgeGroup === group.name && styles.selectedBox,
            ]}
            onPress={() => handleAgeSelect(group.name)}
          >
            <Text style={styles.ageText}>{group.name}</Text>
          </TouchableOpacity>
        ))}
        <PressableButton title="Next" onPress={handleNext} style={styles.nextButton} />
      </View>
    </LinearGradient>
  );  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#e9d8fd', // Optional: if using gradient, change this
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
   // paddingTop: -20, // shift upward from center (you can tweak this value)
  },
  
  ageBox: {
    width: '100%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginVertical: 10,
    alignItems: 'center',
  },
  selectedBox: {
    backgroundColor: '#5BC3F5',
    borderColor: '#fff',
    borderWidth: 1,
  },
  ageText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  nextButton: {
    marginTop: 20,
    backgroundColor: '#9346D2',
    borderRadius: 10,
    paddingHorizontal: 40,
    paddingVertical: 15,
  },
});

export default AgeSelectionScreen;
