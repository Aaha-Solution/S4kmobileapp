import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  StatusBar,
  BackHandler,
  ActivityIndicator,
  TouchableWithoutFeedback,
  InteractionManager
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Orientation from 'react-native-orientation-locker';
import Slider from '@react-native-community/slider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const VideoPlayerScreen = ({ route, navigation }) => {
  const { videoUri } = route.params;
  const videoRef = useRef(null);
  const insets = useSafeAreaInsets(); // ✅ Get device safe area insets

  const [paused, setPaused] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [token, setToken] = useState(null);
  const [shouldGoBack, setShouldGoBack] = useState(false);

  const getVideoSource = (videoData) => {
    if (typeof videoData === 'string') return videoData;
    if (typeof videoData === 'object') {
      return (
        videoData.videoUrl ||
        videoData.url ||
        videoData.uri ||
        videoData.video_url ||
        videoData.file_url
      );
    }
    return null;
  };

  const source = getVideoSource(videoUri);

  useEffect(() => {
    const loadToken = async () => {
      const t = await AsyncStorage.getItem('token');
      setToken(t);
    };
    loadToken();
  }, []);

  // Function to handle safe back navigation
  const goBackSafely = () => {
    setControlsVisible(false);

    Orientation.getOrientation((orientation) => {
      if (orientation === 'PORTRAIT') {
        navigation.goBack(); // Immediate back if already portrait
      } else {
        Orientation.lockToPortrait();
        setShouldGoBack(true); // Wait for orientation listener
      }
    });
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      goBackSafely();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    const handleDeviceOrientation = (orientation) => {
      if (orientation === 'PORTRAIT' && shouldGoBack) {
        setShouldGoBack(false);
        // Delay just enough for screen to settle fully
        setTimeout(() => {
          InteractionManager.runAfterInteractions(() => {
            navigation.goBack();
          });
        }, 700); // You can increase this if glitch still occurs
      }
    };
    Orientation.addDeviceOrientationListener(handleDeviceOrientation);
    return () => {
      Orientation.removeDeviceOrientationListener(handleDeviceOrientation);
    };
  }, [shouldGoBack]);


  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      Orientation.lockToPortrait();
    });

    return () => {
      unsubscribe();
      Orientation.lockToPortrait();
    };
  }, [navigation]);

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    let timeout;
    if (controlsVisible) {
      timeout = setTimeout(() => setControlsVisible(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [controlsVisible]);

  const toggleFullscreen = () => {
    if (fullscreen) {
      Orientation.lockToPortrait();
    } else {
      Orientation.lockToLandscape();
    }
    setFullscreen(!fullscreen);
  };

  const onSeek = (time) => {
    videoRef.current?.seek(time);
    setCurrentTime(time);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };
  const handleVideoEnd = () => {
    Orientation.lockToPortrait();
    navigation.goBack(); // Or use navigation.navigate('Home') if needed
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <TouchableWithoutFeedback onPress={() => setControlsVisible(!controlsVisible)}>
        <Video
          ref={videoRef}
          source={{ uri: source.includes('/signed-stream/') ? `${source}?token=${token}` : source }}
          style={styles.video}
          resizeMode="contain"
          paused={paused}
          onLoad={data => {
            setDuration(data.duration);
            setLoading(false);
          }}
          onProgress={data => setCurrentTime(data.currentTime)}
          onEnd={handleVideoEnd}
        />
      </TouchableWithoutFeedback>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#9346D2" />
          <Text style={{ color: 'white', marginTop: 10 }}>Loading video...</Text>
        </View>
      )}

      {controlsVisible && (
        <>
          {/* Top Controls */}
          <View style={styles.topControls}>
            <TouchableOpacity onPress={goBackSafely}>
              <Icon name="arrow-back" size={30} color="#fff" />
            </TouchableOpacity>

          </View>

          {/* Progress Bar */}
          <View style={[styles.progressContainer, { bottom: insets.bottom + 80 }]}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration}
              value={currentTime}
              onSlidingComplete={onSeek}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#888888"
              thumbTintColor="#FFFFFF"
            />
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>

          {/* Bottom Controls */}
          <View style={[styles.controls, { bottom: insets.bottom + 10 }]}>
            <TouchableOpacity onPress={() => onSeek(Math.max(currentTime - 10, 0))}>
              <Icon name="replay-10" size={32} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setPaused(!paused)}>
              <Icon name={paused ? 'play-arrow' : 'pause'} size={40} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => onSeek(Math.min(currentTime + 10, duration))}>
              <Icon name="forward-10" size={32} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleFullscreen}>
              <Icon name="fullscreen" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  video: {
    flex: 1,
  },
  topControls: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  progressContainer: {
    position: 'absolute',
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
  },
  controls: {
    position: 'absolute',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VideoPlayerScreen;
