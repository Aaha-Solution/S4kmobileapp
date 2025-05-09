import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { setAgeGroup } from '../store/userSlice';
import PressableButton from '../component/PressableButton';

const ageGroups = [
  { id: '1', name: 'Pre-Prep (4–6 years)' },
  { id: '2', name: 'Junior (7–10 years)' },
]

const AgeSelectionScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const selectedAgeGroup = useSelector(state => state.user.selectedAgeGroup);

  const handleAgeSelect = (age) => {
    dispatch(setAgeGroup(age));
  };

  const handleNext = () => {
    if (selectedAgeGroup) {
      navigation.navigate('VideoScreen');  // 👈 navigate to video screen here
    } else {
      Alert.alert('Selection Required', 'Please select an age group before proceeding.');
    }
  };

  return (
    <View style={styles.container}>
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
    </View>
  );  
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#e9d8fd',
      },
      content: {
        flex: 1,
        justifyContent: 'center',
        alignContent:'center'
      },
      ageBox: {
        padding: 20,
        backgroundColor: '#d6bcfa',
        borderRadius: 10,
        marginVertical: 10,
      },
      selectedBox: {
        backgroundColor: '#b794f4',
      },
      ageText: {
        fontSize: 16,
        color: '#4a148c',
      },
      nextButton: {
        marginTop: 30,
      },
      
});

export default AgeSelectionScreen;
