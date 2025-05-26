import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  items: { label: string; value: number; thumbnail: string }[];
  xAxisStart?: number;
  xAxisEnd?: number;
}

const chartColor = "#959696";

const SVG_WIDTH = 500;
const SVG_HEIGHT = 300;
const PADDING = 50;
const MAX_Y = 100;

export const CareerTrajectoryWidget = ({ items }: Props) => {
  const [hovered, setHovered] = useState<{
    x: number;
    y: number;
    label: string;
    value: number;
    thumbnail: string;
  } | null>(null);

  const stepX = (SVG_WIDTH - PADDING * 2) / (items.length - 1);

  const points = items.map((d, i) => {
    const x = PADDING + i * stepX;
    const y = PADDING + ((MAX_Y - d.value) / MAX_Y) * (SVG_HEIGHT - PADDING * 2);
    return [x, y];
  });

  const pathD = points.reduce(
    (acc, [x, y], i) => (i === 0 ? `M ${x},${y}` : `${acc} L ${x},${y}`),
    ""
  );

  const yTicks = [0, 25, 50, 75, 100];

  // Animation timings
  const gridLineDelayStep = 0.05;
  const yGridDuration = 0.3;
  const lineAnimDelay = 0.1;
  const pointAnimStartDelay = lineAnimDelay + 0.3;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: SVG_WIDTH,
        margin: "0 auto",
        position: "relative",
      }}
    >
      <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} width="100%" height="auto">
        <defs>
          <filter
            id="text-shadow"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feDropShadow
              dx="0"
              dy="1"
              stdDeviation="1"
              floodColor="black"
              floodOpacity="0.8"
            />
          </filter>
        </defs>

        {/* Y Gridlines - animate scaleX */}
        {yTicks.map((val, i) => {
          const y = PADDING + ((MAX_Y - val) / MAX_Y) * (SVG_HEIGHT - PADDING * 2);
          return (
            <motion.line
              key={val}
              x1={PADDING}
              x2={SVG_WIDTH - PADDING}
              y1={y}
              y2={y}
              stroke={chartColor}
              strokeWidth="1"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{
                delay: i * gridLineDelayStep,
                duration: yGridDuration,
              }}
              style={{ transformOrigin: "left center" }}
            />
          );
        })}

        {/* Y-axis */}
        <line
          x1={PADDING}
          y1={PADDING}
          x2={PADDING}
          y2={SVG_HEIGHT - PADDING}
          stroke={chartColor}
        />
        {/* Y-axis ticks and labels */}
        {yTicks.map((val) => {
          const y = PADDING + ((MAX_Y - val) / MAX_Y) * (SVG_HEIGHT - PADDING * 2);
          return (
            <g key={`ytick-${val}`}>
              <line
                x1={PADDING - 5}
                x2={PADDING}
                y1={y}
                y2={y}
                stroke={chartColor}
              />
              <text
                x={PADDING - 10}
                y={y + 4}
                fontSize={10}
                textAnchor="end"
                fill="#333"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* X-axis */}
        <line
          x1={PADDING}
          y1={SVG_HEIGHT - PADDING}
          x2={SVG_WIDTH - PADDING}
          y2={SVG_HEIGHT - PADDING}
          stroke="#ccc"
        />
        {/* X-axis ticks and labels */}
        {items.map((d, i) => {
          const x = PADDING + i * stepX;
          return (
            <g key={`xtick-${d.label}`}>
              <line
                x1={x}
                x2={x}
                y1={SVG_HEIGHT - PADDING}
                y2={SVG_HEIGHT - PADDING + 5}
                stroke="#999"
              />
              <text
                x={x}
                y={SVG_HEIGHT - PADDING + 18}
                fontSize={10}
                textAnchor="middle"
                fill="#333"
              >
                {d.label}
              </text>
            </g>
          );
        })}

        {/* Animated path */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 1.0,
            ease: "easeInOut",
            delay: lineAnimDelay,
          }}
        />

        {/* Animate points as line progresses */}
        {points.map(([x, y], i) => (
          <motion.g
            key={`point-${i}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: pointAnimStartDelay + 1.5 * (i / (points.length - 1)) * 0.6,
              duration: 0.3,
            }}
            onMouseEnter={() => setHovered({ x, y, ...items[i] })}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: "pointer" }}
          >
            <image
              href={items[i].thumbnail}
              x={x - 8}
              y={y - 24}
              width={16}
              height={16}
              style={{ pointerEvents: "none" }}
            />
            <circle
              cx={x}
              cy={y}
              r={5}
              fill="#3b82f6"
              stroke="#fff"
              strokeWidth="2"
            />
          </motion.g>
        ))}

        {/* Hovered label & value */}
        <AnimatePresence>
          {hovered && (
            <motion.g
              key="hover-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <text
                x={hovered.x}
                y={hovered.y + 30}
                fontSize={12}
                fill="white"
                pointerEvents="none"
                filter="url(#text-shadow)"
                textAnchor="middle"
              >
                {hovered.label}
              </text>
              <text
                x={hovered.x}
                y={hovered.y + 45}
                fontSize={12}
                fill="white"
                pointerEvents="none"
                filter="url(#text-shadow)"
                textAnchor="middle"
              >
                {hovered.value.toFixed(2)}
              </text>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
    </div>
  );
};
