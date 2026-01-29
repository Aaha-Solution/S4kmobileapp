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
	Modal,
	TextInput,
	Pressable
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import PressableButton from '../component/PressableButton';
import LinearGradient from 'react-native-linear-gradient';
import * as RNIap from 'react-native-iap';
import { useDispatch, useSelector } from 'react-redux';
import { setPaidStatus, setAllPaidAccess, addPaidAccess } from '../Store/userSlice';
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
	const [totalAmount, setTotalAmount] = useState(60);
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

	const [num1, setnum1] = useState(0)
	const [num2, setnum2] = useState(0)
	const [useranswer, setuseranswer] = useState('')
	const [ismodelvisible, setmodelvisible] = useState(false)


	// ------------------ IAP Initialization ------------------
	useFocusEffect(
		useCallback(() => {
			let isMounted = true;
			let purchaseUpdateSubscription;
			let purchaseErrorSubscription;

			console.log("🔵 Screen focused → Initializing IAP (v13)…");

			// -----------------------------
			// INIT IAP
			// -----------------------------
			async function initIAP() {
				try {
					console.log("Starting IAP initialization (v13)…");
					console.log("Product IDs:", productIdMap);

					if (Platform.OS !== "android") {
						console.warn("Android only");
						return;
					}

					const connected = await RNIap.initConnection();
					console.log("IAP connected:", connected);

					if (!connected) throw new Error("Failed to connect to Google Play Billing");

					await new Promise(res => setTimeout(res, 400));

					if (!isMounted) return;

					console.log("Fetching products…");

					const products = await RNIap.getProducts({ skus: productIdMap });

					console.log("Products found:", products.length);
					setIapProducts(products);
					setIapReady(true);

					// ------------------------------------------------------------------
					// PURCHASE UPDATE LISTENER
					// ------------------------------------------------------------------
					purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
						async (purchase) => {
							console.log("Purchase update received:", purchase);
							await handlePurchaseUpdate(purchase);
						}
					);

					purchaseErrorSubscription = RNIap.purchaseErrorListener((err) => {
						console.log("IAP Error:", err);
						if (err.code !== "E_USER_CANCELLED") {
							Alert.alert("Purchase Error", err.message || "Unknown error");
						}
					});

				} catch (err) {
					console.log("❌ IAP Init Error:", err);
					Alert.alert("Billing Error", err.message);
				}
			}

			// -----------------------------
			// HANDLE PURCHASE UPDATE
			// -----------------------------
			const handlePurchaseUpdate = async (purchase) => {
				try {
					if (!purchase?.transactionReceipt) {
						console.log("⚠ No receipt found");
						return;
					}

					// Extract token
					let purchaseToken = null;
					try {
						const receipt = JSON.parse(purchase.transactionReceipt);
						purchaseToken = receipt.purchaseToken;
					} catch {
						purchaseToken = purchase.purchaseToken;
					}

					if (!purchaseToken) {
						console.log("⚠ No purchaseToken found");
						return;
					}

					// Parse product details
					const parseProductId = (productId) => {
						const parts = productId.split("_");
						const language = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
						const levelPart = parts.slice(2).join("_");

						return {
							language,
							level: levelPart.toLowerCase() === "junior" ? "Junior" : "Pre_Junior",
						};
					};

					const { language, level } = parseProductId(purchase.productId);

					console.log("Sending verification request to backend…");

					const token = await AsyncStorage.getItem("token");
					console.log("payloads in payment screen", {
						user_id: users_id,
						productId: purchase.productId,
						purchaseToken,
						transactionReceipt: purchase.transactionReceipt,
						language,
						level,
					})
					const response = await fetch(
						"https://api.smile4kids.co.uk/payment/purchase",
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
								Authorization: `Bearer ${token}`,
							},
							body: JSON.stringify({
								user_id: users_id,
								productId: purchase.productId,
								purchaseToken,
								transactionReceipt: purchase.transactionReceipt,
								language,
								level,
							}),
						}
					);
// console.log("Backend verification response status:", response.status);
// console.log("Backend verification response headers:", response);
					if (!response.ok) {
						const text = await response.text();
						console.log("❌ Backend verification failed:", text);
						Alert.alert("Verification Failed", "Please contact support.");
						return;
					}

					const result = await response.json();

					if (result.success) {
						console.log(" Purchase verified successfully");

						await RNIap.finishTransaction({ purchase, isConsumable: false });

						dispatch(setPaidStatus(true));
						dispatch(addPaidAccess({ language, level }));

						// Refresh paid courses
						await fetchPaidCourses();

						Alert.alert("Success", "Your purchase was successful!", [
							{ text: "OK", onPress: () => navigation.navigate("Home") },
						]);
					} else {
						console.log("❌ Verification rejected:", result);
						Alert.alert("Verification Error", "Could not verify purchase.");
					}

				} catch (err) {
					console.log("❌ Purchase update error:", err);
				}
			};

			initIAP();

			// 🔴 CLEANUP WHEN SCREEN UNFOCUSES
			return () => {
				console.log("🔴 Screen unfocused → cleaning IAP…");

				isMounted = false;

				if (purchaseUpdateSubscription) purchaseUpdateSubscription.remove();
				if (purchaseErrorSubscription) purchaseErrorSubscription.remove();

				RNIap.endConnection();
			};
		}, [users_id])
	);

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

			console.log(" Full selectedItems state:", { ...prev, [language]: updated });
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
				HandlePay();
			}, 250);

		} else {
			Alert.alert("Incorrect Answer", "Please try again.");
			setuseranswer('');
		}
	};

	return (
		<LinearGradient colors={['#87CEEB', '#ADD8E6', '#F0F8FF']} style={styles.gradientContainer}>
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<View style={styles.header}>
					<Icon name="cart-outline" size={36} color="#FF8C00" style={styles.icon} />
					<Text style={styles.heading}>Order Summary</Text>
				</View>
{/* 
				{!iapReady && (
					<View style={styles.loadingBanner}>
						<Icon name="information" size={20} color="#FF8C00" />
						<Text style={styles.loadingText}>Setting up billing system...</Text>
					</View>
				)} */}

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
												{/* <Text style={styles.paidText}>Owned</Text> */}
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
									: "Pay"
					}
					disabled={loading || totalAmount === 0 || isEverythingPaid || !iapReady}
					onPress={openmodel}
					style={[
						styles.payButton,
						(isEverythingPaid || totalAmount === 0 || !iapReady) && { opacity: 0.5 },
					]}
				/>
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