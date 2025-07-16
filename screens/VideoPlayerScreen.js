import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  StatusBar,
  BackHandler,
  ActivityIndicator,
  TouchableWithoutFeedback
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Orientation from 'react-native-orientation-locker';
import Slider from '@react-native-community/slider';

const VideoPlayerScreen = ({ route, navigation }) => {
  const { videoUri } = route.params;
  const videoRef = useRef(null);

  const [paused, setPaused] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [token, setToken] = useState(null);

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

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });
    return () => backHandler.remove();
  }, []);

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    let timeout;
    if (controlsVisible) {
      timeout = setTimeout(() => setControlsVisible(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [controlsVisible]);

  const toggleFullscreen = () => {
    if (fullscreen) Orientation.unlockAllOrientations();
    else Orientation.lockToLandscape();
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
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
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
          <View style={styles.controls}>
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
    bottom: 80,
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
    bottom: 20,
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
