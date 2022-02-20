import 'react-native-gesture-handler';
import {
  PanGestureHandler,
  PanGestureHandlerStateChangeEvent,
  State,
} from 'react-native-gesture-handler';
import React, {
  forwardRef,
  ReactNode,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  Alert,
  Platform,
  Easing,
} from 'react-native';

import {initialWindowMetrics} from 'react-native-safe-area-context';

const {height} = Dimensions.get('window');
//Original height does not include Android notch height..so we add it manually
const BOTTOM_SNAP = height;

export type BottomSheetExposedMethods = {
  exit(showAlert?: boolean): void;
};

type BottomSheedProps = {
  children: ReactNode;
  onExit(): void;
  exitAlert?: CancelFlowAlert;
};

const BottomSheet: React.ForwardRefRenderFunction<
  BottomSheetExposedMethods,
  BottomSheedProps
> = (props, ref) => {
  const {children, exitAlert, onExit} = props;
  const dragY = useRef(new Animated.Value(0)).current;
  const translateYOffset = useRef(new Animated.Value(BOTTOM_SNAP)).current;
  const [snap, setSnap] = useState(BOTTOM_SNAP);
  const translateY = Animated.add(translateYOffset, dragY).interpolate({
    inputRange: [snap, BOTTOM_SNAP],
    outputRange: [snap, BOTTOM_SNAP],
    extrapolate: 'clamp',
  });
  const backgroundOpacity = translateY.interpolate({
    inputRange: [height / 1.5, BOTTOM_SNAP],
    outputRange: [0.85, 0],
    extrapolate: 'clamp',
  });

  useImperativeHandle(ref, () => {
    return {
      exit: (showAlert?: boolean) => {
        if (!!exitAlert && showAlert) {
          showExitAlert({
            ...exitAlert,
            onExit: () => {
              snapTo(BOTTOM_SNAP);
            },
            onContinue: () => {},
          });
        } else {
          snapTo(BOTTOM_SNAP);
        }
      },
    };
  });

  const _onPanGestureEvent = Animated.event(
    [{nativeEvent: {translationY: dragY}}],
    {
      useNativeDriver: true,
    },
  );

  const _onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    const {velocityY, oldState, translationY} = event.nativeEvent;
    if (oldState === State.ACTIVE) {
      const endOffsetY = translationY + snap;
      let nextSnap = BOTTOM_SNAP;
      const distanceFromSnap = snap - endOffsetY;
      if (distanceFromSnap > -50) {
        nextSnap = snap;
      }
      translateYOffset.extractOffset();
      translateYOffset.setValue(translationY);
      translateYOffset.flattenOffset();
      dragY.setValue(0);
      Animated.spring(translateYOffset, {
        velocity: velocityY,
        bounciness: 0,
        toValue: nextSnap,
        useNativeDriver: true,
      }).start(() => {
        if (nextSnap === BOTTOM_SNAP) {
          if (!!exitAlert) {
            showExitAlert({
              ...exitAlert,
              onExit,
              onContinue: () => {
                snapTo(snap);
              },
            });
          } else {
            onExit();
          }
        }
      });
    }
  };

  const snapTo = (newSnap: number) => {
    if (newSnap < snap) {
      setSnap(newSnap);
    }
    Animated.timing(translateYOffset, {
      toValue: newSnap,
      duration: 350,
      easing: Easing.inOut(Easing.linear),
      useNativeDriver: true,
    }).start(() => {
      if (newSnap === BOTTOM_SNAP) {
        onExit();
      }
      if (newSnap > snap) {
        // If we shring the bottom sheet, set the new snap after the animation so that the height does not 'jump'
        setSnap(newSnap);
      }
    });
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={{...styles.transparentOverlay, opacity: backgroundOpacity}}
      />
      <TouchableOpacity
        style={{...StyleSheet.absoluteFillObject}}
        onPress={() => {
          if (!!exitAlert) {
            showExitAlert({
              ...exitAlert,
              onExit: () => {
                snapTo(BOTTOM_SNAP);
              },
              onContinue: () => {},
            });
          } else {
            snapTo(BOTTOM_SNAP);
          }
        }}
      />
      <PanGestureHandler
        onHandlerStateChange={_onHandlerStateChange}
        onGestureEvent={_onPanGestureEvent}>
        <Animated.View
          style={[
            styles.bottomSheetContainer,

            {
              transform: [
                {
                  translateY: translateY,
                },
              ],
            },
          ]}>
          <View
            onLayout={({nativeEvent}) => {
              const newHeight = nativeEvent.layout.height;
              snapTo(height - newHeight);
            }}>
            {children}
          </View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

type ExitAlert = CancelFlowAlert & {
  onExit(): void;
  onContinue(): void;
};

const showExitAlert = (props: ExitAlert) => {
  return Alert.alert(
    props.cancelFlowTitle,
    props.cancelFlowText,
    [
      {
        text: props.cancelFlowPositive,
        style: 'destructive',
        onPress: props.onExit,
      },
      {
        text: props.cancelFlowNegative,
        onPress: props.onContinue,
      },
    ],
    {
      cancelable: false,
    },
  );
};

export type CancelFlowAlert = {
  cancelFlowTitle: string;
  cancelFlowText: string;
  cancelFlowPositive: string;
  cancelFlowNegative: string;
};

export default forwardRef(BottomSheet);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  transparentOverlay: {
    flex: 1,
    backgroundColor: 'black',
  },
  bottomSheetContainer: {
    backgroundColor: 'white',
    height,
    width: '100%',
    position: 'absolute',
    right: 0,
    left: 0,
    bottom: 0,
    borderRadius: 8,
  },
});
