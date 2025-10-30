import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

const Policy = () => {
	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.headerText}>Privacy & Account Deletion Policy</Text>
			</View>

			<ScrollView contentContainerStyle={styles.contentContainer}>
				<Text style={styles.text}>
					<Text style={styles.title}>1. Information We Collect{"\n"}</Text>
					When you use <Text style={styles.bold}>Smile4Kids</Text>, we may collect the following information:
					{"\n\n"}
					• <Text style={styles.bold}>Account Information:</Text> Username, Email address, and Password (encrypted){"\n"}
					• <Text style={styles.bold}>Profile Information:</Text> Avatar, chosen language(s), selected age group(s){"\n"}
					• <Text style={styles.bold}>Optional Information:</Text> Name, Phone number, and Address (entered voluntarily by parents/guardians).{"\n"}
					• <Text style={styles.bold}>Payment Information:</Text> All payments are securely processed through{" "}
					<Text style={styles.bold}>Google Play Billing</Text>. We do not store any credit/debit card details.{"\n"}
					• <Text style={styles.bold}>Admin Information:</Text> For admin accounts only — records of user purchases and language levels.{"\n\n"}

					<Text style={styles.title}>2. Optional Data{"\n"}</Text>
					Providing your name, phone number, or address is{" "}
					<Text style={styles.bold}>completely optional</Text>. You can continue to use all learning features even if you choose not to share this information.{"\n\n"}

					<Text style={styles.title}>3. How We Use Your Information{"\n"}</Text>
					• Manage user profiles and purchased content{"\n"}
					• Improve app experience and personalize learning{"\n"}
					• Contact parents for support or account recovery (if phone/email is provided){"\n"}
					• Process secure payments through Google Play Billing{"\n\n"}

					<Text style={styles.title}>4. Data We Do Not Collect{"\n"}</Text>
					We do not collect precise location, device identifiers, or behavioral data for advertising.{"\n\n"}

					<Text style={styles.title}>5. Data Storage & Security{"\n"}</Text>
					All data is stored securely. Passwords are encrypted and not visible to us. Only authorized admin accounts can view purchase history.{"\n\n"}

					<Text style={styles.title}>6. Data Sharing{"\n"}</Text>
					We only share information when necessary:{"\n"}
					• With Google Play for payment verification{"\n"}
					• With legal authorities if required by law{"\n"}
					We never sell or rent user data.{"\n\n"}

					<Text style={styles.title}>7. Children’s Privacy{"\n"}</Text>
					<Text style={styles.bold}>Smile4Kids</Text> is designed for children’s education and should be used under parental supervision. Parents or guardians manage sign-up and payments.{"\n\n"}

					<Text style={styles.title}>8. User Rights{"\n"}</Text>
					You can view and edit your profile data (username, avatar, email, and optional details) anytime in the app.{"\n"}
					You can stop using the app anytime by uninstalling it.{"\n\n"}

					<Text style={styles.title}>9. Changes to This Policy{"\n"}</Text>
					We may update this policy from time to time. Please review this page periodically for updates.{"\n\n"}

					<Text style={styles.title}>10. Contact Us{"\n"}</Text>
					For any questions or data concerns, contact us at:{"\n"}
					📧 <Text style={styles.bold}>safrina.saran@gmail.com</Text>
					{"\n\n"}

					<Text style={styles.title}>11. Account Deletion Policy{"\n"}</Text>
					You can request permanent deletion of your Smile4Kids account at any time.
					To do so, please contact our admin team at:{"\n"}
					📧 <Text style={styles.bold}>safrina.saran@gmail.com</Text>{"\n\n"}
					Once your request is received, we will verify your identity and manually process the deletion.
					Account deletion requests are typically completed within{" "}
					<Text style={styles.bold}>7–14 business days</Text>.{"\n\n"}

					When your account is deleted, the following information will be permanently removed:{"\n"}
					• Name{"\n"}
					• Email address{"\n"}
					• Phone number{"\n"}
					• Profile details (avatar, preferences, etc.){"\n\n"}

					We may retain limited data for legal or operational reasons, such as:{"\n"}
					• Payment transaction records (required by law){"\n"}
					• Anonymous statistical data (not linked to your identity){"\n"}
					• Customer support communications (if legally required){"\n\n"}

					For any deletion-related questions, please contact us at{" "}
					<Text style={styles.bold}>safrina.saran@gmail.com</Text>.
				</Text>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#fff" },
	header: {
		backgroundColor: "#4A90E2",
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
