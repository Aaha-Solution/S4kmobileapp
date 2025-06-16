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
// Language short labels
const languageLabels = {
	Gujarati: 'Gujarati',
	Panjabi: 'Panjabi',
	Hindi: 'Hindi',
};

const VideoListScreen = ({ navigation, route }) => {
	const dispatch = useDispatch();
	const selectedAgeGroup = useSelector(state => state.user.selectedAgeGroup);
	const selectedLanguage = useSelector(state => state.user.selectedLanguage);
	const [videos, setVideos] = useState([]);
	const [language, setLanguage] = useState(selectedLanguage || 'Hindi');
	const [showAlert, setShowAlert] = useState(false);
	const [loading, setLoading] = useState(false);
	const isHomeScreen = route.name === 'Home';

	const baseURL = 'http://smile4kids-mobilebackend.onrender.com/videos/by-category';

	// Back button handler
	const handleError = (error) => {
		console.error("🔴 Video playback error:", error); // Log the error details
		if (error && error.target) {
			console.error("📌 Error target:", error.target);
		}
		setLoading(false);
		setError(true);
		alert("An error occurred during video playback. Please try again later.");
	};
	useEffect(() => {
		if (!isHomeScreen) return;
		const backAction = () => {
			setShowAlert(true);
			return true;
		};
		const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
		return () => backHandler.remove();
	}, [isHomeScreen]);

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

	const getFormattedLevel = (ageGroup) => {
		if (!ageGroup) return 'Pre-Junior';
		const lowerAgeGroup = ageGroup.toLowerCase();
		if (lowerAgeGroup.includes('junior') && (lowerAgeGroup.includes('7') || lowerAgeGroup.includes('above'))) {
			return 'Junior';
		} else if (lowerAgeGroup.includes('pre-prep') || lowerAgeGroup.includes('4-6')) {
			return 'Pre-Junior';
		}
		return 'Pre-Junior';
	};

	const fetchVideos = useCallback(async () => {
		if (!selectedAgeGroup || !language) {
			setVideos([]);
			return;
		}
		setLoading(true);
		setVideos([]);

		const formattedLevel = getFormattedLevel(selectedAgeGroup);
		const url = `${baseURL}?language=${language}&level=${formattedLevel}`;
		console.log("url", url)
		try {
			const response = await axios.get(url);
			if (response.status === 200 && Array.isArray(response.data)) {
				setVideos(response.data);
			} else {
				setVideos([]);
			}
			console.log('response', response)
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
		setLanguage(langKey);
	}, []);

	const renderItem = ({ item, index }) => (
		<TouchableOpacity
			style={styles.kidCard}
			onPress={() => handleVideoPress(item)}
			activeOpacity={0.9}
		>
			{/* <Image
			source={
				item.thumbnailUrl
					? { uri: item.thumbnailUrl }
					: require('../assets/image/splash.png')
			}
			style={styles.kidImage}
			resizeMode="cover"
		/> */}
			<View style={styles.kidTextContainer}>
				<Text style={styles.kidTitle} numberOfLines={2}>
					{item.title || `Video ${index + 1}`}
				</Text>
				<Text style={styles.kidSubText}>
					{item.duration ? `${item.duration} min` : 'Fun learning'}
				</Text>
			</View>
			<Icon name="chevron-forward" size={24} color="#fff" />
		</TouchableOpacity>
	);


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
	kidImage: {
		width: 70,
		height: 70,
		borderRadius: 16,
		backgroundColor: '#E6E6FA',
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

});

export default VideoListScreen;
