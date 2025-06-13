import React, { useEffect, useState, useCallback } from 'react';
import {
	View,
	Text,
	FlatList,
	TouchableOpacity,
	StyleSheet,
	Dimensions,
	BackHandler
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomAlert from '../Components/CustomAlertMessage';
import axios from 'axios';

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
	const[videos, setVideos] = useState([]);
	const [language, setLanguage] = useState(selectedLanguage || 'Hindi');
	const [showAlert, setShowAlert] = useState(false);
	const [loading, setLoading] = useState(false);
	const isHomeScreen = route.name === 'Home';
	
	const baseURL = 'http://192.168.0.241:3000/videos/by-category';

	console.log("isHomeScreen", isHomeScreen);

	// Handle back button for exit confirmation
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
			const backHandler = BackHandler.addEventListener(
				'hardwareBackPress',
				backAction
			);
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

	// Function to get formatted level from age group
	const getFormattedLevel = (ageGroup) => {
		if (!ageGroup) return 'PreJunior';
		
		// Check if the age group contains "Junior" and mentions "7" or "above"
		const lowerAgeGroup = ageGroup.toLowerCase();
		if (lowerAgeGroup.includes('junior') && (lowerAgeGroup.includes('7') || lowerAgeGroup.includes('above'))) {
			return 'Junior';
		} else if (lowerAgeGroup.includes('pre-prep') || lowerAgeGroup.includes('4-6')) {
			return 'PreJunior';
		}
		
		return 'PreJunior'; // Default fallback
	};

	// Fetch videos from API
	const fetchVideos = useCallback(async () => {
		if (!selectedAgeGroup || !language) {
			 ([]);
			return;
		}

		setLoading(true);
		setVideos([]);

		const formattedLevel = getFormattedLevel(selectedAgeGroup);
		const url = `${baseURL}?language=${language}&level=${formattedLevel}`;

		console.log('🔍 selectedAgeGroup:', selectedAgeGroup);
		console.log('🔍 language:', language);
		console.log('🔍 formattedLevel:', formattedLevel);
		console.log('🔍 API URL:', url);

		try {
			const response = await axios.get(url);
			console.log('🔍 API Response:', response.data);
			
			if (response.status === 200 && Array.isArray(response.data)) {
				console.log('📦 Received videos:', response.data.length);
				setVideos(response.data);
			} else {
				console.warn('Unexpected API response format');
				setVideos([]);
			}
		} catch (error) {
			console.error('API fetch error:', error);
			setVideos([]);
		} finally {
			setLoading(false);
		}
	}, [language, selectedAgeGroup]);

	// Fetch videos when language or age group changes
	useEffect(() => {
		console.log('Current language:', language);
		console.log('Current age group:', selectedAgeGroup);
		fetchVideos();
	}, [selectedAgeGroup, language, fetchVideos]);

	// Update language when selectedLanguage changes
	useEffect(() => {
		if (selectedLanguage) {
			setLanguage(selectedLanguage);
		}
	}, [selectedLanguage]);

	useEffect(() => {
		const unsubscribe = navigation.addListener('focus', () => {
			console.log('Screen focused - refreshing videos');
			fetchVideos();
		});

		return unsubscribe;
	}, [navigation, fetchVideos]);

	const handleVideoPress = useCallback((videoItem) => {
		// Pass the entire video item to VideoPlayer
		navigation.navigate('VideoPlayer', { videoUri: videoItem });
	}, [navigation]);

	const handleLanguageSelect = useCallback((langKey) => {
		setLanguage(langKey);
	}, []);

	return (
		<LinearGradient colors={['#f9f9f9', '#fff']} style={styles.container}>
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

			{/* Loading indicator */}
			{loading && (
				<View style={styles.loadingContainer}>
					<Text style={styles.loadingText}>Loading videos...</Text>
				</View>
			)}

			{/* Video Grid */}
			<FlatList
				data={videos}
				keyExtractor={(item) => item._id || item.id || item.videoUrl || Math.random().toString()}
				numColumns={2}
				contentContainerStyle={styles.gridContainer}
				renderItem={({ item, index }) => (
					item ? (
						<TouchableOpacity
							style={styles.videoItem}
							onPress={() => handleVideoPress(item)}
						>
							<Icon name="play-circle-fill" size={40} color="#9346D2" />
							<Text style={styles.videoText}>
								{item.title || `Video ${index + 1}`}
							</Text>
						</TouchableOpacity>
					) : null
				)}
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
		backgroundColor: 'black',
		paddingVertical: 10,
		borderRadius: 8,
		flex: 1,
		marginHorizontal: 5,
		alignItems: 'center',
	},
	languageButtonActive: {
		backgroundColor: '#9346D2',
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
		backgroundColor: '#9346D2',
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
	loadingContainer: {
		padding: 20,
		alignItems: 'center',
	},
	loadingText: {
		fontSize: 16,
		color: '#666',
	},
	gridContainer: {
		padding: 10,
		flexGrow: 1,
	},
	videoItem: {
		backgroundColor: '#d3d3d3',
		flex: 1,
		aspectRatio: 1,
		margin: 8,
		borderRadius: 10,
		justifyContent: 'center',
		alignItems: 'center',
	},
	videoText: {
		marginTop: 10,
		fontWeight: '600',
		fontSize: 16,
		textAlign: 'center',
		paddingHorizontal: 5,
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
});

export default VideoListScreen;