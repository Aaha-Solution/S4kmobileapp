import React from 'react';
import { View, Modal, Text, TouchableOpacity, StyleSheet } from 'react-native';

const CustomAlert = ({ visible, title, message, onConfirm, onCancel }) => {
	return (
		<Modal transparent animationType="fade" visible={visible}>
			<View style={styles.overlay}>
				<View style={styles.alertBox}>
					<Text style={styles.title}>{title}</Text>
					<Text style={styles.message}>{message}</Text>

					<View style={[styles.buttonContainer, !onCancel && { justifyContent: 'center' }  // Center if no cancel
					]}>
						{onCancel && (
							<TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
								<Text style={styles.buttonText}>Cancel</Text>
							</TouchableOpacity>
						)}
						<TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={onConfirm}>
							<Text style={styles.buttonText}>Sure</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Modal>
	);
};

export default CustomAlert;

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: '#00000099',
		justifyContent: 'center',
		alignItems: 'center',
	},
	alertBox: {
		width: '80%',
		backgroundColor: '#fff',
		borderRadius: 20,
		padding: 20,
		alignItems: 'center',
		elevation: 10,
	},
	title: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 10,
	},
	message: {
		fontSize: 16,
		textAlign: 'center',
		marginBottom: 20,
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
		paddingHorizontal: 10,
	},
	button: {
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 12,
		minWidth: 100,
		alignItems: 'center',
	},
	cancelButton: {
		backgroundColor: '#666',
	},
	confirmButton: {
		backgroundColor: '#9346D2',
	},
	buttonText: {
		color: 'white',
		fontWeight: 'bold',
	},
});
