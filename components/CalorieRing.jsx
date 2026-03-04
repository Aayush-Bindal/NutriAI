import { useEffect } from "react";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from "react-native-reanimated";
import { COLORS, rs, rf } from "../constants/theme";

// Create an animatable version of the SVG Circle
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function CalorieRing({ eaten = 0, goal = 2000 }) {
  const size = rs(160);
  const r = rs(58);
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(eaten / goal, 1);
  const color = pct > 0.95 ? COLORS.red : pct > 0.75 ? COLORS.amber : COLORS.green;

  // Animation shared value
  const progress = useSharedValue(0);

  // Trigger animation whenever 'pct' changes
  useEffect(() => {
    progress.value = withTiming(pct, {
      duration: 1200, // 1.2 seconds for a smooth fill
      easing: Easing.out(Easing.cubic),
    });
  }, [pct]);

  // Dynamically calculate the dasharray based on the animated progress value
  const animatedProps = useAnimatedProps(() => {
    const dash = progress.value * circ;
    return {
      strokeDasharray: `${dash} ${circ}`,
    };
  });

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background Track */}
      <Circle cx={cx} cy={cy} r={r} fill="none" stroke={COLORS.greenLight} strokeWidth={rs(12)} />
      
      {/* Animated Foreground Progress */}
      <AnimatedCircle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth={rs(12)}
        animatedProps={animatedProps} // Use animated props here
        strokeLinecap="round"
        rotation="-90" origin={`${cx}, ${cy}`}
      />
      
      {/* Text inside the ring */}
      <SvgText x={cx} y={cy - rf(8)} textAnchor="middle"
        fill={COLORS.dark} fontSize={rf(26)} fontWeight="900">{eaten}</SvgText>
      <SvgText x={cx} y={cy + rf(12)} textAnchor="middle"
        fill={COLORS.muted} fontSize={rf(10)}>of {goal} kcal</SvgText>
    </Svg>
  );
}