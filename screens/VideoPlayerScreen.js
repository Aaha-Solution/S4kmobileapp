import React, { useState, useEffect } from 'react';
import {
	View,
	ActivityIndicator,
	TouchableOpacity,
	StyleSheet,
	StatusBar,
	Dimensions,
	Text,
	BackHandler,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const VideoPlayerScreen = ({ route, navigation }) => {
	const { videoUri } = route.params;
  console.log('🎬 Received videoUri from route.params:', JSON.stringify(videoUri, null, 2));

	const [loading, setLoading] = useState(true);
	const [paused, setPaused] = useState(false);
	const [duration, setDuration] = useState(0);
	const [error, setError] = useState(false);
	const [token, setToken] = useState(null);
	const [tokenLoaded, setTokenLoaded] = useState(false); // ✅ New flag

	// Extract URL from object or string
	const getVideoSource = (videoData) => {
		if (typeof videoData === 'string' || typeof videoData === 'number') {
			return videoData;
		}
		if (videoData && typeof videoData === 'object') {
			return (
				videoData.videoUrl ||
				videoData.url ||
				videoData.videoUri ||
				videoData.uri ||
				videoData.video_url ||
				videoData.file_url ||
				videoData.src
			);
		}
		return null;
	};

	const videoSource = getVideoSource(videoUri);
  console.log('📼 Extracted videoSource:', videoSource);

	const handleLoad = (data) => {
		setLoading(false);
		setDuration(data.duration);
		setError(false);
	};

	const handleBuffer = ({ isBuffering }) => {
		setLoading(isBuffering);
	};

	const handleError = (error) => {
		console.error('❌ Video playback error:', JSON.stringify(error, null, 2));
		setLoading(false);
		setError(true);
	};

	// ✅ Fetch token and wait
	useEffect(() => {
		const fetchToken = async () => {
			try {
				const storedToken = await AsyncStorage.getItem('token');
				if (storedToken) {
					setToken(storedToken);
				} else {
					console.warn('⚠️ No auth token found in AsyncStorage');
					setError(true);
				}
			} catch (e) {
				console.error('❌ Failed to fetch token:', e);
        console.log('🛂 Token fetched from AsyncStorage:', storedToken);

				setError(true);
			} finally {
				setTokenLoaded(true); // ✅ Mark as finished
			}
		};

		fetchToken();
	}, []);

	// Handle back button
	useEffect(() => {
		const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
			navigation.navigate('MainTabs');
			//navigation.goBack();
			return true;
		});

		return () => backHandler.remove();
	}, []);

	useEffect(() => {
		// Hide StatusBar when video starts
		StatusBar.setHidden(true, 'fade');

		return () => {
			// Restore StatusBar when leaving the screen
			StatusBar.setHidden(false, 'fade');
		};
	}, []);


	// ⏳ Wait until token is fetched
	if (!tokenLoaded) {
		return (
			<View style={styles.loading}>
				<ActivityIndicator size="large" color="#9346D2" />
				<Text style={styles.loadingText}>Preparing video...</Text>
			</View>
		);
	}

	if (!videoSource || !token) {
    Alert.alert("Missing Video", `videoSource: ${videoSource}\ntoken: ${token}`);
		return (
			<View style={styles.container}>
				
				<TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
					<Icon name="arrow-back" size={28} color="#fff" />
				</TouchableOpacity>
				<View style={styles.errorContainer}>
					<Icon name="error" size={50} color="#ff6b6b" />
					<Text style={styles.errorText}>Video source or token not found</Text>
				</View>
			</View>
		);
	}
	console.log('📺 Video URI:', videoSource);
	console.log('🛂 Sent Token:', token);
	return (
		<View style={styles.container}>
			
			<TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
				<Icon name="arrow-back" size={28} color="#fff" />
			</TouchableOpacity>

			<Video
				source={{
					uri: videoSource.includes('/signed-stream/')
						? `${videoSource}?token=${token}`
						: videoSource
				}}
				style={styles.video}
				resizeMode="contain"
				onLoadStart={() => console.log('📥 Loading started:', videoSource)}
				onBuffer={handleBuffer}
				onLoad={handleLoad}
				onError={handleError}
				paused={paused}
				controls
				allowsExternalPlayback={false}
				playWhenInactive={false}
				playInBackground={false}
			/>


			{loading && !error && (
				<View style={styles.loading}>
					<ActivityIndicator size="large" color="#9346D2" />
					<Text style={styles.loadingText}>Loading video...</Text>
				</View>
			)}

			{error && (
				<View style={styles.errorContainer}>
					<Icon name="error" size={50} color="#ff6b6b" />
					<Text style={styles.errorText}>Failed to load video</Text>
					<TouchableOpacity
						style={styles.retryButton}
						onPress={() => {
							setError(false);
							setLoading(true);
						}}
					>
						<Text style={styles.retryText}>Retry</Text>
					</TouchableOpacity>
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'black',
		justifyContent: 'center',
	},
	video: {
		width: '100%',
		height: '100%',
	},
	loading: {
		...StyleSheet.absoluteFillObject,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'black',
	},
	loadingText: {
		color: '#fff',
		marginTop: 10,
		fontSize: 16,
	},
	backButton: {
		position: 'absolute',
		top: 40,
		left: 20,
		zIndex: 10,
		padding: 10,
		backgroundColor: '#00000080',
		borderRadius: 20,
	},
	errorContainer: {
		...StyleSheet.absoluteFillObject,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
		backgroundColor: '#000000AA',
	},
	errorText: {
		color: '#fff',
		fontSize: 18,
		fontWeight: 'bold',
		marginTop: 10,
		textAlign: 'center',
	},
	retryButton: {
		backgroundColor: '#9346D2',
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 8,
		marginTop: 20,
	},
	retryText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
	},
});

export default VideoPlayerScreen;
