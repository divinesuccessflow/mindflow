import dynamic from 'next/dynamic';

function LoadingScreen() {
  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        background: '#0a0c14',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        gap: '24px',
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 22,
            fontWeight: 900,
            boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
          }}
        >
          M
        </div>
        <span
          style={{
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          MindFlow
        </span>
      </div>

      {/* Spinner */}
      <div
        style={{
          width: 36,
          height: 36,
          border: '3px solid rgba(99,102,241,0.2)',
          borderTopColor: '#6366f1',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />

      {/* Status text */}
      <p
        style={{
          color: 'rgba(107,114,128,0.8)',
          fontSize: 13,
          margin: 0,
          letterSpacing: '0.02em',
        }}
      >
        Loading your workspace…
      </p>

      {/* Inline keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const MindFlowApp = dynamic(() => import('@/components/MindFlowApp'), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

export default function Home() {
  return <MindFlowApp />;
}
