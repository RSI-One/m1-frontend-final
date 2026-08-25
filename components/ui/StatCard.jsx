'use client';

export default function StatCard({ num, lbl, delta, down, onClick, style }) {
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