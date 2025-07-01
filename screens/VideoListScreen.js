import React, { useEffect, useState, useCallback } from 'react';
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
import { setPaidStatus, addPaidAccess } from '../Store/userSlice';
import { useStripe } from '@stripe/stripe-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBackendLevel, getDisplayLevel } from '../utils/levelUtils';

const languageLabels = {
	Gujarati: 'Gujarati',
	Panjabi: 'Panjabi',
	Hindi: 'Hindi',
};

const VideoListScreen = ({ navigation, route }) => {
	const dispatch = useDispatch();
	const paidAccess = useSelector(state => state.user.paidAccess);
	const selectedLevel = useSelector(state => state.user.selectedLevel);
	const selectedLanguage = useSelector(state => state.user.selectedLanguage);
	const users_id = useSelector(state => state.user.user.users_id);
	const isPaid = useSelector(state => state.user.isPaid);

	const [videos, setVideos] = useState([]);
	const [language, setLanguage] = useState(selectedLanguage || 'Hindi');
	const [showAlert, setShowAlert] = useState(false);
	const [loading, setLoading] = useState(false);
	const [initialVisitCompleted, setInitialVisitCompleted] = useState(false);

	const [lastPaidCombination, setLastPaidCombination] = useState(null);

	const { initPaymentSheet, presentPaymentSheet } = useStripe();
	const isHomeScreen = route.name === 'Home';
	const baseURL = 'https://smile4kids-backend.onrender.com/videos/by-category';

	const backendLevel = getBackendLevel(selectedLevel);
	const normalize = (str) => str?.toLowerCase().replace(/[_–—\s]/g, '');
	const currentLevel = getBackendLevel(selectedLevel);
	const isCurrentCombinationPaid = paidAccess.some((item) => {
		const match =
			normalize(item.language) === normalize(selectedLanguage) &&
			normalize(item.level) === normalize(currentLevel);

		console.log("🔍 Checking combo:", item, "Match:", match);
		return match;
	});

	const isUnlocked = paidAccess.some(
		item => item.language === selectedLanguage && item.level === selectedLevel
	);

	useEffect(() => {
		if (isUnlocked) {
			fetchVideos();
		} else {
			setVideos([]); // ensure blank list if no access
		}
	}, [selectedLanguage, selectedLevel, paidAccess]);


	useEffect(() => {
		console.log('Redux Selected Age Group:', selectedLevel);
		console.log('Redux Selected Language:', selectedLanguage);
		console.log('🟡 isPaid from Redux:', isPaid);
		console.log("✅ paidAccess:", paidAccess);
		console.log("✅ current combo:", { language, selectedLevel });
		console.log("✅ isCurrentCombinationPaid:", isCurrentCombinationPaid);
	}, [paidAccess, language, selectedLevel, isPaid]);

	useEffect(() => {
		if (!isHomeScreen) return;
		const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
			setShowAlert(true);
			return true;
		});
		return () => backHandler.remove();
	}, [isHomeScreen]);

	useFocusEffect(
		useCallback(() => {
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
		if (!selectedLevel || !language) {
			setVideos([]);
			return;
		}
		setLoading(true);
		setVideos([]);
		const url = `${baseURL}?language=${language}&level=${backendLevel}`;
		console.log("url", url);

		try {
			const token = await AsyncStorage.getItem('token');
			const response = await axios.get(url, {
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			});
			console.log("API Response:", response.data);
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
	}, [language, selectedLevel]);

	useEffect(() => {
		fetchVideos();
	}, [selectedLevel, language]);

	useEffect(() => {
		if (selectedLanguage) {
			setLanguage(selectedLanguage);
		}
	}, [selectedLanguage]);

	useEffect(() => {
		const unsubscribe = navigation.addListener('focus', () => {
			fetchVideos();
		});
		return unsubscribe;
	}, [navigation, fetchVideos]);

	const handleVideoPress = useCallback((videoItem) => {
		navigation.navigate('VideoPlayer', { videoUri: videoItem });
	}, [navigation]);

	const handleLanguageSelect = useCallback((langKey) => {
		const isPaidCombo = paidAccess.some(
			item => item.language === langKey && item.level === backendLevel
		);

		if (isPaidCombo) {
			setLanguage(langKey);
		} else {
			const currentAttempt = `${langKey} - ${backendLevel}`;
			const lastPaid = lastPaidCombination
				? `${lastPaidCombination.language} - ${lastPaidCombination.level}`
				: 'previous paid selection';

			Alert.alert(
				"Locked Videos",
				`Videos for  ${currentAttempt}are currently locked. 🔒\n\nPlease complete the payment to unlock them.\n\nShowing ${lastPaid} instead.`,
				[
					{
						text: "OK",
						onPress: () => {
							if (lastPaidCombination) {
								setLanguage(lastPaidCombination.language);
							}
						}
					}
				]
			);
		}
	}, [paidAccess, selectedLevel, lastPaidCombination]);


	const renderItem = ({ item, index }) => (
		<TouchableOpacity
			style={styles.kidCard}
			onPress={() => handleVideoPress(item)}
			activeOpacity={0.9}
		>
			<Image
				source={
					item.thumbnailUrl
						? { uri: item.thumbnailUrl }
						: require('../assets/image/splash.png')
				}
				style={{
					width: imageWidth,
					height: imageWidth * 0.7,
					borderRadius: 12,
					backgroundColor: '#E6E6FA',
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
		</TouchableOpacity>
	);
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
		})();
	}, []);


	const getFormattedLevel = (level, lang) => {
		if (!level) return 'Pre_Junior';

		const lower = level.toLowerCase();

		if (lower.includes('junior') && (lower.includes('7') || lower.includes('above'))) {
			return 'Junior';
		} else if (lower.includes('prejunior') || lower.includes('4-6')) {
			return 'Pre_Junior';  // ✅ Capital J for all, matches backend
		}
		return 'Pre_Junior';  // fallback
	};


	const HandlePay = async () => {
		try {
			const token = await AsyncStorage.getItem('token'); // ✅
			const cleanLevel = getBackendLevel(selectedLevel); // returns "Pre_Junior"
			const paymentType = `${language}-${cleanLevel}`;   // returns "Gujarati-Pre_Junior"

			console.log("🟠 Payment Type:", paymentType);
			const selections = [{
				language: language,
				level: cleanLevel
			}];

			const response = await fetch('https://smile4kids-backend.onrender.com/payment/create-payment-intent', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					type: paymentType,
					currency: 'gbp',
					user_id: users_id,
					language,
					level: cleanLevel,
					courseType: paymentType,
					selections: selections,

				}),
			});

			const rawText = await response.text();
			console.log("🟠 Raw Response Text:", rawText);

			let data;
			try {
				data = JSON.parse(rawText);
			} catch (error) {
				console.error("❌ Failed to parse JSON:", error);
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
				dispatch(addPaidAccess({ language, level: cleanLevel }));


			}
		} catch (err) {
			console.error("PaymentSheet Error:", err);
			Alert.alert("Unexpected Error", "Something went wrong during payment.");
		}
	};
	return (
		<LinearGradient colors={['#87CEEB', '#ADD8E6', '#F0F8FF']} style={styles.container}>
			<View style={styles.languageRow}>
				{Object.keys(languageLabels).map((langKey) => (
					<TouchableOpacity
						key={langKey}
						style={[
							styles.languageButton,
							language === langKey && styles.languageButtonActive,
						]}
						onPress={() => handleLanguageSelect(langKey)}
					>
						<Text style={styles.languageButtonText}>{languageLabels[langKey]}</Text>
					</TouchableOpacity>
				))}
			</View>
			{/*Selected Age Header*/}

			<View style={styles.languageHeader}>
				<Text style={styles.ageGroupText}>{getDisplayLevel(selectedLevel)}</Text>
			</View>
			
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
					extraData={[selectedLevel, language, loading]}
				/>
		
			<CustomAlert
				visible={showAlert}
				title="Exit App"
				message="Are you sure you want to exit the app?"
				onConfirm={handleConfirmExit}
				onCancel={handleCancelExit}
			/>

			{!isCurrentCombinationPaid && initialVisitCompleted && (
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
	container: {
		flex: 1,
	},
	languageRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 20,
		paddingTop: 10,
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
});
export default VideoListScreen;
