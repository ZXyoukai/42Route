import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';

interface BusLoadingScreenProps {
  msg?: string;
}

export const BusLoadingScreen = ({ msg = 'Carregando...' }: BusLoadingScreenProps) => {
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
    <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
      {/* Bus silhouette */}
      <View style={{ width: 200, height: 90, marginBottom: 32 }}>
        {/* Body */}
        <View style={{
          width: 200, height: 72, backgroundColor: '#1e293b',
          borderRadius: 14, borderWidth: 2, borderColor: '#334155',
          overflow: 'hidden',
        }}>
          {/* Windows — each lights up individually */}
          <View style={{ flexDirection: 'row', paddingHorizontal: 12, paddingTop: 10, position: 'absolute', top: 0, left: 0, right: 0 }}>
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

          {/* Door */}
          <View style={{
            position: 'absolute', bottom: 0, right: 14,
            width: 16, height: 30,
            backgroundColor: 'rgba(15,23,42,0.6)',
            borderRadius: 4, borderWidth: 1, borderColor: '#475569',
          }} />

          {/* Front light */}
          <View style={{
            position: 'absolute', top: 24, left: 6,
            width: 8, height: 8, borderRadius: 4,
            backgroundColor: '#fbbf24',
          }} />
        </View>

        {/* Wheels */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 22, marginTop: 2 }}>
          {[0, 1].map(i => (
            <View key={i} style={{
              width: 26, height: 26, borderRadius: 13,
              backgroundColor: '#1e293b', borderWidth: 3, borderColor: '#334155',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#475569' }} />
            </View>
          ))}
        </View>
      </View>

      <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 16, textAlign: 'center', marginBottom: 6 }}>
        {msg}
      </Text>

      {/* Dots */}
      <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
        {[dot1, dot2, dot3].map((d, i) => (
          <Animated.View key={i} style={{
            width: 8, height: 8, borderRadius: 4,
            backgroundColor: '#00babc', opacity: d,
          }} />
        ))}
      </View>
    </View>
  );
};
