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
	ActivityIndicator
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

	// Debug state logging
	useEffect(() => {
		console.log('🔍 SCREEN STATE:', {
			selectedLevel,
			selectedLanguage,
			users_id,
			videosCount: videos.length,
			paidAccessCount: paidAccess.length,
			language,
			loading,
			iapReady,
			iapInitializing,
			iapProductsCount: iapProducts.length,
			iapError
		});
	}, [selectedLevel, selectedLanguage, users_id, videos, paidAccess, language, loading, iapReady, iapInitializing, iapProducts, iapError]);

	const backendLevel = selectedLevel ? getBackendLevel(selectedLevel) : 'Junior';
	const { width, height } = useWindowDimensions();
	const isTablet = width >= 700;
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
			console.warn('⚠️ Missing selectedLevel or language');
			setVideos([]);
			return;
		}

		setLoading(true);
		setVideos([]);
		setScreenError(null);
		const url = `${baseURL}?language=${language}&level=${backendLevel}`;

		console.log('📡 Fetching videos from:', url);

		try {
			const token = await AsyncStorage.getItem('token');
			if (!token) {
				console.error('❌ No token found');
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

			console.log('✅ Response status:', response.status);
			console.log('📦 Response data length:', response.data?.length);

			if (response.status === 200 && Array.isArray(response.data)) {
				setVideos(response.data);
				console.log('✅ Videos loaded:', response.data.length);
			} else {
				console.error('❌ Invalid response:', response.status);
				setScreenError(`Server error: ${response.status}`);
				setVideos([]);
			}
		} catch (error) {
			console.error('❌ Fetch error:', error.message);
			setScreenError(`Network error: ${error.message}`);
			setVideos([]);
		} finally {
			setLoading(false);
		}
	}, [language, selectedLevel, backendLevel]);

	// Fetch paid courses from backend with proper validation
	const fetchPaidCourses = async () => {
		try {
			console.log('💳 ============ FETCHING PAID COURSES ============');
			console.log('💳 User ID:', users_id);

			if (!users_id) {
				console.warn('⚠️ No user ID available');
				return;
			}

			const token = await AsyncStorage.getItem('token');
			if (!token) {
				console.warn('⚠️ No token available for fetching paid courses');
				return;
			}

			const response = await axios.get(
				`https://api.smile4kids.co.uk/user/${users_id}/paid-courses`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			console.log('💳 Backend Response Status:', response.status);
			console.log('💳 Backend Response Data:', JSON.stringify(response.data, null, 2));

			if (response.data && Array.isArray(response.data)) {
				if (response.data.length === 0) {
					console.log('💳 ============ NO PAID COURSES FOUND ============');
					dispatch(setPaidStatus(false));
					return;
				}

				console.log('💳 ============ PROCESSING COURSES ============');
				response.data.forEach((course, index) => {
					console.log(`💳 Course ${index + 1}:`, {
						language: course.language,
						level: course.level,
					});

					if (course.language && course.level) {
						dispatch(addPaidAccess({
							language: course.language,
							level: course.level
						}));
					} else {
						console.warn('⚠️ INVALID COURSE:', course);
					}
				});

				dispatch(setPaidStatus(true));
				console.log('💳 ============ DONE PROCESSING ============');
			} else {
				console.warn('⚠️ Response is not an array:', typeof response.data);
				dispatch(setPaidStatus(false));
			}
		} catch (error) {
			console.error('❌ ============ ERROR FETCHING PAID COURSES ============');
			console.error('❌ Error:', error.message);
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

	// IAP Initialization - FIXED FOR V13.0.4
	useEffect(() => {
		let isMounted = true;
		let purchaseUpdateSubscription;
		let purchaseErrorSubscription;

		const initIAP = async () => {
			if (iapInitializedRef.current || initializationAttemptedRef.current) {
				console.log('🛒 IAP already initialized or in progress');
				return;
			}

			initializationAttemptedRef.current = true;
			setIapInitializing(true);
			setIapError(null);

			try {
				console.log("🛒 ========== STARTING IAP INITIALIZATION (v13) ==========");

				// Step 1: Initialize connection
				console.log("🛒 Step 1: Initializing connection...");
				const connected = await RNIap.initConnection();
				console.log("✅ Connection established:", connected);

				if (!connected) {
					throw new Error("Failed to establish connection");
				}

				// Step 2: Clear pending purchases (Android only)
				try {
					console.log("🛒 Step 2: Clearing pending purchases...");
					await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
					console.log("✅ Pending purchases cleared");
				} catch (flushError) {
					console.log("⚠️ Flush skipped:", flushError?.message);
				}

				// Wait for billing to stabilize
				await new Promise(resolve => setTimeout(resolve, 1500));

				if (!isMounted) {
					console.log('⚠️ Component unmounted, aborting');
					await RNIap.endConnection();
					return;
				}

				// Step 3: Fetch products - V13 API uses getProducts with object parameter
				console.log("🛒 Step 3: Fetching products...");
				console.log("🛒 Product IDs:", newproductId);

				let products;
				try {
					// V13 API: Use getProducts with skus parameter
					products = await RNIap.getProducts({ skus: newproductId });
					console.log("🛒 Products fetched:", products?.length || 0);
				} catch (productError) {
					console.error("❌ Product fetch error:", productError);
					throw new Error(`Failed to load products: ${productError.message}`);
				}

				// Validate products
				if (!Array.isArray(products)) {
					throw new Error(`Invalid products response: ${typeof products}`);
				}

				if (products.length === 0) {
					throw new Error("No products available from Google Play Store");
				}

				
				products.forEach((p, i) => {
					console.log(`🛒 Product ${i + 1}:`, {
						id: p.productId,
						price: p.localizedPrice,
						title: p.title?.substring(0, 40)
					});
				});

				if (!isMounted) {
					await RNIap.endConnection();
					return;
				}

				// Step 4: Update state
				setIapProducts(products);
				setIapReady(true);
				setIapInitializing(false);
				iapInitializedRef.current = true;
				setIapError(null);

				// Set current product
				const currentSKU = generateSKU(language, backendLevel);
				const currentProduct = products.find(p => p.productId === currentSKU);

				if (currentProduct) {
					setProductDetails(currentProduct);
					console.log("🛒 Current product set:", currentProduct.productId);
				} else {
					console.warn(`⚠️ Product ${currentSKU} not found`);
					console.log('Available:', products.map(p => p.productId));
				}

				// Step 5: Setup listeners
				console.log("🛒 Step 4: Setting up listeners...");

				purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
					async (purchase) => {
						console.log("🛒 Purchase update:", purchase.productId);
						try {
							await handlePurchaseUpdate(purchase);
						} catch (err) {
							console.error("❌ Purchase handler error:", err);
						}
					}
				);

				purchaseErrorSubscription = RNIap.purchaseErrorListener((error) => {
					console.error("❌ Purchase error:", error.code, error.message);
					if (error.code !== 'E_USER_CANCELLED') {
						Alert.alert('Purchase Error', error.message || 'An error occurred');
					}
				});

				console.log("✅ ========== IAP INITIALIZATION COMPLETE ==========");

			} catch (err) {
				console.error('❌ ========== IAP INIT FAILED ==========');
				console.error('❌ Error:', {
					message: err.message,
					code: err.code,
					stack: err.stack?.substring(0, 200)
				});

				if (!isMounted) return;

				setIapReady(false);
				setIapInitializing(false);
				setIapError(err.message || 'Unknown error');
				initializationAttemptedRef.current = false;

				// User-friendly error
				let userMsg = 'Unable to initialize billing. ';

				if (err.message?.includes('products')) {
					userMsg = 'Products not configured in Google Play Console.';
				} else if (err.message?.includes('connection')) {
					userMsg = 'Network error. Check your internet connection.';
				} else {
					userMsg = 'Please try again later.';
				}

				Alert.alert('Billing Issue', userMsg, [
					{
						text: 'Retry',
						onPress: () => {
							iapInitializedRef.current = false;
							initializationAttemptedRef.current = false;
							setIapInitializing(true);
							setIapError(null);
							setTimeout(initIAP, 1000);
						}
					},
					{ text: 'Cancel', style: 'cancel' }
				]);
			}
		};

		// Handle purchase updates
		const handlePurchaseUpdate = async (purchase) => {
			try {
				console.log("🛒 Processing purchase:", purchase.productId);

				if (!purchase?.transactionReceipt) {
					console.error("❌ No receipt");
					return;
				}

				let purchaseToken;
				try {
					const receipt = JSON.parse(purchase.transactionReceipt);
					purchaseToken = receipt.purchaseToken;
				} catch (e) {
					purchaseToken = purchase.purchaseToken;
				}

				if (!purchaseToken) {
					Alert.alert('Error', 'Invalid purchase data');
					return;
				}

				const token = await AsyncStorage.getItem('token');
				if (!token) {
					Alert.alert('Error', 'Please login again');
					return;
				}

				console.log("🛒 Verifying with backend...");
				const response = await fetch(
					'https://api.smile4kids.co.uk/payment/verify-google-purchase',
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${token}`,
						},
						body: JSON.stringify({
							user_id: users_id,
							productId: purchase.productId,
							purchaseToken,
							transactionReceipt: purchase.transactionReceipt,
							language,
							level: backendLevel,
						}),
					}
				);

				const result = await response.json();

				if (response.ok && result.success) {
					console.log("✅ Verified");
					// V13 API: finishTransaction takes purchase object and isConsumable boolean
					await RNIap.finishTransaction({ purchase, isConsumable: false });
					await fetchPaidCourses();
					Alert.alert('Success', 'Purchase successful!', [
						{ text: 'OK', onPress: fetchVideos }
					]);
				} else {
					console.error("❌ Verification failed");
					Alert.alert('Verification Failed', 'Contact support with your order ID.');
				}
			} catch (err) {
				console.error("❌ Purchase handler error:", err);
				Alert.alert('Error', 'Failed to process. Contact support if charged.');
			}
		};

		// Initialize
		initIAP();

		// Cleanup
		return () => {
			console.log('🛒 Cleanup');
			isMounted = false;
			if (purchaseUpdateSubscription) {
				purchaseUpdateSubscription.remove();
			}
			if (purchaseErrorSubscription) {
				purchaseErrorSubscription.remove();
			}
			RNIap.endConnection()
				.then(() => console.log('✅ Connection closed'))
				.catch(e => console.log('⚠️ Cleanup error:', e?.message));
		};
	}, []); // Empty dependency array - run only once

	// Fetch paid courses
	useEffect(() => {
		if (users_id) {
			fetchPaidCourses();
		}
	}, [users_id]);

	// Update product details when language or level changes
	useEffect(() => {
		if (iapProducts.length > 0) {
			const currentProductId = generateSKU(language, backendLevel);
			const prod = iapProducts.find(p => p.productId === currentProductId);
			setProductDetails(prod);

			if (prod) {
				console.log('🛒 Updated product details:', {
					id: prod.productId,
					price: prod.localizedPrice
				});
			} else {
				console.warn(`⚠️ Product not found for: ${currentProductId}`);
			}
		}
	}, [language, backendLevel, iapProducts]);

	// HandlePay function - FIXED FOR V13.0.4
	const handlePay = async () => {
		try {
			console.log("🛒 ========== INITIATING PURCHASE ==========");

			const productId = generateSKU(language, backendLevel);
			console.log("🛒 Target product:", productId);
			console.log("🛒 IAP Ready:", iapReady);
			console.log("🛒 IAP Initializing:", iapInitializing);

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
				console.error(`❌ Product not available: ${productId}`);
				Alert.alert(
					'Product Unavailable',
					`Product "${productId}" is not available. Available: ${iapProducts.map(p => p.productId).join(', ')}`,
					[{ text: 'OK' }]
				);
				return;
			}

			console.log("🛒 Product found:", {
				id: product.productId,
				price: product.localizedPrice
			});

			// Flush pending purchases
			try {
				await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
				console.log('✅ Flushed pending');
			} catch (flushErr) {
				console.log('⚠️ Flush skipped:', flushErr?.message);
			}

			console.log("🛒 Requesting purchase...");

			// V13 API: Use requestPurchase with object parameter
			await RNIap.requestPurchase({ skus: [productId] });

			console.log('✅ Purchase request sent');

		} catch (err) {
			console.error("❌ ========== PURCHASE ERROR ==========");
			console.error("❌ Error:", {
				code: err?.code,
				message: err?.message
			});

			const errorCode = err?.code;
			const errorMessage = err?.message || 'Something went wrong';

			// Handle user cancellation silently
			if (errorCode === 'E_USER_CANCELLED') {
				console.log('ℹ️ User cancelled');
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
						`Pay ${productDetails?.localizedPrice || "£45"} to unlock ${languageLabels[language]} videos for ${getDisplayLevel(selectedLevel)}`,
						[
							{ text: "Cancel", style: "cancel" },
							{ text: "Pay Now", onPress: handlePay }
						]
					);
				}
			}}
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

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<LinearGradient colors={['#87CEEB', '#ADD8E6', '#F0F8FF']} style={styles.container}>

				{/* Show IAP loading indicator at top */}
				{iapInitializing && (
					<View style={styles.iapLoadingBanner}>
						<ActivityIndicator size="small" color="#FF8C00" />
						<Text style={styles.iapLoadingText}>Setting up billing...</Text>
					</View>
				)}

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

				<FlatList
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
									onPress={handlePay}
									style={[styles.payNowButton, !iapReady && styles.payNowButtonDisabled]}
									disabled={!iapReady}
								>
									<Text style={styles.payNowText}>
										{iapReady ? `Pay ${productDetails?.localizedPrice || "£60"}` : "Billing Unavailable"}
									</Text>
								</TouchableOpacity>
							)}
							
							{iapError && (
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
							)}
						</View>
					</View>
				)}
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
});

export default VideoListScreen;