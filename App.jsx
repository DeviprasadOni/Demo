import React, {useRef} from 'react';
import {SafeAreaView, StatusBar, StyleSheet} from 'react-native';
import VideoPlayerWithThumbnail from './VideoPlayerWithThumbnail';

const App = () => {
  const videoPlayerRef = useRef(null);
  const videoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor="#0B0B0E"
        barStyle="light-content"
        translucent={false}
        hidden={false}
      />
      <VideoPlayerWithThumbnail ref={videoPlayerRef} videoUrl={videoUrl} />
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0E',
  },
});
export default App;
