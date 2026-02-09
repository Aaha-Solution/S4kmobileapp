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
	Alert,
	useWindowDimensions,
	StatusBar,
	SafeAreaView,
	ActivityIndicator,
	Modal,
	TextInput,
	Pressable
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import CustomAlert from '../component/CustomAlertMessage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import { setPaidStatus, addPaidAccess } from '../Store/userSlice';
import * as RNIap from 'react-native-iap';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBackendLevel, getDisplayLevel } from '../utils/levelUtils';

const languageLabels = {
	Gujarati: 'Gujarati',
	Panjabi: 'Panjabi',
	Hindi: 'Hindi',
};

const newproductId = [
	'video_panjabi_pre_junior',
	'video_panjabi_junior',
	'video_hindi_pre_junior',
	'video_hindi_junior',
	'video_gujarati_pre_junior',
	'video_gujarati_junior',
];

const VideoListScreen = ({ navigation, route }) => {
	const dispatch = useDispatch();
	const isMountedRef = useRef(true);
	const iapInitializedRef = useRef(false);
	const initializationAttemptedRef = useRef(false);

	// Redux state with fallbacks
	const paidAccess = useSelector(state => state.user?.paidAccess || []);
	const selectedLevel = useSelector(state => state.user?.selectedLevel);
	const selectedLanguage = useSelector(state => state.user?.selectedLanguage);
	const users_id = useSelector(state => state.user?.user?.users_id);
	const isPaid = useSelector(state => state.user?.isPaid || false);

	const [videos, setVideos] = useState([]);
	const [language, setLanguage] = useState(selectedLanguage || 'Hindi');
	const [showAlert, setShowAlert] = useState(false);
	const [loading, setLoading] = useState(false);
	const [initialVisitCompleted, setInitialVisitCompleted] = useState(false);
	const [productDetails, setProductDetails] = useState(null);
	const [iapReady, setIapReady] = useState(false);
	const [iapProducts, setIapProducts] = useState([]);
	const [isRestoring, setIsRestoring] = useState(false);
	const [screenError, setScreenError] = useState(null);
	const [iapInitializing, setIapInitializing] = useState(true);
	const [iapError, setIapError] = useState(null);

	const [num1, setnum1] = useState(0)
	const [num2, setnum2] = useState(0)
	const [useranswer, setuseranswer] = useState('')
	const [ismodelvisible, setmodelvisible] = useState(false)

	// // Debug state logging
	// useEffect(() => {
	// 	console.log(' SCREEN STATE:', {
	// 		selectedLevel,
	// 		selectedLanguage,
	// 		users_id,
	// 		videosCount: videos.length,
	// 		paidAccessCount: paidAccess.length,
	// 		language,
	// 		loading,
	// 		iapReady,
	// 		iapInitializing,
	// 		iapProductsCount: iapProducts.length,
	// 		iapError
	// 	});
	// }, [selectedLevel, selectedLanguage, users_id, videos, paidAccess, language, loading, iapReady, iapInitializing, iapProducts, iapError]);

	const backendLevel = selectedLevel ? getBackendLevel(selectedLevel) : 'Junior';
	const { width, height } = useWindowDimensions();
	const isTablet = width >= 700;
	const isLandscape = width > height;
	const headerWidth = isTablet ? Math.min(width * 0.5, 500) : 200;

	const isCurrentCombinationPaid = paidAccess.some(
		item => item.language === language && item.level === backendLevel
	);
	const screenWidth = Dimensions.get('window').width;
	const imageWidth = screenWidth * 0.25;
	const isHomeScreen = route?.name === 'Home';

	const baseURL = 'https://api.smile4kids.co.uk/videos/by-category/';

	// Generate correct SKU matching your product IDs
	const generateSKU = (language, backendLevel) => {
		const lang = language.toLowerCase();
		const levelSku = backendLevel === 'Junior' ? 'junior' : 'pre_junior';
		return `video_${lang}_${levelSku}`;
	};

	// Restore status bar when returning from other screens
	useFocusEffect(
		useCallback(() => {
			StatusBar.setHidden(false, 'fade');
		}, [])
	);

	// Fetch videos when component mounts or dependencies change
	useEffect(() => {
		if (selectedLevel && language) {
			fetchVideos();
		}
	}, [language, selectedLevel, paidAccess]);

	// Save preferences when they change
	useEffect(() => {
		const savePreferences = async () => {
			try {
				if (selectedLanguage && selectedLevel) {
					const preferences = {
						selectedLanguage,
						selectedLevel,
					};
					await AsyncStorage.setItem('selectedPreferences', JSON.stringify(preferences));
				}
			} catch (error) {
				console.error('Error saving preferences:', error);
			}
		};
		savePreferences();
	}, [selectedLanguage, selectedLevel]);

	// Handle Android back button on home screen
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

	// Exit Alert handlers
	const handleConfirmExit = () => {
		setShowAlert(false);
		BackHandler.exitApp();
	};

	const handleCancelExit = () => setShowAlert(false);

	// Fetch videos based on current language and level
	const fetchVideos = useCallback(async () => {
		if (!selectedLevel || !language) {
			console.warn(' Missing selectedLevel or language');
			setVideos([]);
			return;
		}

		setLoading(true);
		setVideos([]);
		setScreenError(null);
		const url = `${baseURL}?language=${language}&level=${backendLevel}`;

		console.log(' Fetching videos from:', url);

		try {
			const token = await AsyncStorage.getItem('token');
			if (!token) {
				console.error(' No token found');
				setScreenError('Authentication required. Please login again.');
				Alert.alert('Authentication Error', 'No authentication token found. Please login again.');
				setVideos([]);
				setLoading(false);
				return;
			}

			const response = await axios.get(url, {
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			});

			console.log(' Response status from fetch videos:', response.status);
			console.log(' Response data length:', response.data?.length);

			if (response.status === 200 && Array.isArray(response.data)) {
				setVideos(response.data);
				console.log(' Videos loaded:', response.data.length);
			} else {
				console.error(' Invalid response:', response.status);
				setScreenError(`Server error: ${response.status}`);
				setVideos([]);
			}
		} catch (error) {
			console.error(' Fetch error:', error.message);
			setScreenError(`Network error: ${error.message}`);
			setVideos([]);
		} finally {
			setLoading(false);
		}
	}, [language, selectedLevel, backendLevel]);

	// Fetch paid courses from backend with proper validation
	const fetchPaidCourses = async () => {
		try {
			console.log(' ============ FETCHING PAID COURSES ============');
			console.log(' User ID:', users_id);

			if (!users_id) {
				console.warn(' No user ID available');
				return;
			}

			const token = await AsyncStorage.getItem('token');
			if (!token) {
				console.warn(' No token available for fetching paid courses');
				return;
			}

			const response = await axios.get(
				`https://api.smile4kids.co.uk/payment/my-paid-videos?user_id=${users_id}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);

			console.log(' Backend Response Status for paid videos in videolist:', response.status);
			console.log(' Backend Response Data:', JSON.stringify(response.data, null, 2));

			const videos = response.data?.videos;
			if (!videos || Object.keys(videos).length === 0) {
				console.log(' ============ NO PAID COURSES FOUND ============');
				dispatch(setPaidStatus(false));
				return;
			}

			console.log(' ============ PROCESSING COURSES ============');

			Object.entries(videos).forEach(([language, levels]) => {
				Object.entries(levels).forEach(([level, courses]) => {
					courses.forEach((course, index) => {
						console.log(` Course ${language} - ${level} [${index + 1}]:`, {
							id: course.id,
							title: course.title,
						});

						// Add to Redux
						dispatch(addPaidAccess({
							language: course.language,
							level: course.level
						}));
					});
				});
			});

			dispatch(setPaidStatus(true));
			console.log(' ============ DONE PROCESSING ============');
		} catch (error) {
			console.error(' ============ ERROR FETCHING PAID COURSES ============');
			console.error(' Error:', error.message);
			dispatch(setPaidStatus(false));
		}
	};

	// Update language state if Redux selectedLanguage changes
	useEffect(() => {
		if (selectedLanguage) {
			setLanguage(selectedLanguage);
		}
	}, [selectedLanguage]);

	// Refresh videos when screen is focused
	useEffect(() => {
		const unsubscribe = navigation.addListener('focus', () => {
			if (selectedLevel && language) {
				fetchVideos();
			}
		});
		return unsubscribe;
	}, [navigation, fetchVideos, selectedLevel, language]);

	// Handle video item press
	const handleVideoPress = useCallback((videoItem) => {
		navigation.navigate('VideoPlayer', { videoUri: videoItem });
	}, [navigation]);

	// Language selection
	const handleLanguageSelect = useCallback((langKey) => {
		setLanguage(langKey);
	}, []);

	// Check initial visit
	useEffect(() => {
		(async () => {
			try {
				const hasVisited = await AsyncStorage.getItem('hasVisitedVideoScreen');
				if (hasVisited) {
					setInitialVisitCompleted(true);
				} else {
					await AsyncStorage.setItem('hasVisitedVideoScreen', 'true');
					setInitialVisitCompleted(true);
				}
			} catch (error) {
				console.error('Error checking initial visit:', error);
				setInitialVisitCompleted(true);
			}
		})();
	}, []);


	// Fetch paid courses
	useEffect(() => {
		if (users_id) {
			fetchPaidCourses();
		}
	}, [users_id, dispatch, language, backendLevel]);

	// Update product details when language or level changes
	useEffect(() => {
		if (iapProducts.length > 0) {
			const currentProductId = generateSKU(language, backendLevel);
			const prod = iapProducts.find(p => p.productId === currentProductId);
			setProductDetails(prod);

			if (prod) {
				console.log(' Updated product details:', {
					id: prod.productId,
					price: prod.localizedPrice
				});
			} else {
				console.warn(` Product not found for: ${currentProductId}`);
			}
		}
	}, [language, backendLevel, iapProducts]);

	// IAP Initialization - FOR V13.0.4
	useFocusEffect(
		useCallback(() => {
			console.log("📌 VideoListScreen Focused — Initializing IAP…");

			let isMounted = true;
			let purchaseUpdateSubscription = null;
			let purchaseErrorSubscription = null;

			const initIAP = async () => {
				// Avoid multiple re-initialization
				if (iapInitializedRef.current || initializationAttemptedRef.current) {
					console.log("⚠️ IAP already initialized for this session");
					return;
				}

				initializationAttemptedRef.current = true;
				setIapInitializing(true);
				setIapError(null);

				try {
					console.log("========== IAP INIT START (v13) ==========");

					// 1. INIT CONNECTION
					const connected = await RNIap.initConnection();
					console.log("🔌 Billing connected:", connected);

					if (!connected) throw new Error("Billing connection failed");

					// 2. CLEAR PENDING PURCHASES
					try {
						await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
					} catch (_) { }

					await new Promise((res) => setTimeout(res, 1200)); // Let billing stabilize

					if (!isMounted) return;

					// 3. FETCH PRODUCTS (V13)
					console.log("🛒 Fetching products:", newproductId);
					const products = await RNIap.getProducts({ skus: newproductId });

					if (!products?.length) {
						throw new Error("No IAP products found in Play Console");
					}

					setIapProducts(products);
					setIapReady(true);
					setIapInitializing(false);
					iapInitializedRef.current = true;

					// Set current SKU
					const sku = generateSKU(language, backendLevel);
					setProductDetails(products.find(p => p.productId === sku) || null);

					// 4. SETUP IAP LISTENERS
					console.log("🔔 Setting up purchase listeners…");

					purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase) => {
						try {
							await handlePurchaseUpdate(purchase);
						} catch (err) {
							console.error("Purchase handler error:", err);
						}
					});

					purchaseErrorSubscription = RNIap.purchaseErrorListener((error) => {
						if (error.code !== 'E_USER_CANCELLED') {
							Alert.alert('Purchase Error', error.message || "Unexpected error");
						}
					});

					console.log("========== IAP INIT COMPLETE ==========");

				} catch (err) {
					console.error("❌ IAP INIT FAILED:", err);

					setIapError(err.message);
					setIapReady(false);
					setIapInitializing(false);

					initializationAttemptedRef.current = false;
					iapInitializedRef.current = false;

					Alert.alert("Billing Error", err.message, [
						{
							text: "Retry",
							onPress: () => {
								initializationAttemptedRef.current = false;
								iapInitializedRef.current = false;
								initIAP();
							},
						},
						{ text: "Cancel", style: "cancel" },
					]);
				}
			};

			// ----------------------------
			// PURCHASE HANDLER
			// ----------------------------
			const handlePurchaseUpdate = async (purchase) => {
				console.log("🧾 Processing purchase:", purchase.productId);

				if (!purchase.transactionReceipt && !purchase.purchaseToken) {
					console.log("⚠️ No token yet, waiting for next event");
					return;
				}

				let purchaseToken;
				try {
					const json = JSON.parse(purchase.transactionReceipt);
					purchaseToken = json.purchaseToken;
				} catch {
					purchaseToken = purchase.purchaseToken;
				}

				if (!purchaseToken) return;

				const token = await AsyncStorage.getItem("token");
				if (!token) {
					Alert.alert("Login Required", "Please login again");
					return;
				}
				console.log("payloads in videolist screen", {
					user_id: users_id,
					productId: purchase.productId,
					purchaseToken,
					transactionReceipt: purchase.transactionReceipt,

				})
				// VERIFY ON BACKEND
				console.log("🌐 Verifying purchase…");

				const response = await fetch("https://api.smile4kids.co.uk/payment/purchase", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						user_id: users_id,
						productId: purchase.productId,
						purchaseToken,
						language,
						level: backendLevel,
					}),
				});

				let result;

				try {
					result = await response.json();
				} catch {
					console.log("⚠️ Backend not ready — skipping for next event");
					return;
				}

				if (response.ok && result.success) {
					console.log("✔ Verified by backend");

					await RNIap.finishTransaction({ purchase, isConsumable: false });

					dispatch(addPaidAccess({ language, level: backendLevel }));
					dispatch(setPaidStatus(true));

					await fetchPaidCourses();

					Alert.alert("Success", "Purchase successful!", [
						{ text: "OK", onPress: fetchVideos },
					]);
				} else {
					console.log("❌ Verification FAILED");
					Alert.alert("Verification Failed", "Contact support");
				}
			};

			// RUN IAP INIT
			initIAP();

			// 🔥 CLEANUP WHEN SCREEN GOES OUT OF FOCUS
			return () => {
				console.log("📤 VideoListScreen Blurred — Cleaning up IAP");

				isMounted = false;

				if (purchaseUpdateSubscription) purchaseUpdateSubscription.remove();
				if (purchaseErrorSubscription) purchaseErrorSubscription.remove();

				RNIap.endConnection()
					.then(() => console.log("🔌 Billing connection closed"))
					.catch(() => { });
			};
		}, [
			language,
			backendLevel,
			users_id,
		] // re-init ONLY when these change
		));

	// HandlePay function 
	const handlePay = async () => {
		try {
			console.log(" ========== INITIATING PURCHASE ==========");

			const productId = generateSKU(language, backendLevel);
			console.log(" Target product:", productId);
			console.log(" IAP Ready:", iapReady);
			console.log(" IAP Initializing:", iapInitializing);

			// Check if IAP is still initializing
			if (iapInitializing) {
				Alert.alert(
					'Please Wait',
					'Billing system is still loading. Please wait a moment and try again.',
					[{ text: 'OK' }]
				);
				return;
			}

			// Check if IAP initialization failed
			if (iapError) {
				Alert.alert(
					'Billing Error',
					`Unable to connect to billing: ${iapError}`,
					[
						{
							text: 'Retry Setup',
							onPress: () => {
								iapInitializedRef.current = false;
								initializationAttemptedRef.current = false;
								setIapInitializing(true);
								setIapError(null);
							}
						},
						{ text: 'Cancel', style: 'cancel' }
					]
				);
				return;
			}

			// Check if IAP is ready
			if (!iapReady) {
				Alert.alert(
					'Billing Not Available',
					'In-app purchases are currently unavailable.',
					[
						{
							text: 'Retry Setup',
							onPress: () => {
								iapInitializedRef.current = false;
								initializationAttemptedRef.current = false;
								setIapInitializing(true);
							}
						},
						{ text: 'Cancel', style: 'cancel' }
					]
				);
				return;
			}

			// Find the product
			const product = iapProducts.find(p => p.productId === productId);
			if (!product) {
				console.error(` Product not available: ${productId}`);
				Alert.alert(
					'Product Unavailable',
					`Product "${productId}" is not available. Available: ${iapProducts.map(p => p.productId).join(', ')}`,
					[{ text: 'OK' }]
				);
				return;
			}

			console.log(" Product found:", {
				id: product.productId,
				price: product.localizedPrice
			});

			// Flush pending purchases
			try {
				await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
				console.log(' Flushed pending');
			} catch (flushErr) {
				console.log(' Flush skipped:', flushErr?.message);
			}

			console.log(" Requesting purchase...");

			// V13 API: Use requestPurchase with object parameter
			await RNIap.requestPurchase({ skus: [productId] });

			console.log(' Purchase request sent');

		} catch (err) {
			console.error(" ========== PURCHASE ERROR ==========");
			console.error(" Error:", {
				code: err?.code,
				message: err?.message
			});

			const errorCode = err?.code;
			const errorMessage = err?.message || 'Something went wrong';

			// Handle user cancellation silently
			if (errorCode === 'E_USER_CANCELLED') {
				console.log(' User cancelled');
				return;
			}

			// Handle already owned
			if (errorCode === 'E_ALREADY_OWNED') {
				Alert.alert(
					'Already Owned',
					'You already own this item. Refreshing...',
					[{ text: 'OK' }]
				);
				await fetchPaidCourses();
				await fetchVideos();
				return;
			}

			// Map error codes to user-friendly messages
			let userMessage = errorMessage;

			switch (errorCode) {
				case 'E_ITEM_UNAVAILABLE':
					userMessage = 'This product is not available for purchase right now.';
					break;
				case 'E_BILLING_UNAVAILABLE':
					userMessage = 'Billing is unavailable. Check your Google Play settings.';
					break;
				case 'E_DEVELOPER_ERROR':
					userMessage = 'Configuration error. Please contact support.';
					break;
				case 'E_NETWORK_ERROR':
					userMessage = 'Network error. Check your internet connection.';
					break;
				case 'E_SERVICE_DISCONNECTED':
					userMessage = 'Billing service disconnected. Please try again.';
					break;
			}

			Alert.alert('Payment Failed', userMessage);
		}
	};

	// Render each video item
	const renderItem = ({ item, index }) => (
		<TouchableOpacity
			style={[
				styles.kidCard,
				!isCurrentCombinationPaid && styles.kidCardLocked
			]}
			onPress={() => {
				if (isCurrentCombinationPaid) {
					handleVideoPress(item);
				} else {				
					Alert.alert(
						"Locked Content",
						"please pay to unlock this content"
					);
				}
			}}
			activeOpacity={0.9}
		>
			<Image
				source={
					item.thumbnailUrl
						? require('../assets/image/splash.png')
						: { uri: item.thumbnailUrl }
				}
				style={{
					width: imageWidth,
					height: imageWidth * 0.7,
					borderRadius: 12,
					backgroundColor: '#E6E6FA',
					opacity: isCurrentCombinationPaid ? 1 : 0.5,
				}}
				resizeMode="contain"
			/>
			<View style={styles.kidTextContainer}>
				<Text style={[
					styles.kidTitle,
					!isCurrentCombinationPaid && styles.kidTitleLocked
				]} numberOfLines={2}>
					{item.title || `Video ${index + 1}`}
				</Text>
				<Text style={[
					styles.kidSubText,
					!isCurrentCombinationPaid && styles.kidSubTextLocked
				]}>
					{item.duration ? `${item.duration} min` : ''}
				</Text>
			</View>
			{isCurrentCombinationPaid ? (
				<Icon name="chevron-forward" size={24} color="#fff" />
			) : (
				<Icon name="lock-closed" size={24} color="#ccc" />
			)}
		</TouchableOpacity>
	);

	// Show error screen if there's a critical error
	if (screenError && !loading) {
		return (
			<SafeAreaView style={{ flex: 1 }}>
				<LinearGradient colors={['#87CEEB', '#ADD8E6', '#F0F8FF']} style={styles.container}>
					<View style={styles.errorContainer}>
						<Icon name="alert-circle" size={60} color="#FF6B6B" />
						<Text style={styles.errorTitle}>Oops!</Text>
						<Text style={styles.errorText}>{screenError}</Text>
						<TouchableOpacity
							style={styles.retryButton}
							onPress={() => {
								setScreenError(null);
								fetchVideos();
							}}
						>
							<Text style={styles.retryButtonText}>Retry</Text>
						</TouchableOpacity>
					</View>
				</LinearGradient>
			</SafeAreaView>
		);
	}


	// OPEN MATH PROTECTION MODAL
	const openmodel = () => {
		// Generate 2-digit numbers between 10–20
		const n1 = Math.floor(Math.random() * 10) + 10;
		const n2 = Math.floor(Math.random() * 10) + 10;

		setnum1(n1);
		setnum2(n2);
		setuseranswer('');
		setmodelvisible(true);
	};

	// VERIFY ANSWER THEN CALL handlePay()
	const parentmodel = async () => {
		const correct = num1 + num2;

		// validate numeric input
		const userInput = parseInt(useranswer.trim(), 10);

		if (isNaN(userInput)) {
			Alert.alert("Invalid Input", "Please enter a valid number.");
			return;
		}

		if (userInput === correct) {
			setmodelvisible(false);

			// little delay to close modal smoothly
			setTimeout(() => {
				handlePay();
			}, 250);

		} else {
			Alert.alert("Incorrect Answer", "Please try again.");
			setuseranswer('');
		}
	};


	const renderHeader = useCallback(() => (
		<>
			<View style={[styles.languageRow, isTablet && styles.languageRowTablet, isTablet && { marginTop: 24 }]}>
				{Object.keys(languageLabels).map((langKey, idx) => (
					<TouchableOpacity
						key={langKey}
						style={[
							styles.languageButton,
							language === langKey && styles.languageButtonActive,
							isTablet && styles.languageButtonTablet,
							idx !== 0 && isTablet && { marginLeft: 32 },
						]}
						onPress={() => handleLanguageSelect(langKey)}
					>
						<Text style={styles.languageButtonText}>
							{languageLabels[langKey]}
						</Text>
					</TouchableOpacity>
				))}
			</View>

			<View style={[styles.languageHeader, isTablet && styles.languageHeaderTablet, { width: headerWidth, alignSelf: 'center', marginTop: isTablet ? 32 : 20 }]}>
				<Text style={styles.ageGroupText}>
					{selectedLevel ? getDisplayLevel(selectedLevel) : 'Loading...'}
				</Text>
			</View>
		</>
	), [language, selectedLevel, isTablet, headerWidth, handleLanguageSelect]);

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<LinearGradient colors={['#87CEEB', '#ADD8E6', '#F0F8FF']} style={styles.container}>

				{/* Show IAP loading indicator at top */}
				{/* {iapInitializing && (
					<View style={styles.iapLoadingBanner}>
						<ActivityIndicator size="small" color="#FF8C00" />
						<Text style={styles.iapLoadingText}>Setting up billing...</Text>
					</View>
				)} */}

				{!isLandscape && renderHeader()}

				<FlatList
					ListHeaderComponent={isLandscape ? renderHeader : null}
					data={videos}
					keyExtractor={(item, index) => item._id || item.id || item.videoUrl || `video-${index}`}
					contentContainerStyle={styles.listContainer}
					renderItem={renderItem}
					windowSize={10}
					initialNumToRender={6}
					ListEmptyComponent={() => (
						<View style={styles.emptyContainer}>
							{loading ? (
								<>
									<ActivityIndicator size="large" color="#FF8C00" />
									<Text style={styles.emptyText}>Loading videos...</Text>
								</>
							) : (
								<>
									<Icon name="videocam-off" size={60} color="#ccc" />
									<Text style={styles.emptyText}>
										No videos available for this selection
									</Text>
								</>
							)}
						</View>
					)}
					extraData={[selectedLevel, language, loading, isCurrentCombinationPaid]}
				/>

				<CustomAlert
					visible={showAlert}
					title="Exit App"
					message="Are you sure you want to exit the app?"
					onConfirm={handleConfirmExit}
					onCancel={handleCancelExit}
				/>

				{!isCurrentCombinationPaid && initialVisitCompleted && paidAccess.length === 0 && (
					<View style={styles.blurOverlay}>
						<View style={styles.blurContent}>
							<Text style={styles.blurTitle}>Unlock Videos</Text>
							<Text style={styles.blurDescription}>
								Pay {productDetails?.localizedPrice || "£60"} to access {languageLabels[language]} videos for {selectedLevel ? getDisplayLevel(selectedLevel) : 'this level'}
							</Text>

							{iapInitializing ? (
								<View style={styles.payButtonLoading}>
									<ActivityIndicator size="small" color="#FF8C00" />
									<Text style={styles.payButtonLoadingText}>Loading...</Text>
								</View>
							) : (
								<TouchableOpacity
									onPress={openmodel}
									style={[styles.payNowButton, !iapReady && styles.payNowButtonDisabled]}
									disabled={!iapReady}
								>
									<Text style={styles.payNowText}>
										{iapReady ? `Pay ${productDetails?.localizedPrice || "£60"}` : "Billing Unavailable"}
									</Text>
								</TouchableOpacity>
							)}

							{/*  need to remopve before production */}

							{/* {iapError && (
								<TouchableOpacity
									onPress={() => {
										iapInitializedRef.current = false;
										initializationAttemptedRef.current = false;
										setIapInitializing(true);
										setIapError(null);
									}}
									style={styles.retryBillingButton}
								>
									<Text style={styles.retryBillingText}>Retry Billing Setup</Text>
								</TouchableOpacity>
							)} */}


						</View>
					</View>
				)}
				<Modal
					visible={ismodelvisible}
					transparent={true}
					animationType="fade"
				>
					<View style={styles.modalContainer}>
						<View style={styles.modalBox}>

							{/* Close Button */}
							<Pressable style={styles.closeIcon} onPress={() => setmodelvisible(false)}>
								<Text style={styles.closeText}>✕</Text>
							</Pressable>

							{/* Title */}
							<Text style={styles.modalTitle}>
								Answer the Problem to proceed
							</Text>

							{/* Question */}
							<Text style={styles.modalQuestion}>
								What is {num1} + {num2} ?
							</Text>

							{/* Input */}
							<TextInput
								value={useranswer}
								onChangeText={setuseranswer}
								placeholder="Enter your answer"
								placeholderTextColor="#888"
								keyboardType="numeric"
								style={styles.modalInput}
							/>

							{/* Submit Button */}
							<Pressable style={styles.submitButton} onPress={parentmodel}>
								<Text style={styles.submitText}>Submit</Text>
							</Pressable>

						</View>
					</View>
				</Modal>

			</LinearGradient>
		</SafeAreaView>
	);
};
const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	iapLoadingBanner: {
		backgroundColor: '#FFF3CD',
		paddingVertical: 8,
		paddingHorizontal: 16,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		borderBottomWidth: 1,
		borderBottomColor: '#FFEAA7',
	},
	iapLoadingText: {
		marginLeft: 10,
		fontSize: 14,
		color: '#856404',
		fontWeight: '600',
	},
	languageRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 20,
		paddingTop: 10,
	},
	languageRowTablet: {
		maxWidth: 900,
		alignSelf: 'center',
		paddingHorizontal: 0,
	},
	languageButton: {
		backgroundColor: '#FF8C00',
		paddingVertical: 10,
		borderRadius: 8,
		flex: 1,
		marginHorizontal: 5,
		alignItems: 'center',
		minWidth: 0,
	},
	languageButtonTablet: {
		marginHorizontal: 0,
		paddingVertical: 18,
		flex: 1,
		maxWidth: undefined,
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
	languageHeaderTablet: {
		marginTop: 0,
		paddingVertical: 22,
		borderRadius: 30,
	},
	ageGroupText: {
		fontSize: 16,
		color: 'white',
		fontWeight: 'bold',
	},
	listContainer: {
		padding: 10,
		flexGrow: 1,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 40,
		minHeight: 300,
	},
	emptyText: {
		fontSize: 16,
		color: '#666',
		textAlign: 'center',
		marginTop: 15,
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
	kidCardLocked: {
		backgroundColor: '#f5f5f5',
		opacity: 0.8,
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
	kidTitleLocked: {
		color: '#999',
	},
	kidSubText: {
		fontSize: 13,
		color: '#6A5ACD',
		marginTop: 4,
	},
	kidSubTextLocked: {
		color: '#bbb',
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
	payNowButtonDisabled: {
		backgroundColor: '#cccccc',
		opacity: 0.6,
	},
	payNowText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
	},
	payButtonLoading: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12,
		paddingHorizontal: 30,
	},
	payButtonLoadingText: {
		marginLeft: 10,
		fontSize: 16,
		color: '#666',
		fontWeight: '600',
	},
	retryBillingButton: {
		marginTop: 15,
		paddingVertical: 8,
		paddingHorizontal: 20,
		borderWidth: 1,
		borderColor: '#FF8C00',
		borderRadius: 20,
	},
	retryBillingText: {
		color: '#FF8C00',
		fontSize: 14,
		fontWeight: '600',
	},
	errorContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 30,
	},
	errorTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#333',
		marginTop: 20,
		marginBottom: 10,
	},
	errorText: {
		fontSize: 16,
		color: '#666',
		textAlign: 'center',
		marginBottom: 30,
	},
	retryButton: {
		backgroundColor: '#FF8C00',
		paddingVertical: 12,
		paddingHorizontal: 40,
		borderRadius: 25,
	},
	retryButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
	},
	modalContainer: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.5)',
		justifyContent: 'center',
		alignItems: 'center',
	},

	modalBox: {
		width: '85%',
		backgroundColor: 'white',
		borderRadius: 12,
		paddingVertical: 25,
		paddingHorizontal: 20,
		alignItems: 'center',
		elevation: 10,
		shadowColor: '#000',
		shadowOpacity: 0.25,
		shadowRadius: 6,
		shadowOffset: { width: 0, height: 2 },
		position: 'relative',
	},

	closeIcon: {
		position: 'absolute',
		top: 10,
		right: 10,
		padding: 5,
	},

	closeText: {
		fontSize: 22,
		color: '#333',
	},

	modalTitle: {
		color: '#FF8C00',
		fontWeight: 'bold',
		fontSize: 18,
		marginTop: 10,
		textAlign: 'center',
	},

	modalQuestion: {
		marginTop: 12,
		fontWeight: '600',
		color: '#000',
		fontSize: 16,
		textAlign: 'center',
	},

	modalInput: {
		width: '90%',
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 8,
		padding: 10,
		marginTop: 18,
		fontSize: 16,
		color: 'black',
		textAlign: 'center',
	},

	submitButton: {
		marginTop: 20,
		backgroundColor: '#FF8C00',
		paddingVertical: 10,
		paddingHorizontal: 25,
		borderRadius: 8,
		width: '90%',
		alignItems: 'center',
	},

	submitText: {
		color: 'white',
		fontWeight: 'bold',
		fontSize: 16,
	},
});

export default VideoListScreen;