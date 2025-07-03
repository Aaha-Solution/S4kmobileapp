import React, { useState } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Animated,
	FlatList,
	Image,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { setLevel } from '../Store/userSlice';
import PressableButton from '../component/PressableButton';
import LinearGradient from 'react-native-linear-gradient';
import CustomAlert from '../component/CustomAlertMessage';
import { getBackendLevel, getDisplayLevel } from '../utils/levelUtils';
const ageGroups = [
	{ id: '1', name: 'PreSchool (4–6 years)' },
	{ id: '2', name: 'Junior (7 & above years)' },
];

const AgeSelectionScreen = ({ navigation }) => {
	const dispatch = useDispatch();
	const selectedLevel = useSelector((state) => state.user.selectedLevel);
	const [showAlert, setShowAlert] = useState(false);

	const [animations, setAnimations] = useState(
		ageGroups.reduce((acc, group) => {
			acc[group.id] = new Animated.Value(1);
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

	const handleAgeSelect = (group) => {
		animateSelection(group.id);
		const backendLevel = getBackendLevel(group.name); // 🔁 Convert to backend-safe value
		console.log("backendlevel", backendLevel)
		dispatch(setLevel(backendLevel));
		console.log("age", group.name)
	};

	const handleNext = () => {
		if (selectedLevel) {
			navigation.reset({
				index: 0,
				routes: [{ name: 'MainTabs' }],
			});
		} else {
			setShowAlert(true);
		}
	};

	const handleConfirmAlert = () => {
		setShowAlert(false);
	};

	const renderItem = ({ item }) => {
		const isSelected = selectedLevel === getBackendLevel(item.name);
		return (
			<TouchableOpacity
				onPress={() => handleAgeSelect(item)}
				style={{ width: '100%', alignItems: 'center' }}
			>
				<Animated.View
					style={[
						styles.ageBox,
						isSelected && styles.selectedBox,
						{ transform: [{ scale: animations[item.id] }] },
					]}
				>
					<Text style={[styles.ageText, isSelected && styles.selectedText]}>
						{item.name}
					</Text>
				</Animated.View>
			</TouchableOpacity>
		);
	};

	return (
		<LinearGradient colors={['#87CEEB', '#ADD8E6', '#F0F8FF']} style={styles.container}>
			<View style={styles.innerContainer}>
				<Image
					source={require('../assets/image/toy.png')}
					style={styles.image}
					resizeMode="contain"
				/>
				<Text style={styles.title}> Pick Your Age Group!</Text>

				<FlatList
					data={ageGroups}
					renderItem={renderItem}
					keyExtractor={(item) => item.id}
					contentContainerStyle={styles.ageList}
				/>
				<View style={styles.bottomButtonContainer}>
					<PressableButton title="Next ➡️" onPress={handleNext} style={styles.nextButton} />
				</View>
			</View>
			<CustomAlert
				visible={showAlert}
				title="Selection Required"
				message="Please select an age group before proceeding."
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
		marginBottom: 6,
		textAlign: 'center',
	},
	ageList: {
		width: '100%',
		alignItems: 'center',
		paddingBottom: 20,
	},
	ageBox: {
		width: 300,
		height: 55,
		backgroundColor: '#ffffff',
		marginVertical: 8,
		borderRadius: 25,
		justifyContent: 'center',
		alignItems: 'center',
		// elevation: 4,
		// shadowColor: '#000',
		// shadowOpacity: 0.1,
		// shadowRadius: 5,
		// shadowOffset: { width: 1, height: 2 },
	},
	selectedBox: {
		backgroundColor: 'rgba(76, 175, 80, 0.9)',
		borderColor: 'rgba(76, 175, 80, 0.9)',
		borderWidth: 1.5,
	},
	ageText: {
		fontSize: 17,
		fontWeight: '600',
		color: '#000',
	},
	selectedText: {
		color: '#000080',
		fontWeight: 'bold',
	},
	nextButton: {
		paddingVertical: 12,
		paddingHorizontal: 35,
		borderRadius: 15,
	},
	bottomButtonContainer: {
		marginTop: 100,
		marginBottom: 100,
	},
});

export default AgeSelectionScreen;
