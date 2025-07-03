import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
	View,
	Text,
	FlatList,
	TouchableOpacity,
	StyleSheet,
	Image,
	Dimensions,
	BackHandler,
	Alert
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import CustomAlert from '../component/CustomAlertMessage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import { setPaidStatus, addPaidAccess, setSelectedLevel, setLevel, setLastPaidCombination, setLanguage, setAllPaidAccess } from '../Store/userSlice';
import { useStripe } from '@stripe/stripe-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBackendLevel, getDisplayLevel } from '../utils/levelUtils';
import DropDownPicker from 'react-native-dropdown-picker';

const languageLabels = {
	Gujarati: 'Gujarati',
	Panjabi: 'Panjabi',
	Hindi: 'Hindi',
};

const levelLabels = {
	Junior: 'Junior',
	Pre_Junior: 'Pre-Junior',
};

const languageOptions = [
	{ label: 'Gujarati', value: 'Gujarati' },
	{ label: 'Panjabi', value: 'Panjabi' },
	{ label: 'Hindi', value: 'Hindi' },
];
const levelOptions = [
	{ label: 'Junior', value: 'Junior' },
	{ label: 'Pre-Junior', value: 'Pre_Junior' },
];

const VideoListScreen = ({ navigation, route }) => {
	const dispatch = useDispatch();
	const paidAccess = useSelector(state => state.user.paidAccess);
	const selectedLevel = useSelector(state => state.user.selectedLevel);
	const selectedLanguage = useSelector(state => state.user.selectedLanguage);
	const users_id = useSelector(state => state.user.user.users_id);
	const isPaid = useSelector(state => state.user.isPaid);
	const [videos, setVideos] = useState([]);
	const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
	const [levelDropdownOpen, setLevelDropdownOpen] = useState(false);
	const [languageValue, setLanguageValue] = useState(selectedLanguage);
	const [levelValue, setLevelValue] = useState(selectedLevel ? getBackendLevel(selectedLevel) : null);
	const [showAlert, setShowAlert] = useState(false);
	const [loading, setLoading] = useState(false);
	const [initialVisitCompleted, setInitialVisitCompleted] = useState(false);
	const [lastPaidCombination, setLastPaidCombination] = useState(null);
	const [showPaywall, setShowPaywall] = useState(false);
	const prevLevelValue = useRef(levelValue);
	const [lastUnlockedCombo, setLastUnlockedCombo] = useState({
		language: selectedLanguage,
		level: selectedLevel
	});

	const backendLevel = getBackendLevel(selectedLevel);
	const backendLanguage = selectedLanguage;
	const isUnlocked = paidAccess.some(
		item => item.language === backendLanguage && item.level === backendLevel
	);

	const { initPaymentSheet, presentPaymentSheet } = useStripe();
	const isHomeScreen = route.name === 'Home';
	const baseURL = 'https://smile4kidsbackend-production.up.railway.app/videos/by-category';

	console.log("paidAccess",paidAccess)
	console.log("selectedLanguage",selectedLanguage)
	console.log("selectedLevel",selectedLevel)
	console.log("iscurrcombo",isUnlocked)

	useEffect(() => {
		if (isUnlocked) {
			fetchVideos();
		} else {
			setVideos([]);
		}
	}, [selectedLanguage, selectedLevel, paidAccess]);

	useFocusEffect(
		useCallback(() => {
			if (!isHomeScreen) return;
			const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
				setShowAlert(true);
				return true;
			});
			return () => backHandler.remove();
		}, [isHomeScreen])
	);

	const handleConfirmExit = () => {
		setShowAlert(false);
		BackHandler.exitApp();
	};
	const handleCancelExit = () => setShowAlert(false);

	const fetchVideos = useCallback(async () => {
		if (!selectedLevel || !languageValue) {
			setVideos([]);
			return;
		}
		setLoading(true);
		setVideos([]);
		const url = `${baseURL}?language=${languageValue}&level=${backendLevel}`;

		try {
			const token = await AsyncStorage.getItem('token');
			const response = await axios.get(url, {
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			});
			if (response.status === 200 && Array.isArray(response.data)) {
				setVideos(response.data);
			} else {
				setVideos([]);
			}
		} catch (error) {
			console.error('API fetch error:', error);
			setVideos([]);
		} finally {
			setLoading(false);
		}
	}, [languageValue, selectedLevel]);

	useEffect(() => {
		fetchVideos();
	}, [selectedLevel, languageValue]);

	useEffect(() => {
		if (languageValue) {
			setLanguage(languageValue);
			dispatch(setLanguage(languageValue));
		}
	}, [languageValue]);

	useEffect(() => {
		if (selectedLevel) {
			setLevelValue(getBackendLevel(selectedLevel));
		}
	}, [selectedLevel]);

	useEffect(() => {
		const unsubscribe = navigation.addListener('focus', () => {
			fetchVideos();
		});
		return unsubscribe;
	}, [navigation, fetchVideos]);

	const handleVideoPress = useCallback((videoItem) => {
		navigation.navigate('VideoPlayer', { videoUri: videoItem });
	}, [navigation]);

	const renderItem = ({ item, index }) => {
		const backendLevel = getBackendLevel(selectedLevel);
		const isUnlocked = paidAccess.some(
			access => access.language === selectedLanguage && access.level === backendLevel
		);

		const handlePress = () => {
			if (!isUnlocked) {
				Alert.alert(
					'Payment Required',
					'Please pay to continue.'
				);
				return;
			}
			handleVideoPress(item);
		};

		return (
			<TouchableOpacity
				style={styles.kidCard}
				onPress={handlePress}
				activeOpacity={isUnlocked ? 0.9 : 1}
				disabled={false}
			>
				<Image
					source={item.thumbnailUrl ? { uri: item.thumbnailUrl } : require('../assets/image/splash.png')}
					style={{
						width: imageWidth,
						height: imageWidth * 0.7,
						borderRadius: 12,
						backgroundColor: '#E6E6FA',
						opacity: isUnlocked ? 1 : 0.5,
					}}
					resizeMode="contain"
				/>
				<View style={styles.kidTextContainer}>
					<Text style={styles.kidTitle} numberOfLines={2}>
						{item.title || `Video ${index + 1}`}
					</Text>
					<Text style={styles.kidSubText}>
						{item.duration ? `${item.duration} min` : ''}
					</Text>
				</View>
				<Icon name="chevron-forward" size={24} color="#fff" />
				{!isUnlocked && (
					<View style={styles.lockOverlay}>
						<Icon name="lock-closed" size={32} color="#fff" />
					</View>
				)}
			</TouchableOpacity>
		);
	};
	const screenWidth = Dimensions.get('window').width;
	const imageWidth = screenWidth * 0.25;

	useEffect(() => {
		(async () => {
			const hasVisited = await AsyncStorage.getItem('hasVisitedVideoScreen');
			if (hasVisited) {
				setInitialVisitCompleted(true);
			} else {
				await AsyncStorage.setItem('hasVisitedVideoScreen', 'true');
			}
			setInitialVisitCompleted(true);
		})();
	}, []);

	const HandlePay = async () => {
		try {
			const token = await AsyncStorage.getItem('token');
			const cleanLevel = getBackendLevel(selectedLevel);
			const paymentType = `${languageValue}-${cleanLevel}`;
			const selections = [{ language: languageValue, level: cleanLevel }];

			const response = await fetch('https://smile4kidsbackend-production.up.railway.app/payment/create-payment-intent', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					type: paymentType,
					currency: 'gbp',
					user_id: users_id,
					language: languageValue,
					level: cleanLevel,
					courseType: paymentType,
					selections: selections,
				}),
			});
			const rawText = await response.text();
			let data;
			try {
				data = JSON.parse(rawText);
			} catch (error) {
				Alert.alert("Server Error", "Invalid response from payment server.");
				return;
			}
			const clientSecret = data.clientSecret;
			if (!clientSecret) {
				Alert.alert("Payment Error", data.message || "No client secret received.");
				return;
			}
			const { error: initError } = await initPaymentSheet({
				paymentIntentClientSecret: clientSecret,
				merchantDisplayName: 'Smile4Kids',
			});
			if (initError) {
				Alert.alert("Payment Error", initError.message);
				return;
			}
			const { error: presentError } = await presentPaymentSheet();
			if (presentError) {
				Alert.alert("Payment Failed", presentError.message);
			} else {
				Alert.alert("Success", "Your payment was successful!");
				dispatch(setPaidStatus(true));
				dispatch(addPaidAccess({ language: languageValue, level: cleanLevel }));
			}
		} catch (err) {
			Alert.alert("Unexpected Error", "Something went wrong during payment.");
		}
	};

	useEffect(() => {
		(async () => {
			const hasSeenPaywall = await AsyncStorage.getItem('hasSeenPaywall');
			if (!hasSeenPaywall && !isUnlocked && initialVisitCompleted) {
				setShowPaywall(true);
				await AsyncStorage.setItem('hasSeenPaywall', 'true');
			} else {
				setShowPaywall(false);
			}
		})();
	}, [isUnlocked, initialVisitCompleted]);

	// Update lastUnlockedCombo whenever a new unlocked combo is selected
	useEffect(() => {
		if (isUnlocked && selectedLanguage && selectedLevel) {
			setLastUnlockedCombo({ language: selectedLanguage, level: selectedLevel });
		}
	}, [isUnlocked, selectedLanguage, selectedLevel]);

	// Language dropdown handler
	const handleLanguageChange = (val) => {
		if (!val) return;
		setLanguageValue(val);
	};

	// Level dropdown handler
	const handleLevelChange = (val) => {
		if (!val) return;
		setLevelValue(val);
		dispatch(setLevel(getBackendLevel(val)));
	};

	return (
		<LinearGradient colors={['#87CEEB', '#ADD8E6', '#F0F8FF']} style={styles.container}>
			{/* Language & Level Dropdowns Side by Side */}
			<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20, marginTop: 16, marginBottom: 16, zIndex: 20 }}>
				<View style={{ flex: 1, marginRight: 8 }}>
					<DropDownPicker
						open={languageDropdownOpen}
						value={languageValue}
						items={languageOptions}
						setOpen={setLanguageDropdownOpen}
						setValue={val => handleLanguageChange(val)}
						setItems={() => {}}
						placeholder="Select Language"
						style={{
							backgroundColor: languageValue ? '#FF8C00' : '#F0F8FF',
							borderColor: languageValue ? '#FF8C00' : '#E0E0E0',
							borderRadius: 8,
							shadowColor: '#000',
							shadowOpacity: 0.08,
							shadowOffset: { width: 0, height: 2 },
							shadowRadius: 4,
							elevation: 2,
						}}
						dropDownContainerStyle={{
							backgroundColor: '#FFF',
							borderColor: '#E0E0E0',
							borderRadius: 8,
						}}
						textStyle={{ color: '#fff', fontWeight: 'bold' }}
						placeholderStyle={{ color: '#888', fontWeight: 'bold' }}
						listItemLabelStyle={{ color: '#333', fontWeight: 'bold' }}
						selectedItemLabelStyle={{ color: '#FF8C00', fontWeight: 'bold' }}
						selectedItemContainerStyle={{ backgroundColor: '#FFE0B2' }}
						arrowIconStyle={{ tintColor: '#fff' }}
					/>
				</View>
				<View style={{ flex: 1, marginLeft: 8 }}>
					<DropDownPicker
						open={levelDropdownOpen}
						value={levelValue}
						items={levelOptions}
						setOpen={setLevelDropdownOpen}
						setValue={val => handleLevelChange(val)}
						setItems={() => {}}
						placeholder="Select Level"
						style={{
							backgroundColor: levelValue ? '#4CAF50' : '#F0F8FF',
							borderColor: levelValue ? '#4CAF50' : '#E0E0E0',
							borderRadius: 8,
							shadowColor: '#000',
							shadowOpacity: 0.08,
							shadowOffset: { width: 0, height: 2 },
							shadowRadius: 4,
							elevation: 2,
						}}
						dropDownContainerStyle={{
							backgroundColor: '#FFF',
							borderColor: '#E0E0E0',
							borderRadius: 8,
						}}
						textStyle={{ color: '#fff', fontWeight: 'bold' }}
						placeholderStyle={{ color: '#888', fontWeight: 'bold' }}
						listItemLabelStyle={{ color: '#333', fontWeight: 'bold' }}
						selectedItemLabelStyle={{ color: '#4CAF50', fontWeight: 'bold' }}
						selectedItemContainerStyle={{ backgroundColor: '#C8E6C9' }}
						arrowIconStyle={{ tintColor: '#fff' }}
					/>
				</View>
			</View>

			{/* Video List */}
			<FlatList
				data={videos}
				keyExtractor={(item) => item._id || item.id || item.videoUrl || Math.random().toString()}
				contentContainerStyle={styles.listContainer}
				renderItem={renderItem}
				ListEmptyComponent={() => (
					<View style={styles.emptyContainer}>
						<Text style={styles.emptyText}>
							{loading
								? 'Loading videos...'
								: selectedLevel
									? 'No videos available for this selection'
									: 'Please select an age group'}
						</Text>
					</View>
				)}
			/>

			<CustomAlert
				visible={showAlert}
				title="Exit App"
				message="Are you sure you want to exit the app?"
				onConfirm={handleConfirmExit}
				onCancel={handleCancelExit}
			/>

			{/* Payment Blur Overlay */}
			{showPaywall && (
				<View style={styles.blurOverlay}>
					<View style={styles.blurContent}>
						<Text style={styles.blurTitle}>Unlock Videos</Text>
						<Text style={styles.blurDescription}>
							Pay £45 to access fun & engaging kids videos
						</Text>
						<TouchableOpacity
							onPress={HandlePay}
							style={styles.payNowButton}
						>
							<Text style={styles.payNowText}>Pay £45</Text>
						</TouchableOpacity>
					</View>
				</View>
			)}
		</LinearGradient>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1 },
	languageRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 20,
		paddingTop: 10,
	},
	levelRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 20,
		paddingVertical: 10,
	},
	languageButton: {
		backgroundColor: '#FF8C00',
		paddingVertical: 10,
		borderRadius: 8,
		flex: 1,
		marginHorizontal: 5,
		alignItems: 'center',
	},
	languageButtonActive: {
		backgroundColor: 'rgba(76, 175, 80, 0.9)',
	},
	languageButtonText: {
		color: 'white',
		fontWeight: 'bold',
		fontSize: 16,
	},
	languageHeader: {
		paddingVertical: 10,
		width: 200,
		alignSelf: 'center',
		paddingHorizontal: 20,
		backgroundColor: '#FF8C00',
		marginTop: 20,
		borderRadius: 25,
		alignItems: 'center',
		justifyContent: 'center',
	},
	ageGroupText: {
		fontSize: 16,
		color: 'white',
	},
	loadingContainer: {
		padding: 20,
		alignItems: 'center',
	},
	loadingText: {
		fontSize: 16,
		color: '#666',
	},
	listContainer: {
		padding: 10,
		flexGrow: 1,
	},
	videoListItem: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'white',
		marginVertical: 8,
		marginHorizontal: 12,
		padding: 10,
		borderRadius: 12,
		elevation: 2,
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowOffset: { width: 0, height: 1 },
	},
	thumbnailImage: {
		width: 80,
		height: 80,
		borderRadius: 10,
		backgroundColor: '#ccc',
	},
	videoTextContainer: {
		marginLeft: 12,
		flex: 1,
	},
	videoTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333',
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	emptyText: {
		fontSize: 16,
		color: '#666',
		textAlign: 'center',
	},
	kidCard: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'white',
		marginVertical: 8,
		marginHorizontal: 12,
		padding: 12,
		borderRadius: 16,
		shadowColor: '#000',
		shadowOpacity: 0.2,
		shadowRadius: 6,
		shadowOffset: { width: 0, height: 2 },
		elevation: 4,
	},
	kidTextContainer: {
		flex: 1,
		marginLeft: 12,
	},
	kidTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#4B0082',
	},
	kidSubText: {
		fontSize: 13,
		color: '#6A5ACD',
		marginTop: 4,
	},
	blurOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 0, 0, 0.6)',
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 999,
	},
	blurContent: {
		backgroundColor: '#fff',
		padding: 30,
		borderRadius: 20,
		alignItems: 'center',
		width: '80%',
		elevation: 10,
	},
	blurTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#4B0082',
		marginBottom: 10,
		textAlign: 'center',
	},
	blurDescription: {
		fontSize: 16,
		color: '#555',
		textAlign: 'center',
		marginBottom: 20,
	},

	payNowButton: {
		backgroundColor: '#FF8C00',
		paddingVertical: 12,
		paddingHorizontal: 30,
		borderRadius: 25,
	},

	payNowText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
	},

	lockOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0,0,0,0.4)',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 16,
		zIndex: 10,
	},
});
export default VideoListScreen;
