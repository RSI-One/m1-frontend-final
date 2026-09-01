'use client';

import type { CSSProperties, MouseEventHandler } from 'react';

type StatCardProps = {
  num: number | string;
  lbl: string;
  delta: string;
  down?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
  style?: CSSProperties;
};

export default function StatCard({ num, lbl, delta, down, onClick, style }: StatCardProps) {
  return (
    <div
      className="stat-card"
      style={onClick ? { cursor: 'pointer', ...style } : style}
      onClick={onClick}
    >
      <div className="num">{num}</div>
      <div className="lbl">{lbl}</div>
      <div className={`delta${down ? ' down' : ''}`}>{delta}</div>
    </div>
  );
}
