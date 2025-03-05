import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
} from 'react-native';
import Video from 'react-native-video';

const VideoPlayerWithThumbnail = React.forwardRef(
  ({videoUrl, onProgress, autoPIP = false}, ref) => {
    const [isVideoPlaying, setIsVideoPlaying] = useState(autoPIP); // Auto-play if autoPIP is true
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isPaused, setIsPaused] = useState(!autoPIP); // Don't pause if autoPIP is true
    const [isBuffering, setIsBuffering] = useState(false);
    const [availableQualities, setAvailableQualities] = useState([]);
    const [currentQuality, setCurrentQuality] = useState('auto');
    const [progress, setProgress] = useState({
      currentTime: 0,
      playableDuration: 0,
      seekableDuration: 0,
      bufferedPosition: 0,
    });
    const [streamInfo, setStreamInfo] = useState({
      bitrate: 0,
      currentTime: 0,
      duration: 0,
    });

    const videoRef = useRef(null);

    useEffect(() => {
      if (isVideoLoaded && isVideoPlaying) {
        // enterPIPMode();
      }
    }, [isVideoLoaded, isVideoPlaying]);

    const handlePlayPress = () => {
      setIsVideoPlaying(true);
      setIsPaused(false);
    };

    const togglePlay = () => {
      console.log('VideoUrl in Video player', videoUrl);
      setIsPaused(!isPaused);
    };

    const handleTracksChanged = tracks => {
      if (tracks.videoTracks) {
        const qualities = tracks.videoTracks.map(track => ({
          height: track.height,
          width: track.width,
          bitrate: track.bitrate,
        }));
        setAvailableQualities(qualities);
      }
    };

    const formatTime = timeInSeconds => {
      if (!timeInSeconds) return '00:00';
      const minutes = Math.floor(timeInSeconds / 60);
      const seconds = Math.floor(timeInSeconds % 60);
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleVideoError = error => {
      console.error('Video Error:', {
        error,
        errorString: error.error?.errorString,
        errorException: error.error?.exception,
      });
      // Implement retry logic if needed
      if (error.error?.errorString === 'Source error') {
        // Handle source errors
      } else if (error.error?.errorString === 'Timeout') {
        // Handle timeout errors
      }
    };

    const handleBuffer = ({isBuffering}) => {
      setIsBuffering(isBuffering);

      // Resume playback when buffering completes
      if (!isBuffering && !isPaused) {
        setIsPaused(false);
        videoRef.current.resume();
      }
    };

    const handleProgress = data => {
      // Update internal progress state
      setProgress({
        currentTime: data.currentTime,
        playableDuration: data.playableDuration,
        seekableDuration: data.seekableDuration,
        bufferedPosition: data.bufferedPosition,
      });

      // Calculate progress percentage
      const progressPercentage =
        (data.currentTime / data.seekableDuration) * 100;

      // Send comprehensive progress data to parent
      onProgress &&
        onProgress({
          currentTime: data.currentTime,
          playableDuration: data.playableDuration,
          seekableDuration: data.seekableDuration,
          bufferedPosition: data.bufferedPosition,
          progressPercentage,
        });
    };

    const enterPIPMode = async () => {
      if (Platform.OS !== 'ios' || !videoRef.current?.enterPictureInPicture) {
        console.log('PIP not supported');
        return;
      }

      if (!isVideoLoaded) {
        console.log(
          'PIP mode not available yet (video still loading or buffering)',
        );
        return;
      }

      try {
        videoRef.current.enterPictureInPicture();
        console.log('Successfully entered PIP mode');
      } catch (error) {
        console.error('PIP Mode Error:', error);
      }
    };

    const seek = async time => {
      try {
        if (videoRef.current) {
          if (typeof time !== 'number' || isNaN(time)) {
            throw new Error('Invalid seek time');
          }

          // Pause the video before seeking
          setIsPaused(true);

          // Perform precise seek with 0 tolerance
          await videoRef.current.seek(time, 0);

          // Add a small delay to ensure the seek completes
          // and the video has buffered enough to start playing
          if (!isBuffering) {
            await videoRef.current.resume();
          }
          setIsPaused(false);
          // setTimeout(() => {
          //   console.log(`Seeked to ${time} seconds with precise timing`);
          // }, 100);
        }
      } catch (error) {
        console.error('Error seeking video:', error);
      }
    };

    // Expose seek method through ref
    React.useImperativeHandle(ref, () => ({
      seek,
    }));
    const handleSeekBackward = () => {
      if (videoRef.current) {
        const newTime = Math.max(0, progress.currentTime - 30);
        videoRef.current.seek(newTime);
      }
    };

    const handleSeekForward = () => {
      const newTime = Math.min(
        progress.seekableDuration,
        progress.currentTime + 30,
      );
      seek(newTime);
    };

    return (
      <View style={styles.container}>
        {!isVideoPlaying && !autoPIP && (
          <View>
            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlayPress}>
              <Image
                source={require('./assets/play-31.png')}
                style={styles.playIcon}
              />
            </TouchableOpacity>
          </View>
        )}

        {(isVideoPlaying || autoPIP) && (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowControls(!showControls)}
            style={[
              styles.videoContainer,
              autoPIP && {opacity: 0, height: 1, width: 1}, // Make container invisible if autoPIP
            ]}>
            <Video
              ref={videoRef}
              source={{
                uri: videoUrl,
                type: 'm3u8',
                bufferConfig: {
                  minBufferMs: 15000,
                  maxBufferMs: 50000,
                  bufferForPlaybackMs: 2500,
                  bufferForPlaybackAfterRebufferMs: 5000,
                },
              }}
              style={styles.video}
              resizeMode="contain"
              paused={isPaused}
              onBuffer={handleBuffer}
              onLoad={() => {
                console.log('Video loaded');
                setIsVideoLoaded(true);
              }}
              onError={handleVideoError}
              onProgress={handleProgress}
              onTracksChanged={handleTracksChanged}
              controls={false}
              allowsExternalPlayback={true}
              ignoreSilentSwitch="ignore"
              pictureInPicture={true}
              playWhenInactive={true}
              playInBackground={true}
              maxBitRate={2000000}
              selectedVideoTrack={{
                type: 'auto',
              }}
              progressUpdateInterval={1000}
              automaticallyWaitsToMinimizeStalling={false}
              preferredForwardBufferDuration={10}
              onPictureInPictureStatusChanged={status => {
                console.log('PIP Status Changed:', status);
              }}
              onRestoreUserInterfaceForPictureInPictureStop={() => {
                console.log('PIP Stopped - UI Restored');
              }}
              onPictureInPictureActive={active => {
                console.log('PIP Active Status:', active);
              }}
              onBandwidthUpdate={data => {
                console.log('Bandwidth update:', data);
                setStreamInfo(prev => ({
                  ...prev,
                  bitrate: data.bitrate,
                }));
              }}
            />

            {showControls && !autoPIP && (
              <>
                {/* Center Controls */}
                <View style={styles.centerControlsContainer}>
                  <TouchableOpacity
                    style={styles.seekButton}
                    onPress={handleSeekBackward}>
                    <Image
                      source={require('./assets/back-30_white.png')}
                      style={styles.seekIcon}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.centerPlayButton}
                    onPress={togglePlay}>
                    <Image
                      source={
                        isPaused
                          ? require('./assets/play-50_white.png')
                          : require('./assets/pause-50_white.png')
                      }
                      style={styles.centerPlayIcon}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.seekButton}
                    onPress={handleSeekForward}>
                    <Image
                      source={require('./assets/forward-30_white.png')}
                      style={styles.seekIcon}
                    />
                  </TouchableOpacity>
                </View>

                {/* Bottom Controls */}
                <View style={styles.controlsContainer}>
                  <View style={styles.progressContainer}>
                    <Text style={styles.timeText}>
                      {formatTime(progress.currentTime)} /{' '}
                      {formatTime(progress.seekableDuration)}
                    </Text>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.bufferFill,
                          {
                            width: `${
                              (progress.bufferedPosition /
                                progress.seekableDuration) *
                              100
                            }%`,
                          },
                        ]}
                      />
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${
                              (progress.currentTime /
                                progress.seekableDuration) *
                              100
                            }%`,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  {isBuffering && (
                    <View style={styles.bufferingIndicator}>
                      <ActivityIndicator size="small" color="#ffffff" />
                      <Text style={styles.bufferingText}>Buffering...</Text>
                    </View>
                  )}

                  {isVideoLoaded && (
                    <TouchableOpacity
                      style={styles.pipButton}
                      onPress={enterPIPMode}>
                      <Image
                        source={require('./assets/pip_mode.png')}
                        style={styles.pipIcon}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </TouchableOpacity>
        )}

        {!isVideoLoaded && (isVideoPlaying || autoPIP) && !autoPIP && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    marginVertical: 10,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 10,
  },
  playButton: {
    position: 'absolute',
    top: '40%',
    left: '40%',
    zIndex: 1,
  },
  playIcon: {
    width: 50,
    height: 50,
  },
  videoContainer: {
    flex: 1,
  },
  video: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
  },
  controlButton: {
    padding: 10,
  },
  controlIcon: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  timeText: {
    color: '#ffffff',
    fontSize: 12,
    marginBottom: 5,
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 1.5,
  },
  bufferFill: {
    position: 'absolute',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 1.5,
  },
  pipButton: {
    padding: 10,
    marginLeft: 'auto',
  },
  pipIcon: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  loaderContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{translateX: -25}, {translateY: -25}],
  },
  bufferingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  bufferingText: {
    color: '#ffffff',
    marginLeft: 5,
    fontSize: 12,
  },
  centerControlsContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{translateY: -25}],
  },
  seekButton: {
    padding: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
    marginHorizontal: 20,
  },
  seekIcon: {
    width: 30,
    height: 30,
    tintColor: 'white',
  },
  centerPlayButton: {
    padding: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 40,
  },
  centerPlayIcon: {
    height: 30,
    width: 30,
  },
});

export default VideoPlayerWithThumbnail;
