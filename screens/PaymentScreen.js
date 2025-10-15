import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Alert,
	BackHandler,
	Platform,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';  
import PressableButton from '../component/PressableButton';
import LinearGradient from 'react-native-linear-gradient';
import * as RNIap from 'react-native-iap';
import { useDispatch, useSelector } from 'react-redux';
import { setPaidStatus, setAllPaidAccess } from '../Store/userSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBackendLevel, getDisplayLevel } from '../utils/levelUtils';

// Your exact product IDs
const productIdMap = [
	'video_panjabi_pre_junior',
	'video_panjabi_junior',
	'video_hindi_pre_junior',
	'video_hindi_junior',
	'video_gujarati_pre_junior',
	'video_gujarati_junior',
];

const PaymentScreen = ({ navigation }) => {
	const selectedLevel = useSelector(state => state.user.selectedLevel);
	const selectedLanguage = useSelector(state => state.user.selectedLanguage);
	const users_id = useSelector(state => state.user.user.users_id);
	
	const [language, setLanguage] = useState(selectedLanguage || 'Hindi');
	const [totalAmount, setTotalAmount] = useState(45);
	const paidAccess = useSelector(state => state.user.paidAccess || []);
	const paidSet = new Set(
		paidAccess.map(({ language, level }) => `${language}-${level}`)
	);

	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const [selectedItems, setSelectedItems] = useState({});
	const [iapProducts, setIapProducts] = useState([]);
	const [iapReady, setIapReady] = useState(false);

	const languages = ['Gujarati', 'Panjabi', 'Hindi'];
	const ageOptions = ['PreSchool (4–6 years)', 'Junior (7 & above years)'];

	// ------------------ IAP Initialization ------------------
	useEffect(() => {
		let isMounted = true;
		let purchaseUpdateSubscription;
		let purchaseErrorSubscription;
		
		async function initIAP() {
			try {
				console.log(" Starting IAP initialization (v13)...");
				console.log("Product IDs to fetch:", productIdMap);
				
				if (Platform.OS !== 'android') {
					console.warn(' This code is designed for Android only');
					Alert.alert('Platform Not Supported', 'Google Play Billing is only available on Android devices.');
					return;
				}

				console.log(" Attempting to connect to Google Play Billing...");
				
				// V13 API: initConnection returns boolean
				const connected = await RNIap.initConnection();
				console.log(" IAP connection result:", connected);
				
				if (!connected) {
					throw new Error("Failed to connect to Google Play Billing");
				}

				// Small delay to ensure connection is stable
				await new Promise(resolve => setTimeout(resolve, 500));
				
				if (!isMounted) return;

				console.log(" Fetching products from Google Play...");
				
				// V13 API: getProducts takes object with skus array
				const products = await RNIap.getProducts({ skus: productIdMap });
				
				console.log(" Products received:", products.length);
				console.log("Products details:", products.map(p => ({
					id: p.productId,
					price: p.localizedPrice,
					title: p.title
				})));
				
				if (products.length === 0) {
					console.error(" No products found!");
					Alert.alert(
						'Setup Required',
						'No products available for purchase.\n\nPlease ensure:\n' +
						'1. Products are created in Google Play Console\n' +
						'2. All products are ACTIVE\n' +
						'3. App is published to internal testing\n' +
						'4. You are signed in with a test account\n' +
						'5. App is installed from Play Store',
						[{ text: 'OK' }]
					);
				} else {
					console.log(" Successfully loaded products:", products.map(p => p.productId));
				}
				
				if (isMounted) {
					setIapProducts(products);
					setIapReady(true);
				}

				// purchase listeners
				purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
					async (purchase) => {
						console.log(" Purchase update received:", purchase);
						await handlePurchaseUpdate(purchase);
					}
				);

				purchaseErrorSubscription = RNIap.purchaseErrorListener((error) => {
					console.error(" IAP purchase error:", error);
					if (error.code !== 'E_USER_CANCELLED') {
						Alert.alert('Purchase Error', error.message || 'An error occurred during purchase.');
					}
				});

			} catch (err) {
				console.error(' IAP Init Error:', {
					message: err.message,
					code: err.code,
					stack: err.stack
				});
				
				let errorMessage = 'Failed to initialize in-app purchases.\n\n';
				
				if (err.message?.includes('BILLING_UNAVAILABLE')) {
					errorMessage += 'Google Play Billing is not available.\n\nMake sure:\n• You are on a real Android device\n• Google Play Services is installed and updated\n• You are signed in to Google Play';
				} else if (err.message?.includes('DEVELOPER_ERROR')) {
					errorMessage += 'Configuration error.\n\nCheck:\n• App signing certificate matches Google Play\n• Package name is correct\n• Products are set up in Play Console';
				} else if (err.message?.includes('ITEM_UNAVAILABLE')) {
					errorMessage += 'Products not found.\n\nVerify:\n• All product IDs are created in Play Console\n• Products are ACTIVE (not draft)\n• Waited 24 hours after creating products';
				} else if (err.message?.includes('SERVICE_UNAVAILABLE')) {
					errorMessage += 'Google Play service temporarily unavailable. Please try again later.';
				} else {
					errorMessage += `Error: ${err.message || 'Unknown error'}`;
				}
				
				console.error('IAP Error:', errorMessage);
				Alert.alert('Billing Setup Error', errorMessage);
			}
		}

		// Handle purchase updates from listener
		const handlePurchaseUpdate = async (purchase) => {
			try {
				console.log(" Processing purchase update:", purchase);
				
				// V13: Check if purchase has transactionReceipt
				if (!purchase?.transactionReceipt) {
					console.error(" No transaction receipt in purchase update");
					return;
				}

				// Parse the receipt to get purchase token
				let purchaseToken;
				try {
					const receipt = JSON.parse(purchase.transactionReceipt);
					purchaseToken = receipt.purchaseToken;
				} catch (parseError) {
					console.error(" Failed to parse receipt:", parseError);
					// For some versions, purchaseToken might be directly on purchase object
					purchaseToken = purchase.purchaseToken;
				}
				
				if (!purchaseToken) {
					console.error(" No purchase token found");
					return;
				}

				console.log(" Verifying purchase with backend...");
				const token = await AsyncStorage.getItem('token');

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
							purchaseToken: purchaseToken,
							transactionReceipt: purchase.transactionReceipt,
						}),
					}
				);

				const result = await response.json();
				
				if (response.ok && result.success) {
					console.log(" Purchase verified successfully");
					
					// V13: Finish the transaction
					await RNIap.finishTransaction({ purchase, isConsumable: false });
					
					// Update Redux state
					dispatch(setPaidStatus(true));
					await fetchPaidCourses();
					
					Alert.alert('Success', 'Your purchase was successful!', [
						{
							text: 'OK',
							onPress: () => navigation.navigate('MainTabs', { screen: 'Home' })
						}
					]);
				} else {
					console.error(" Verification failed:", result);
					Alert.alert(
						'Verification Failed',
						'Purchase could not be verified. Please contact support with your order ID.'
					);
				}
			} catch (err) {
				console.error(" Error handling purchase update:", err);
				Alert.alert(
					'Error',
					'Failed to process purchase. Please contact support if you were charged.'
				);
			}
		};
		
		initIAP();
		
		return () => {
			isMounted = false;
			if (purchaseUpdateSubscription) {
				purchaseUpdateSubscription.remove();
			}
			if (purchaseErrorSubscription) {
				purchaseErrorSubscription.remove();
			}
			// V13: endConnection is synchronous
			RNIap.endConnection();
		};
	}, [users_id, navigation, dispatch]);

	// -------- Total cost calculation --------
	const calculateTotalFromBackend = async () => {
		const selections = [];

		for (const lang in selectedItems) {
			const levels = selectedItems[lang] || [];
			for (const level of levels) {
				const backendLevel = getFormattedLevel(level);
				const key = `${lang}-${backendLevel}`;
				if (!paidSet.has(key)) {
					selections.push({ language: lang, level: backendLevel });
				}
			}
		}

		if (selections.length === 0) {
			setTotalAmount(0);
			return;
		}

		// Calculation: £60 per course
		const Amount = 60;
		const total = Amount * selections.length;
		setTotalAmount(total);
	};

	useEffect(() => {
		calculateTotalFromBackend();
	}, [selectedItems]);

	// ---------- Fetch paid courses from backend ----------
	const fetchPaidCourses = async () => {
		const token = await AsyncStorage.getItem('token');
		try {
			console.log(' Fetching paid courses for user:', users_id);
			const response = await fetch(
				`https://api.smile4kids.co.uk/payment/my-paid-videos?user_id=${users_id}`,
				{
					method: 'GET',
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				}
			);
			
			if (!response.ok) {
				console.error(' API Error:', response.status, response.statusText);
				return;
			}
			
			const responseText = await response.text();
			
			if (responseText.trim().startsWith('<')) {
				console.error(' Received HTML instead of JSON - API might be down');
				return;
			}
			
			const data = JSON.parse(responseText);
			console.log(" Paid courses loaded:", data);
			
			if (Array.isArray(data)) {
				dispatch(setAllPaidAccess(data));

				// Auto-check already paid items
				const restoredItems = {};
				data.forEach(({ language, level }) => {
					const displayLevel = level === 'Pre_Junior'
						? 'PreSchool (4–6 years)'
						: 'Junior (7 & above years)';
					if (!restoredItems[language]) restoredItems[language] = [];
					restoredItems[language].push(displayLevel);
				});
				setSelectedItems(restoredItems);
			}
		} catch (error) {
			console.error(' Error fetching paid courses:', error);
		}
	};

	useEffect(() => {
		fetchPaidCourses();
	}, [users_id]);

	const getFormattedLevel = (ageGroup) => {
		if (!ageGroup) return 'Pre_Junior';

		const lower = ageGroup.toLowerCase();

		if (lower.includes('junior') && (lower.includes('7') || lower.includes('above'))) {
			return 'Junior';
		} else if (lower.includes('preschool') || lower.includes('prejunior') || lower.includes('4')) {
			return 'Pre_Junior';
		}

		return 'Pre_Junior';
	};

	// Generate correct SKU matching your product IDs
	const generateSKU = (language, backendLevel) => {
		const lang = language.toLowerCase(); // Gujarati -> gujarati
		const levelSku = backendLevel === 'Junior' ? 'junior' : 'pre_junior';
		return `video_${lang}_${levelSku}`;
	};

	// ------Payment handling-------
	const HandlePay = async () => {
		if (loading || isEverythingPaid) return;

		// Get unpaid selections
		const unpaidSelections = [];
		for (const lang in selectedItems) {
			const levels = selectedItems[lang] || [];
			for (const level of levels) {
				const backendLevel = getFormattedLevel(level);
				const key = `${lang}-${backendLevel}`;
				if (!paidSet.has(key)) {
					unpaidSelections.push({ language: lang, level: backendLevel });
				}
			}
		}

		if (unpaidSelections.length === 0) {
			Alert.alert('No courses selected', 'Please select courses to purchase.');
			return;
		}

		if (!iapReady) {
			Alert.alert('Please wait', 'Billing system is still initializing. Please try again in a moment.');
			return;
		}

		setLoading(true);

		try {
			const first = unpaidSelections[0];
			const sku = generateSKU(first.language, first.level);
			
			console.log(" Attempting purchase:");
			console.log("  Language:", first.language);
			console.log("  Level:", first.level);
			console.log("  Generated SKU:", sku);
			console.log("  Available products:", iapProducts.map(p => p.productId));

			// Verify product is available
			const product = iapProducts.find(p => p.productId === sku);
			if (!product) {
				Alert.alert(
					'Product Unavailable',
					`The selected course (${sku}) is not available for purchase.\n\nThis may be because:\n• Products not yet synced from Play Console\n• Product not activated\n• Need to wait 24 hours after creation`
				);
				setLoading(false);
				return;
			}

			console.log(" Purchasing product:", product);

			// Call requestPurchase with a single sku for Android
			console.log('Calling RNIap.requestPurchase with sku:', sku);
			await RNIap.requestPurchase({ skus: [sku] });
			
			console.log(' Purchase request sent successfully');
			// Note: Actual verification happens in purchaseUpdatedListener

		} catch (err) {
			console.error(' Purchase error:', err);
			
			if (err.code === 'E_USER_CANCELLED') {
				console.log(' User cancelled purchase');
				// Don't show alert for user cancellation
			} else if (err.code === 'E_ALREADY_OWNED') {
				Alert.alert(
					'Already Purchased',
					'You already own this course. Refreshing your purchase history...'
				);
				await fetchPaidCourses();
			} else if (err.code === 'E_ITEM_UNAVAILABLE') {
				Alert.alert(
					'Product Unavailable',
					'This product is not available for purchase at the moment. Please try again later.'
				);
			} else if (err.code === 'E_NETWORK_ERROR') {
				Alert.alert(
					'Network Error',
					'Unable to connect to Google Play. Please check your internet connection and try again.'
				);
			} else {
				Alert.alert(
					'Payment Failed',
					err.message || 'Something went wrong during purchase. Please try again.'
				);
			}
		} finally {
			setLoading(false);
		}
	};

	// ------- Handle item selection -------
	const handleToggle = (language, level) => {
		const backendLevel = getFormattedLevel(level);
		const key = `${language}-${backendLevel}`;

		if (paidSet.has(key)) {
			return; // Don't allow changing paid courses
		}

		setSelectedItems(prev => {
			const current = prev[language] || [];
			const isSelected = current.includes(level);
			const updated = isSelected
				? current.filter(item => item !== level)
				: [...current, level];
			return { ...prev, [language]: updated };
		});
	};

	// ------- Check if all courses are paid -------
	const isEverythingPaid = (() => {
		const allCombos = languages.flatMap(
			lang => ageOptions.map(age => `${lang}-${getFormattedLevel(age)}`)
		);
		return allCombos.every(combo => paidSet.has(combo));
	})();

	// ------ Handle back button -------
	useFocusEffect(
		useCallback(() => {
			const onBackPress = () => {
				if (navigation.canGoBack()) {
					navigation.goBack();
				} else {
					navigation.navigate('MainTabs');
				}
				return true;
			};

			const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
			return () => backHandler.remove();
		}, [navigation])
	);

	return (
		<LinearGradient colors={['#87CEEB', '#ADD8E6', '#F0F8FF']} style={styles.gradientContainer}>
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<View style={styles.header}>
					<Icon name="cart-outline" size={36} color="#FF8C00" style={styles.icon} />
					<Text style={styles.heading}>Order Summary</Text>
				</View>

				{!iapReady && (
					<View style={styles.loadingBanner}>
						<Icon name="information" size={20} color="#FF8C00" />
						<Text style={styles.loadingText}>Setting up billing system...</Text>
					</View>
				)}

				{languages.map(lang => (
					<View key={lang} style={styles.languageSection}>
						<Text style={styles.languageTitle}>{lang}</Text>
						<View style={styles.card}>
							{ageOptions.map(option => {
								const backendLevel = getFormattedLevel(option);
								const isPaid = paidSet.has(`${lang}-${backendLevel}`);

								return (
									<TouchableOpacity
										key={option}
										style={[styles.ageOption, isPaid && styles.disabledOption]}
										onPress={() => handleToggle(lang, option)}
										disabled={isPaid}
									>
										<Text style={[styles.ageText, isPaid && styles.disabledText]}>
											{getDisplayLevel(option)}
										</Text>
										{isPaid ? (
											<View style={styles.paidBadge}>
												<Icon name="check-circle" size={20} color="#4CAF50" />
												<Text style={styles.paidText}>Owned</Text>
											</View>
										) : selectedItems[lang]?.includes(option) ? (
											<Icon name="check-circle" size={20} color="green" />
										) : null}
									</TouchableOpacity>
								);
							})}
						</View>
					</View>
				))}

				<View style={styles.totalContainer}>
					<Text style={styles.totalLabel}>Total Cost</Text>
					<Text style={styles.totalValue}>£{totalAmount}</Text>
				</View>

				<PressableButton
					title={
						isEverythingPaid
							? "All Courses Purchased"
							: loading
								? "Processing..."
								: !iapReady
									? "Setting up..."
									: "Pay with Google Play"
					}
					disabled={loading || totalAmount === 0 || isEverythingPaid || !iapReady}
					onPress={HandlePay}
					style={[
						styles.payButton,
						(isEverythingPaid || totalAmount === 0 || !iapReady) && { opacity: 0.5 },
					]}
				/>
			</ScrollView>
		</LinearGradient>
	);
};

