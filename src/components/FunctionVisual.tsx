import React from 'react';
import type { ExpressionFunction } from '../types';

const paths: Record<ExpressionFunction['visualType'], string> = {
  time: 'M16 72 C45 72 45 24 74 24 S103 72 132 72 S161 24 190 24',
  vector: 'M22 76 L176 28 M176 28 L151 30 M176 28 L166 50',
  random: 'M14 64 L34 42 L52 70 L74 27 L94 57 L116 18 L138 72 L160 39 L190 58',
  curve: 'M14 76 C26 76 39 75 51 69 C85 53 107 23 143 19 C159 17 175 18 190 18',
  color: 'M14 74 C48 18 74 18 105 74 C136 18 160 18 190 74',
  space: 'M24 68 L100 18 L182 62 M100 18 L100 82 M24 68 L100 82 L182 62',
  camera: 'M22 72 L62 30 L135 30 L184 72 M52 72 L101 45 L154 72',
  property: 'M18 66 L52 66 L52 31 L94 31 L94 53 L136 53 L136 20 L188 20',
  data: 'M18 68 L18 28 L188 28 M42 28 L42 68 M86 28 L86 68 M139 28 L139 68',
};

export const FunctionVisual: React.FC<{ fn: ExpressionFunction }> = ({ fn }) => (
  <figure className={`reference-visual visual-${fn.visualType}`} aria-label={`${fn.name} 作用示意图`}>
    <svg viewBox="0 0 204 92" role="img">
      <defs>
        <linearGradient id={`gradient-${fn.id}`} x1="0" x2="1">
          <stop stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <path className="visual-grid" d="M14 18H190M14 46H190M14 74H190M42 10V82M102 10V82M162 10V82" />
      <path className="visual-main" d={paths[fn.visualType]} stroke={`url(#gradient-${fn.id})`} />
      <circle className="visual-dot" cx="14" cy={fn.visualType === 'time' ? 72 : 68} r="4" />
    </svg>
    <figcaption><span>作用示意</span>{fn.category} · {fn.name}</figcaption>
  </figure>
);
