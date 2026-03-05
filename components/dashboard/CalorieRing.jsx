import { useEffect } from "react";
import Animated, {
    Easing,
    useAnimatedProps,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import { COLORS, rf, rs } from "../../constants/theme";

// Create an animatable version of the SVG Circle
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function CalorieRing({ eaten = 0, goal = 2000 }) {
  const size = rs(160);
  const r = rs(58);
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;

  // Visual progress still fills up as you eat
  const pct = Math.min(eaten / goal, 1);
  const color =
    pct > 0.95 ? COLORS.red : pct > 0.75 ? COLORS.amber : COLORS.green;

  // Calculate the remaining calories for the center text
  const left = Math.max(goal - eaten, 0);

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
      <Circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={COLORS.greenLight}
        strokeWidth={rs(12)}
      />

      {/* Animated Foreground Progress */}
      <AnimatedCircle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={rs(12)}
        animatedProps={animatedProps}
        strokeLinecap="round"
        rotation="-90"
        origin={`${cx}, ${cy}`}
      />

      {/* Text inside the ring */}
      <SvgText
        x={cx}
        y={cy - rf(4)}
        textAnchor="middle"
        fill={COLORS.dark}
        fontSize={rf(28)}
        fontWeight="900"
      >
        {left}
      </SvgText>

      <SvgText
        x={cx}
        y={cy + rf(16)}
        textAnchor="middle"
        fill={COLORS.muted}
        fontSize={rf(12)}
        fontWeight="700"
      >
        kcal Left
      </SvgText>
    </Svg>
  );
}
