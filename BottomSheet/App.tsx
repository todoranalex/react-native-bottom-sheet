import 'react-native-gesture-handler';
import React, {useState} from 'react';
import {
  Button,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BottomSheet from './BottomSheet';

const {width} = Dimensions.get('window');

export default () => {
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [counter, setCounter] = useState(1);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={StyleSheet.absoluteFill}
        onPress={() => {
          setShowBottomSheet(true);
        }}>
        <Image
          resizeMode="contain"
          style={StyleSheet.absoluteFill}
          source={{
            uri: 'https://www.appcoda.com/wp-content/uploads/2015/04/react-native.png',
          }}
        />
      </TouchableOpacity>

      {showBottomSheet && (
        <BottomSheet
          onExit={() => {
            setShowBottomSheet(false);
          }}>
          <React.Fragment>
            <View style={styles.notch} />
            <View
              style={[
                styles.sheetContainer,
                {
                  height: 300 + counter * 100,
                },
              ]}>
              <View style={{height: 100 + counter * 20, width}}>
                <Image
                  resizeMode="contain"
                  style={StyleSheet.absoluteFill}
                  source={{
                    uri: 'https://www.appcoda.com/wp-content/uploads/2015/04/react-native.png',
                  }}
                />
              </View>
              <Text
                style={{color: 'black', fontSize: 20, marginTop: 8}}
                onPress={() => {
                  setCounter(counter + 1);
                }}>
                Increase size
              </Text>
              <Text
                onPress={() => {
                  setCounter(counter - 1);
                }}
                style={{marginTop: 8}}>
                Decrease size
              </Text>
            </View>
          </React.Fragment>
        </BottomSheet>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  notch: {
    width: 80,
    height: 2,
    backgroundColor: 'gray',
    alignSelf: 'center',
    borderRadius: 40,
    marginTop: 22,
  },
  sheetContainer: {
    height: 300,
    width,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  img: {
    height: 150,
    width,
  },
});
