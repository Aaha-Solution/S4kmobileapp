import React, { useState } from 'react';
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

const PaymentScreen = () => {
	const selectedLevel = useSelector(state => state.user.selectedLevel );
	const selectedLanguage = useSelector(state => state.user.selectedLanguage);
	const users_id = useSelector(state => state.user.user.users_id);
	const [selectedItems, setSelectedItems] = useState({});
	const [loading, setLoading] = useState(false);
	const [language, setLanguage] = useState(selectedLanguage || 'Hindi');
	



	const dispatch = useDispatch();
	const { initPaymentSheet, presentPaymentSheet } = useStripe();

	const languages = ['Gujarati', 'Panjabi', 'Hindi'];
	const ageOptions = ['PreJunior (4–6 years)', 'Junior (7 & above years)'];

	// 🧠 Converts UI string to backend-valid type
	const formatCourseType = (lang, age) => {
		let level = age.includes('Pre') ? 'Pre_Junior' : 'Junior';
		return `${lang}-${level}`;
	};

	// 🧮 Total cost in £
	const calculateTotal = () => {
		let count = 0;
		for (const lang in selectedItems) {
			count += selectedItems[lang].length;
		}
		return count * 45;
	};

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

		let selectedLang = null;
		let selectedAge = null;

		for (const lang in selectedItems) {
			if (selectedItems[lang]?.length > 0) {
				selectedLang = lang;
				selectedAge = selectedItems[lang][0]; // 'PreJunior (4–6 years)' or 'Junior (7 & above years)'
				break;
			}
		}

		if (!selectedLang || !selectedAge) {
			Alert.alert("Selection Required", "Please select at least one course.");
			setLoading(false);
			return;
		}

		const level = getFormattedLevel(selectedAge); // 'Junior' or 'Pre_Junior'
		const selectedType = `${selectedLang}-${level}`;

		console.log("🟠 Payment Type:", selectedType);

		const response = await fetch('https://smile4kids-backend.onrender.com/payment/create-payment-intent', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				type: selectedType,
				currency: 'gbp',
				user_id: users_id,
				language: selectedLang,
				level: level,
				courseType: selectedType
			}),
		});

		console.log("🧾 Sending payment data:", {
			user_id: users_id,
			language: selectedLang,
			level: level,
			courseType: selectedType
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
		}
	} catch (err) {
		console.error("PaymentSheet Error:", err);
		Alert.alert("Unexpected Error", "Something went wrong during payment.");
	} finally {
		setLoading(false);
	}
};


	const handleToggle = (language, ageGroup) => {
		setSelectedItems(prev => {
			const current = prev[language] || [];
			const isSelected = current.includes(ageGroup);
			const updated = isSelected
				? current.filter(item => item !== ageGroup)
				: [...current, ageGroup];
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
							{ageOptions.map(option => (
								<TouchableOpacity
									key={option}
									style={styles.ageOption}
									onPress={() => handleToggle(lang, option)}
								>
									<Text style={styles.ageText}>{option}</Text>
									{selectedItems[lang]?.includes(option) && (
										<Icon name="check-circle" size={20} color="green" />
									)}
								</TouchableOpacity>
							))}
						</View>
					</View>
				))}

				<View style={styles.totalContainer}>
					<Text style={styles.totalLabel}>Total</Text>
					<Text style={styles.totalValue}>£{calculateTotal()}</Text>
				</View>

				<PressableButton
					title={loading ? "Processing..." : "Pay Now"}
					disabled={loading}
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
