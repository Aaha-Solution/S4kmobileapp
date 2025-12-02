import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import LinearGradient from 'react-native-linear-gradient';
const Policy = () => {
	return (
		<View style={styles.container}>
			<LinearGradient colors={['#87CEEB', '#ADD8E6', '#F0F8FF']} style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.headerText}>Privacy & Account Deletion Policy</Text>
			</View>

			<ScrollView contentContainerStyle={styles.contentContainer}>

				<Text style={styles.text}>
					<Text style={styles.title}>Privacy Policy{"\n"}</Text>
					Last updated: January 2025{"\n\n"}

					Welcome to <Text style={styles.bold}>Smile4Kids</Text>.
					This Privacy Policy explains how we handle information while ensuring a safe learning environment for children, fully compliant with Google Play Families Policies.{"\n\n"}

					<Text style={styles.title}>1. Information We Collect{"\n"}</Text>
					<Text style={styles.bold}>Smile4Kids does NOT collect any personal information from children.</Text>{"\n"}
					The app is designed so that all sensitive information—if provided—is handled only by parents or guardians.{"\n\n"}

					<Text style={styles.bold}>We do NOT collect from children:</Text>{"\n"}
					• Email{"\n"}
					• Password{"\n"}
					• Name{"\n"}
					• Phone number{"\n"}
					• Address{"\n"}
					• Photos or media{"\n"}
					• Location data{"\n"}
					• Any identifiers{"\n\n"}

					<Text style={styles.title}>Parent-Only Account Access{"\n"}</Text>
					Some features of Smile4Kids allow parents/guardians to create an account to manage purchases or access settings.{"\n"}
					<Text style={styles.bold}>Account creation is strictly for adults.</Text>
					Children cannot create accounts or provide personal data.{"\n\n"}

					<Text style={styles.title}>2. How We Use Information (Parents Only){"\n"}</Text>
					If parents choose to create an account, the information is used only for:{"\n"}
					• Authenticating parent login{"\n"}
					• Managing purchases or subscriptions{"\n"}
					• Providing customer support{"\n\n"}
					All information is encrypted and used only for essential app functionality.{"\n"}
					<Text style={styles.bold}>No child data is ever stored.</Text>{"\n\n"}

					<Text style={styles.title}>3. No Ads, No Tracking, No Third-Party Sharing{"\n"}</Text>
					Smile4Kids does not show ads, track children, or share data.{"\n\n"}

					• No advertising{"\n"}
					• No analytics tracking for children{"\n"}
					• No third-party cookies{"\n"}
					• No data selling or sharing{"\n\n"}

					<Text style={styles.title}>4. Child Safety & Compliance{"\n"}</Text>
					Smile4Kids follows Google Play Families Policy and COPPA guidelines:{"\n"}
					• No personal data is collected from children{"\n"}
					• All sensitive actions are controlled by parents{"\n"}
					• Educational content is safe and age-appropriate{"\n\n"}

					<Text style={styles.title}>5. Security{"\n"}</Text>
					We use industry-standard encryption and secure storage.
					Children's data is never collected or stored.{"\n\n"}

					<Text style={styles.title}>6. Parental Controls{"\n"}</Text>
					Parents may review or delete their account information at any time by contacting us.{"\n"}
					Children cannot access or modify account settings.{"\n\n"}

					<Text style={styles.title}>7. Changes to This Policy{"\n"}</Text>
					We may update this Privacy Policy when necessary.
					Any changes will appear here with a revised date.{"\n\n"}

					<Text style={styles.title}>8. Contact Us{"\n"}</Text>
					If you have questions about this Privacy Policy, please contact:{"\n"}
					📧 <Text style={styles.bold}>safrina.saran@gmail.com</Text>{"\n\n"}
				</Text>

			</ScrollView>
</LinearGradient>
			
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1,  },
	header: {
		//backgroundColor: "#4A90E2",
		paddingVertical: 15,
		alignItems: "center",
	},
	headerText: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#fff",
	},
	contentContainer: {
		padding: 15,
		paddingBottom: 60,
	},
	text: {
		fontSize: 15,
		color: "#333",
		lineHeight: 24,
	},
	title: {
		fontSize: 16,
		fontWeight: "600",
		color: "#000",
		marginTop: 10,
	},
	bold: {
		fontWeight: "bold",
		color: "#000",
	},
});

export default Policy;
