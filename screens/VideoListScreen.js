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
import { setAgeGroup, setVideos, setLanguage } from '../Store/userSlice';
import CustomAlert from '../Components/CustomAlertMessage';
const { width } = Dimensions.get('window');

const languageLabels = {
	Gujarati: 'Gujarati',
	Panjabi: 'Panjabi',
	Hindi: 'Hindi',
};

const VideoListScreen = ({ navigation, route }) => {
	const dispatch = useDispatch();
	const selectedAgeGroup = useSelector(state => state.user.selectedAgeGroup);
	const selectedLanguage = useSelector(state => state.user.selectedLanguage);
	const videos = useSelector(state => state.user.videos);
	const [language, setLanguage] = useState(selectedLanguage || 'Hindi');
	const [showAlert, setShowAlert] = useState(false);

	const isHomeScreen = route.name === 'Home';

	// Handle hardware back button
	useFocusEffect(
		useCallback(() => {
			if (!isHomeScreen) return;

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

	// Fetch videos from backend
	useEffect(() => {
		const fetchVideo = async () => {
			if (!selectedLanguage || !selectedAgeGroup) return;
			try {
				const apiUrl = `http://192.168.0.208:3000/videos/by-category?language=${selectedLanguage}&level=${selectedAgeGroup}`;
				const response = await fetch(apiUrl);
				
				if (response.ok) {
					const data = await response.json();
					console.log('Fetched videos:', data);
					dispatch(setVideos(data));
		   		} else {
					console.warn('Video fetch failed.');
					dispatch(setVideos([]));
				}
			} catch (error) {
				console.error('Error fetching video:', error);
				dispatch(setVideos([]));
			}
		};

		fetchVideo();
	}, [selectedLanguage, selectedAgeGroup]);

	useEffect(() => {
		if (selectedLanguage) {
			setLanguage(selectedLanguage);
		}
	}, [selectedLanguage]);

	useEffect(() => {
		if (selectedAgeGroup) {
			setAgeGroup(selectedAgeGroup);
		}
	}, [selectedAgeGroup]);

	const handleLanguageSelect = useCallback((langKey) => {
	setLanguage(langKey);
	dispatch(setLanguage(langKey));
}, [dispatch]);

	const handleVideoPress = useCallback((video) => {
	console.log('Video item:', video);
	 if (!video.url) {
    console.warn('Video URL is empty or invalid:', video.url);
    return;
  }
	navigation.navigate('VideoPlayer', { videoUri: video.url });
}, [navigation]);


	

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

			<FlatList
				data={videos}
				keyExtractor={(item, index) => `video-${index}`}
				numColumns={2}
				contentContainerStyle={styles.gridContainer}
				renderItem={({ item, index }) => (
					<TouchableOpacity
						style={styles.videoItem}
						onPress={() => handleVideoPress(item)}
					>
						<Icon name="play-circle-fill" size={40} color="#9346D2" />
						<Text style={styles.videoText}>Video {index + 1}</Text>
					</TouchableOpacity>
				)}
				ListEmptyComponent={() => (
					<View style={styles.emptyContainer}>
						<Text style={styles.emptyText}>
							{selectedAgeGroup
								? 'No videos available for this selection'
								: 'Please select an age group'}
						</Text>
					</View>
				)}
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
	},
	ageGroupText: {
		fontSize: 16,
		color: 'white',
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
