import React from 'react';
import { ELEMENT_COLORS } from './MatrixVectorMultiplication';

export function VectorTransformationVisualizer({ vector, result, permutation }) {
  if (!vector || !result || !permutation) {
    return null;
  }

  const n = vector.length;
  const elementWidth = 56;
  const elementHeight = 50;
  const spacing = 96;
  const svgWidth = spacing * n + 40;
  const svgHeight = 290;
  const topY = 38;
  const bottomY = 188;
  const centerX = (i) => 40 + i * spacing + spacing / 2;

  return (
    <div>
      <h3 style={{
        margin: '0 0 0.85rem 0',
        fontSize: '0.72rem',
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: '#94a3b8',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <span style={{
          width: '4px',
          height: '14px',
          background: 'linear-gradient(180deg, #6366f1, #8b5cf6)',
          borderRadius: '2px',
        }} />
        Vector Transformation Flow
      </h3>
      <svg
        width="100%"
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{
          border: '1px solid #334155',
          borderRadius: '10px',
          background: 'radial-gradient(ellipse at center, #1e1b4b 0%, #0f172a 70%)',
          display: 'block',
        }}
      >
        <defs>
          {ELEMENT_COLORS.map((c, i) => (
            <linearGradient key={`grad-${i}`} id={`vt-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c} stopOpacity="1" />
              <stop offset="100%" stopColor={c} stopOpacity="0.78" />
            </linearGradient>
          ))}
          <filter id="vt-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* INPUT row label */}
        <text
          x="20"
          y={topY - 14}
          fontSize="10"
          fontWeight="700"
          letterSpacing="2"
          fill="#94a3b8"
          fontFamily="Inter, sans-serif"
        >
          INPUT
        </text>

        {/* Input elements */}
        {vector.map((val, i) => {
          const colorIdx = i % ELEMENT_COLORS.length;
          return (
            <g key={`input-${i}`}>
              <rect
                x={centerX(i) - elementWidth / 2}
                y={topY}
                width={elementWidth}
                height={elementHeight}
                fill={`url(#vt-grad-${colorIdx})`}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1"
                rx="8"
                filter="url(#vt-glow)"
                opacity="0.95"
              />
              <text
                x={centerX(i)}
                y={topY + elementHeight / 2 + 6}
                textAnchor="middle"
                fontSize="17"
                fontWeight="700"
                fill="white"
                fontFamily="Inter, sans-serif"
              >
                {val}
              </text>
              <text
                x={centerX(i)}
                y={topY + elementHeight + 18}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                letterSpacing="1"
                fill="#64748b"
                fontFamily="Inter, sans-serif"
              >
                POS {i}
              </text>
            </g>
          );
        })}

        {/* Arrows */}
        {permutation.map((_, sourcePos) => {
          const targetPos = permutation.indexOf(sourcePos);
          const startX = centerX(sourcePos);
          const endX = centerX(targetPos);
          const startY = topY + elementHeight + 4;
          const endY = bottomY - 4;
          const controlX = (startX + endX) / 2;
          const controlY = (startY + endY) / 2 + (Math.abs(endX - startX) * 0.15);

          const pathData = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;

          const dx = endX - controlX;
          const dy = endY - controlY;
          const angle = Math.atan2(dy, dx);
          const arrowSize = 9;
          const tip = { x: endX, y: endY };
          const left = {
            x: tip.x - arrowSize * Math.cos(angle - Math.PI / 6),
            y: tip.y - arrowSize * Math.sin(angle - Math.PI / 6),
          };
          const right = {
            x: tip.x - arrowSize * Math.cos(angle + Math.PI / 6),
            y: tip.y - arrowSize * Math.sin(angle + Math.PI / 6),
          };
          const color = ELEMENT_COLORS[sourcePos % ELEMENT_COLORS.length];

          return (
            <g key={`arrow-${sourcePos}`}>
              <path
                d={pathData}
                stroke={color}
                strokeWidth="2.2"
                fill="none"
                opacity="0.85"
                strokeLinecap="round"
              />
              <polygon
                points={`${tip.x},${tip.y} ${left.x},${left.y} ${right.x},${right.y}`}
                fill={color}
              />
            </g>
          );
        })}

        {/* OUTPUT row label */}
        <text
          x="20"
          y={bottomY - 14}
          fontSize="10"
          fontWeight="700"
          letterSpacing="2"
          fill="#94a3b8"
          fontFamily="Inter, sans-serif"
        >
          OUTPUT
        </text>

        {/* Output elements */}
        {result.map((val, i) => {
          const sourceIndex = permutation[i];
          const colorIdx = sourceIndex % ELEMENT_COLORS.length;
          return (
            <g key={`output-${i}`}>
              <rect
                x={centerX(i) - elementWidth / 2}
                y={bottomY}
                width={elementWidth}
                height={elementHeight}
                fill={`url(#vt-grad-${colorIdx})`}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1"
                rx="8"
                filter="url(#vt-glow)"
                opacity="0.95"
              />
              <text
                x={centerX(i)}
                y={bottomY + elementHeight / 2 + 6}
                textAnchor="middle"
                fontSize="17"
                fontWeight="700"
                fill="white"
                fontFamily="Inter, sans-serif"
              >
                {typeof val === 'number' ? Math.round(val) : val}
              </text>
              <text
                x={centerX(i)}
                y={bottomY + elementHeight + 18}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                letterSpacing="1"
                fill="#64748b"
                fontFamily="Inter, sans-serif"
              >
                POS {i}
              </text>
            </g>
          );
        })}
      </svg>

      <div style={{
        fontSize: '0.78rem',
        color: '#94a3b8',
        marginTop: '0.7rem',
        lineHeight: 1.5,
      }}>
        <strong style={{ color: '#f1f5f9' }}>How it works:</strong>{' '}
        Each colored block tracks one element of the input vector as it moves to its new position in the output. Matching colors = same element.
      </div>
    </div>
  );
}
