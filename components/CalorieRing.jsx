import Svg, { Circle, Text as SvgText } from "react-native-svg";
import { COLORS, rs, rf } from "../constants/theme";

export default function CalorieRing({ eaten = 0, goal = 2000 }) {
  const size = rs(160);
  const r = rs(58);
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(eaten / goal, 1);
  const dash = pct * circ;
  const color = pct > 0.95 ? COLORS.red : pct > 0.75 ? COLORS.amber : COLORS.green;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={cx} cy={cy} r={r} fill="none" stroke={COLORS.greenLight} strokeWidth={rs(12)} />
      <Circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth={rs(12)}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        rotation="-90" origin={`${cx}, ${cy}`}
      />
      <SvgText x={cx} y={cy - rf(8)} textAnchor="middle"
        fill={COLORS.dark} fontSize={rf(26)} fontWeight="900">{eaten}</SvgText>
      <SvgText x={cx} y={cy + rf(12)} textAnchor="middle"
        fill={COLORS.muted} fontSize={rf(10)}>of {goal} kcal</SvgText>
    </Svg>
  );
}