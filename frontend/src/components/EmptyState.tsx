interface EmptyStateProps {
  message: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-12) var(--space-6)',
        gap: 'var(--space-4)',
        color: 'var(--muted)',
      }}
    >
      <p style={{ fontSize: 'var(--text-lg)', textAlign: 'center' }}>{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          style={{
            padding: 'var(--space-2) var(--space-6)',
            background: 'var(--accent)',
            color: 'var(--accent-on)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
