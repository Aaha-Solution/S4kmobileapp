import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
	Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import PressableButton from '../component/PressableButton';
import LinearGradient from 'react-native-linear-gradient';
import { useStripe } from '@stripe/stripe-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setPaidStatus } from '../Store/userSlice';
import { setAllPaidAccess } from '../Store/userSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBackendLevel, getDisplayLevel } from '../utils/levelUtils';
const PaymentScreen = () => {
	const selectedLevel = useSelector(state => state.user.selectedLevel);
	const selectedLanguage = useSelector(state => state.user.selectedLanguage);
	const users_id = useSelector(state => state.user.user.users_id);
	const [selectedItems, setSelectedItems] = useState({});
	const [loading, setLoading] = useState(false);
	const [language, setLanguage] = useState(selectedLanguage || 'Hindi');

	const paidAccess = useSelector(state => state.user.paidAccess || []);
	const paidSet = new Set(
		paidAccess.map(({ language, level }) => `${language}-${level}`)
	);



	const dispatch = useDispatch();
	const { initPaymentSheet, presentPaymentSheet } = useStripe();

	const languages = ['Gujarati', 'Panjabi', 'Hindi'];
	const ageOptions = ['PreJunior (4–6 years)', 'Junior (7 & above years)'];


	// 🧮 Total cost in £
	const calculateTotal = () => {
		let count = 0;

		for (const lang in selectedItems) {
			const levels = selectedItems[lang] || [];
			for (const level of levels) {
				const backendLevel = getFormattedLevel(level);
				const key = `${lang}-${backendLevel}`;
				if (!paidSet.has(key)) {
					count += 1;
				}
			}
		}

		return count * 45;
	};

	const fetchPaidCourses = async () => {
		const token = await AsyncStorage.getItem('token');
		try {
			const response = await fetch(`https://smile4kids-backend.onrender.com/payment/my-paid-videos?user_id=${users_id}`,
				{
					method: 'GET',
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				}
			);
			const data = await response.json();

			if (response.ok && Array.isArray(data)) {
				dispatch(setAllPaidAccess(data)); // ✅ Save to Redux
				console.log("🟢 Paid Access:", data);

				// ✅ Auto-check already paid items in the UI
				const restoredItems = {};
				data.forEach(({ language, level }) => {
					const displayLevel = level === 'Pre_Junior'
						? 'PreJunior (4–6 years)'
						: 'Junior (7 & above years)';
					if (!restoredItems[language]) restoredItems[language] = [];
					restoredItems[language].push(displayLevel);
				});
				setSelectedItems(restoredItems);
			} else {
				console.warn('Failed to fetch paid videos:', data);
			}
		} catch (error) {
			console.error('❌ Error fetching paid videos:', error);
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
		} else if (lower.includes('prejunior') || lower.includes('4-6')) {
			return 'Pre_Junior';
		}

		return 'Pre_Junior'; // fallback
	};

	const HandlePay = async () => {
		try {
			setLoading(true);
			const token = await AsyncStorage.getItem('token');

			const unpaidSelections = [];

			for (const lang in selectedItems) {
				const levels = selectedItems[lang] || [];
				for (const level of levels) {
					const backendLevel = getFormattedLevel(level); // e.g. "Pre_Junior"
					const key = `${lang}-${backendLevel}`;
					if (!paidSet.has(key)) {
						unpaidSelections.push({ language: lang, level: backendLevel });
					}
				}
			}

			if (unpaidSelections.length === 0) {
				Alert.alert("No courses is Selected", "Please select the course to purchase.");
				setLoading(false);
				return;
			}

			// Use the first unpaid item for payment type
			const firstSelection = unpaidSelections[0];
			const paymentType = `${firstSelection.language}-${firstSelection.level}`;

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
					language: firstSelection.language,
					level: firstSelection.level,
					courseType: paymentType,
					selections: unpaidSelections,
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
				setLoading(false);
				return;
			}

			const clientSecret = data.clientSecret;
			if (!clientSecret) {
				Alert.alert("Payment Error", data.message || "No client secret received.");
				setLoading(false);
				return;
			}

			const { error: initError } = await initPaymentSheet({
				paymentIntentClientSecret: clientSecret,
				merchantDisplayName: 'Smile4Kids',
			});

			if (initError) {
				Alert.alert("Payment Error", initError.message);
				setLoading(false);
				return;
			}

			const { error: presentError } = await presentPaymentSheet();

			if (presentError) {
				Alert.alert("Payment Failed", presentError.message);
			} else {
				Alert.alert("Success", "Your payment was successful!");
				dispatch(setPaidStatus(true));

				// ✅ Refresh paid course access
				await fetchPaidCourses();
			}
		} catch (err) {
			console.error("PaymentSheet Error:", err);
			Alert.alert("Unexpected Error", "Something went wrong during payment.");
		} finally {
			setLoading(false);
		}
	};



	const handleToggle = (language, level) => {
		const backendLevel = getFormattedLevel(level); // 'Junior' or 'Pre_Junior'
		const key = `${language}-${backendLevel}`;

		if (paidSet.has(key)) {
			return; // 🔒 Don't allow changing paid courses
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

	return (
		<LinearGradient colors={['#87CEEB', '#ADD8E6', '#F0F8FF']} style={styles.gradientContainer}>
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<View style={styles.header}>
					<Icon name="cart-outline" size={36} color="#FF8C00" style={styles.icon} />
					<Text style={styles.heading}>Order Summary</Text>
				</View>

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
										disabled={isPaid} // 🔒 disables press
									>
										<Text style={[styles.ageText, isPaid && styles.disabledText]}>
											{option}
										</Text>
										{isPaid ? (
											<Icon name="lock" size={20} color="gray" />
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
					<Text style={styles.totalLabel}>Total</Text>
					<Text style={styles.totalValue}>£{calculateTotal()}</Text>
				</View>

				<PressableButton
					title={loading ? "Processing..." : "Pay Now"}
					disabled={loading || calculateTotal() === 0}
					onPress={HandlePay}
					style={styles.payButton}
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
