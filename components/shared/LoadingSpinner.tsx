import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = 'Loading PhD Tracker data...' }: LoadingSpinnerProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '80vh',
      width: '100%',
      animation: 'fadeIn 0.5s ease',
    }}>
      {/* Outer spinning ring */}
      <div style={{
        position: 'relative',
        width: '64px',
        height: '64px',
        marginBottom: '20px',
      }}>
        {/* Glow effect */}
        <div style={{
          position: 'absolute',
          inset: '-8px',
          background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
          borderRadius: '50%',
          opacity: 0.25,
          filter: 'blur(10px)',
          animation: 'pulseGlow 2s infinite ease-in-out',
        }} />
        
        {/* Spinning gradient ring */}
        <div style={{
          boxSizing: 'border-box',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          border: '4px solid transparent',
          background: 'linear-gradient(var(--bg-primary), var(--bg-primary)) padding-box, linear-gradient(135deg, #7c3aed, #06b6d4) border-box',
          animation: 'spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite',
        }} />
      </div>
      
      {/* Sleek loading text */}
      <p style={{
        fontSize: '14px',
        fontWeight: '500',
        background: 'linear-gradient(135deg, #a78bfa, #22d3ee)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        letterSpacing: '0.05em',
        animation: 'pulseText 1.5s infinite ease-in-out',
      }}>
        {message}
      </p>

      {/* Embedded Animations CSS */}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.2; transform: scale(0.95); }
          50% { opacity: 0.4; transform: scale(1.05); }
        }
        @keyframes pulseText {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