export default PaymentScreen;

const styles = StyleSheet.create({
	gradientContainer: { flex: 1 },
	scrollContent: { padding: 24, paddingBottom: 60 },
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 30,
	},
	icon: { marginRight: 10 },
	heading: { fontSize: 24, fontWeight: '700', color: '#333' },
	languageSection: { marginBottom: 24 },
	languageTitle: {
		fontSize: 20,
		fontWeight: '600',
		color: '#333',
		marginBottom: 10,
	},
	card: {
		backgroundColor: '#F0F8FF',
		borderRadius: 8,
		paddingVertical: 10,
		paddingHorizontal: 16,
		elevation: 2,
	},
	disabledOption: {
		opacity: 0.5,
	},
	disabledText: {
		color: 'gray',
		fontStyle: 'italic',
	},
	ageOption: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 12,
		borderBottomWidth: 0.5,
		borderColor: '#ccc',
	},
	ageText: { fontSize: 16, color: '#333' },
	totalContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		borderTopWidth: 1,
		borderColor: '#ddd',
		paddingTop: 16,
		marginTop: 30,
	},
	totalLabel: { fontSize: 20, fontWeight: '700', color: '#333' },
	totalValue: { fontSize: 20, fontWeight: '700', color: '#FF8C00' },
	payButton: {
		marginTop: 30,
		backgroundColor: '#FF8C00',
		paddingVertical: 14,
		borderRadius: 8,
	},
});
