import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';

interface BusLoadingScreenProps {
  msg?: string;
}

export const BusLoadingScreen = ({ msg = 'A carregar...' }: BusLoadingScreenProps) => {
  // One Animated.Value per window (0 = dim, 1 = lit)
  const w1 = useRef(new Animated.Value(0)).current;
  const w2 = useRef(new Animated.Value(0)).current;
  const w3 = useRef(new Animated.Value(0)).current;
  const w4 = useRef(new Animated.Value(0)).current;

  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const STEP = 420; // ms each window takes to light up

    const lightUp = (anim: Animated.Value) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: STEP,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      });

    const resetAll = () =>
      Animated.parallel([w1, w2, w3, w4].map((a) =>
        Animated.timing(a, { toValue: 0, duration: 80, useNativeDriver: false })
      ));

    // Sequential: window 1 → 2 → 3 → 4, hold briefly, then reset all at once
    const cycle = Animated.loop(
      Animated.sequence([
        lightUp(w1),
        lightUp(w2),
        lightUp(w3),
        lightUp(w4),
        Animated.delay(300),   // pause with all lit
        resetAll(),
        Animated.delay(180),   // brief pause before next cycle
      ])
    );

    cycle.start();

    // Staggered dots
    const makeDot = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.3, duration: 350, useNativeDriver: true }),
          Animated.delay(700),
        ])
      );

    makeDot(dot1, 0).start();
    makeDot(dot2, 200).start();
    makeDot(dot3, 400).start();

    return () => {
      cycle.stop();
    };
  }, []);

  const windows = [w1, w2, w3, w4];

  return (
    <View className="flex-1 bg-slate-900 justify-center items-center px-10">
      {/* Bus silhouette */}
      <View className="w-[200px] h-[90px] mb-8">
        {/* Body */}
        <View className='flex flex-row justify-center'>
          <View className="w-[200px] h-[72px] bg-slate-800 rounded-[14px]  overflow-hidden">
            {/* Windows */}
            <View className="flex-row px-3 pt-2.5 absolute top-0 left-0 right-0">
              {windows.map((anim, i) => {
                const bg = anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['rgba(15,23,42,0.55)', 'rgba(0,186,188,0.75)'],
                });
                const borderC = anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['#475569', '#00babc'],
                });
                return (
                  <Animated.View
                    key={i}
                    style={{
                      flex: 1,
                      height: 26,
                      marginHorizontal: 3,
                      backgroundColor: bg,
                      borderRadius: 5,
                      borderWidth: 1,
                      borderColor: borderC,
                    }}
                  />
                );
              })}
            </View>

            <View className="absolute top- right-0 w-1 h-6 rounded-l-lg bg-slate-500" />
          </View>
            <View className='flex-1  flex-row h-20'>
              <View className="top-6 left-0 w-2 h-10 rounded-r-lg bg-slate-400" />
            </View>
        </View>
          

        {/* Wheels */}
        <View className="flex-row justify-between px-5 mt-0.5">
          {[0, 1].map(i => (
            <View key={i} className="w-[26px] h-[26px] rounded-full bg-slate-800 border-3 border-slate-700 items-center justify-center">
              <View className="w-2 h-2 rounded-full bg-slate-400" />
            </View>
          ))}
        </View>
      </View>

      <Text className="text-white font-bold text-base text-center mb-1.5">
        {msg}
      </Text>

      {/* Dots */}
      <View className="flex-row gap-1.5 mt-1.5">
        {[dot1, dot2, dot3].map((d, i) => (
          <Animated.View key={i} style={{ opacity: d }} className="w-2 h-2 rounded-full bg-[#00babc]" />
        ))}
      </View>
      
    </View>
  );
};
