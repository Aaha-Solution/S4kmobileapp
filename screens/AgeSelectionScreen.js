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
		paddingVertical: height * 0.05,
		paddingHorizontal: width * 0.05,
	},
	image: {
		width: width * 0.35,
		height: height * 0.2,
		marginBottom: height * 0.025,
	},
	title: {
		fontSize: width * 0.06,
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
		marginBottom: height * 0.015,
	},
	ageBox: {
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
	ageText: {
		fontSize: width * 0.045,
		fontWeight: '600',
		color: '#000',
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
	},
	bottomButtonContainer: {
		marginTop: height * 0.05,
	},
});

export default AgeSelectionScreen;