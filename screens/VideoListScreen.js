import React, { useEffect, useState, useCallback } from 'react';
import {
	View,
	Text,
	FlatList,
	TouchableOpacity,
	StyleSheet,
	Image,
	Dimensions,
	BackHandler
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import CustomAlert from '../component/CustomAlertMessage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import { setPaidStatus, setProfile, addPaidAccess } from '../Store/userSlice';
import { useStripe } from '@stripe/stripe-react-native';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Language short labels
const languageLabels = {
	Gujarati: 'Gujarati',
	Panjabi: 'Panjabi',
	Hindi: 'Hindi',
};

const VideoListScreen = ({ navigation, route }) => {
	const dispatch = useDispatch();
	const paidAccess = useSelector(state => state.user.paidAccess);
	const selectedAgeGroup = useSelector(state => state.user.selectedAgeGroup);
	const selectedLanguage = useSelector(state => state.user.selectedLanguage);
	const [videos, setVideos] = useState([]);
	const [language, setLanguage] = useState(selectedLanguage || 'Hindi');
	// ✅ Check if this language + ageGroup is already paid
	const isCurrentCombinationPaid = paidAccess.some(
		item => item.language === language && item.ageGroup === selectedAgeGroup
	);
	const [showAlert, setShowAlert] = useState(false);
	const [loading, setLoading] = useState(false);
	const { initPaymentSheet, presentPaymentSheet } = useStripe();
	const [initialVisitCompleted, setInitialVisitCompleted] = useState(false);
	const isPaid = useSelector(state => state.user.isPaid);
    const [lastPaidCombination, setLastPaidCombination] = useState(null);

	const isHomeScreen = route.name === 'Home';

	const baseURL = 'https://smile4kids-backend.onrender.com/videos/by-category';

	useEffect(() => {
		console.log('Redux Selected Age Group:', selectedAgeGroup);
		console.log('Redux Selected Language:', selectedLanguage);
	}, [selectedAgeGroup, selectedLanguage]);

	// Debug the Redux value
	useEffect(() => {
		console.log('🟡 isPaid from Redux:', isPaid);
	}, [isPaid]);
	// Back button handler
	useEffect(() => {
		if (!isHomeScreen) return;
		const backAction = () => {
			setShowAlert(true);
			return true;
		};
		const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
		return () => backHandler.remove();
	}, [isHomeScreen]);
	useEffect(() => {
		console.log("✅ paidAccess:", paidAccess);
		console.log("✅ current combo:", { language, selectedAgeGroup });
		console.log("✅ isCurrentCombinationPaid:", isCurrentCombinationPaid);
	}, [paidAccess, language, selectedAgeGroup]);

	useFocusEffect(
		useCallback(() => {
			const backAction = () => {
				setShowAlert(true);
				return true;
			};
			const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
			return () => backHandler.remove();
		}, [isHomeScreen])
	);

	const handleConfirmExit = () => {
		setShowAlert(false);
		BackHandler.exitApp();
	};

	const handleCancelExit = () => {
		setShowAlert(false);
	};
	console.log("Sending preferences:", selectedAgeGroup, selectedLanguage);

	const getFormattedLevel = (ageGroup, lang) => {
		if (!ageGroup) return 'Pre_Junior';

		const lower = ageGroup.toLowerCase();

		if (lower.includes('junior') && (lower.includes('7') || lower.includes('above'))) {
			return 'Junior';
		} else if (lower.includes('prejunior') || lower.includes('4-6')) {
			return 'Pre_Junior';  // ✅ Capital J for all, matches backend
		}
		return 'Pre_Junior';  // fallback
	};
	const fetchVideos = useCallback(async () => {
		if (!selectedAgeGroup || !language) {
			setVideos([]);
			return;
		}
		setLoading(true);
		setVideos([]);
		const url = `${baseURL}?language=${language}&level=${formattedLevel}`;
		console.log("url", url);

		try {
			const token = await AsyncStorage.getItem('token');

			const response = await axios.get(url, {

				headers: {
					'Authorization': `Bearer ${token}`,
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
	}, [language, selectedAgeGroup]);


	useEffect(() => {
		fetchVideos();
	}, [selectedAgeGroup, language, fetchVideos]);

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
			item => item.language === langKey && item.ageGroup === selectedAgeGroup
		);
	
		if (isPaidCombo) {
			setLanguage(langKey);
		} else {
			const currentAttempt = `${langKey} - ${selectedAgeGroup}`;
			const lastPaid = lastPaidCombination
				? `${lastPaidCombination.language} - ${lastPaidCombination.ageGroup}`
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
	}, [paidAccess, selectedAgeGroup, lastPaidCombination]);
	

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


	const HandlePay = async () => {
		try {
			const paymentType = `${language}-${getFormattedLevel(selectedAgeGroup, language)}`;
			console.log("🟠 Payment Type:", paymentType);

			const response = await fetch('https://smile4kidsbackend-production.up.railway.app/payment/create-payment-intent', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					type: paymentType, // ✅ FIXED
					currency: 'gbp'
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
			console.log("🟠 Client Secret:", clientSecret);

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
				dispatch(addPaidAccess({ language, ageGroup: selectedAgeGroup }));
			}
		} catch (err) {
			console.error("PaymentSheet Error:", err);
			Alert.alert("Unexpected Error", "Something went wrong during payment.");
		}
		if (presentError) {
			Alert.alert("Payment Failed", presentError.message);
		} else {
			Alert.alert("Success", "Your payment was successful!");
			dispatch(setPaidStatus(true)); // ✅ Sets global paid flag
			dispatch(addPaidAccess({ language, ageGroup: selectedAgeGroup })); // ✅ Sets combination-specific flag
			setLastPaidCombination({ language, ageGroup: selectedAgeGroup });
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

			<View style={styles.languageHeader}>
				<Text style={styles.ageGroupText}>{selectedAgeGroup || 'Select Age Group'}</Text>
			</View>

			{loading && (
				<View style={styles.loadingContainer}>
					<Text style={styles.loadingText}>Loading videos...</Text>
				</View>
			)}

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
								: selectedAgeGroup
									? 'No videos available for this selection'
									: 'Please select an age group'
							}
						</Text>
					</View>
				)}
				extraData={[selectedAgeGroup, language, loading]}
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
						<Text style={styles.blurTitle}>Unlock  Videos</Text>
						<Text style={styles.blurDescription}>
							Pay £45 to access fun & engaging kids videos
						</Text>

						<TouchableOpacity
							onPress={() => {
								dispatch(setPaidStatus(true));
								dispatch(addPaidAccess({ language, ageGroup: selectedAgeGroup }));
							  }}							  
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
