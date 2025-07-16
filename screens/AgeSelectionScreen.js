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
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { setLevel } from '../Store/userSlice';
import PressableButton from '../component/PressableButton';
import LinearGradient from 'react-native-linear-gradient';
import CustomAlert from '../component/CustomAlertMessage';
import { getBackendLevel } from '../utils/levelUtils';

const { width, height } = Dimensions.get('window');

const ageGroups = [
	{ id: '1', name: 'PreSchool (4–6 years)' },
	{ id: '2', name: 'Junior (7 & above years)' },
];

const AgeSelectionScreen = () => {
	const dispatch = useDispatch();
	const selectedLevel = useSelector((state) => state.user.selectedLevel);
	console.log('Selected Level:', selectedLevel);
	const [showAlert, setShowAlert] = useState(false);
	const navigation = useNavigation();
	const [animations] = useState(
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
		const backendLevel = getBackendLevel(group.name);
		dispatch(setLevel(backendLevel));
	};

	const handleNext = () => {
		if(!selectedLevel || selectedLevel === 'null' || selectedLevel === undefined) {
			setShowAlert(true);
			return;
		}
		else {
			navigation.reset({
				index: 0,
				routes: [{ name: 'MainTabs' }],
			});
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

				<Text style={styles.title}>Pick Your Age Group!</Text>

				<View style={styles.ageList}>
					{ageGroups.map((item) => {
						const isSelected = selectedLevel === getBackendLevel(item.name);
						return (
							<TouchableOpacity
								key={item.id}
								onPress={() => handleAgeSelect(item)}
								style={styles.ageTouchable}
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
					})}
				</View>

				<View style={styles.bottomButtonContainer}>
					<PressableButton title="Next ➡️" onPress={handleNext} style={styles.nextButton} />
				</View>
			</ScrollView>

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
	scrollContent: {
		flexGrow: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: height * 0.04,
		paddingHorizontal: width * 0.06,
	},
	image: {
		width: width * 0.4,
		height: height * 0.22,
		marginBottom: height * 0.03,
	},
	title: {
		fontSize: Math.min(width * 0.065, 24),
		fontWeight: 'bold',
		color: '#4B0082',
		marginBottom: height * 0.03,
		textAlign: 'center',
	},
	ageList: {
		width: '100%',
		alignItems: 'center',
	},
	ageTouchable: {
		width: '100%',
		alignItems: 'center',
		marginBottom: height * 0.02,
	},
	ageBox: {
		width: '85%',
		minHeight: height * 0.065,
		backgroundColor: '#fff',
		borderRadius: 25,
		justifyContent: 'center',
		alignItems: 'center',

		// // Elevation for Android
		// elevation: 3,
		// // Shadow for iOS
		// shadowColor: '#000',
		// shadowOffset: { width: 1, height: 2 },
		// shadowOpacity: 0.1,
		// shadowRadius: 3,
		paddingHorizontal: width * 0.02,
	},
	selectedBox: {
		backgroundColor: 'rgba(76, 175, 80, 0.9)',
		borderColor: '#4CAF50',
		borderWidth: 2,
	},
	ageText: {
		fontSize: Math.min(width * 0.048, 18),
		fontWeight: '600',
		color: '#000',
		textAlign: 'center',
	},
	selectedText: {
		color: '#000080',
		fontWeight: 'bold',
	},
	nextButton: {
		paddingVertical: height * 0.015,
		paddingHorizontal: width * 0.15,
		borderRadius: 15,
		backgroundColor: '#FF8C00',
		minWidth: width * 0.5,
		alignSelf: 'center',
	},
	bottomButtonContainer: {
		marginTop: height * 0.05,
		marginBottom: height * 0.03,
	},
});
export default AgeSelectionScreen;