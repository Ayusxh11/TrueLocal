import { Card, Motion } from './UI'

export function LocationCard({ location, onClick, index }) {
  return (
    <Motion delay={index * 50}>
      <Card onClick={onClick} style={{ height: '100%' }}>
        <div
          style={{
            background: `linear-gradient(135deg, ${location.color}22, ${location.color}11)`,
            padding: 24,
            borderBottom: `2px solid ${location.color}44`
          }}
        >
          <div
            style={{
              fontSize: 48,
              marginBottom: 12,
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))'
            }}
          >
            {location.emoji}
          </div>
          <h3
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 700,
              color: '#fff',
              marginBottom: 4
            }}
          >
            {location.name}
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: '#9CA3AF',
              fontWeight: 500
            }}
          >
            {location.tagline}
          </p>
        </div>
        <div style={{ padding: 20, textAlign: 'center' }}>
          <span
            style={{
              color: location.color,
              fontSize: 14,
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            Explore <span style={{ fontSize: 12 }}>→</span>
          </span>
        </div>
      </Card>
    </Motion>
  )
}
