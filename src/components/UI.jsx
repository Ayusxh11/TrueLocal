import { useState, useEffect } from 'react'

export function Motion({ children, show = true, delay = 0, style = {} }) {
  const [vis, setVis] = useState(!show)

  useEffect(() => {
    if (show) {
      const t = setTimeout(() => setVis(true), delay)
      return () => clearTimeout(t)
    }
  }, [show, delay])

  return (
    <div
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 320ms cubic-bezier(.22,1,.36,1) ${delay}ms, transform 320ms cubic-bezier(.22,1,.36,1) ${delay}ms`,
        ...style
      }}
    >
      {children}
    </div>
  )
}

export function Stars({ rating }) {
  return (
    <span style={{ color: '#FFD700', fontSize: 13 }}>
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
      <span style={{ color: '#9CA3AF', marginLeft: 4, fontSize: 12 }}>{rating}</span>
    </span>
  )
}

export function Badge({ children, color = '#FF6B35' }) {
  return (
    <span
      style={{
        background: color + '22',
        color,
        border: `1px solid ${color}44`,
        padding: '2px 8px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        display: 'inline-block'
      }}
    >
      {children}
    </span>
  )
}

export function VerifiedBadge() {
  return (
    <span
      style={{
        background: '#00C9A722',
        color: '#00C9A7',
        border: '1px solid #00C9A744',
        padding: '2px 8px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4
      }}
    >
      ✓ Verified
    </span>
  )
}

export function Card({ children, onClick, hover = true, style = {} }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 240ms cubic-bezier(.22,1,.36,1)',
        transform: hover && hovered ? 'translateY(-4px) scale(1.01)' : 'none',
        boxShadow: hover && hovered
          ? '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,107,53,0.3)'
          : '0 4px 20px rgba(0,0,0,0.2)',
        ...style
      }}
    >
      {children}
    </div>
  )
}

export function Btn({ children, onClick, variant = 'primary', size = 'md', disabled = false, style = {} }) {
  const [pressed, setPressed] = useState(false)

  const styles = {
    primary: { background: 'linear-gradient(135deg, #FF6B35, #FF8C5A)', color: '#fff', border: 'none' },
    secondary: { background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' },
    teal: { background: 'linear-gradient(135deg, #00C9A7, #00B894)', color: '#fff', border: 'none' },
    ghost: { background: 'transparent', color: '#FF6B35', border: '1px solid #FF6B3544' },
    danger: { background: 'linear-gradient(135deg, #EF4444, #DC2626)', color: '#fff', border: 'none' },
  }

  const sizes = {
    sm: { padding: '6px 14px', fontSize: 12 },
    md: { padding: '10px 22px', fontSize: 14 },
    lg: { padding: '14px 32px', fontSize: 16 }
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        ...styles[variant],
        ...sizes[size],
        borderRadius: 10,
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transform: pressed ? 'scale(0.96)' : 'scale(1)',
        transition: 'all 150ms cubic-bezier(.22,1,.36,1)',
        fontFamily: 'inherit',
        ...style
      }}
    >
      {children}
    </button>
  )
}

export function Input({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label
          style={{
            display: 'block',
            color: '#9CA3AF',
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 6,
            letterSpacing: '0.05em'
          }}
        >
          {label.toUpperCase()}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px 14px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 10,
          color: '#fff',
          fontSize: 14,
          fontFamily: 'inherit',
          outline: 'none',
          boxSizing: 'border-box'
        }}
      />
    </div>
  )
}

export function Modal({ open, onClose, children, title }) {
  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backdropFilter: 'blur(8px)'
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <Motion show={open}>
        <div
          style={{
            background: '#1A0A2E',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 20,
            maxWidth: 560,
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: 28
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontFamily: "'Playfair Display', serif", color: '#fff' }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                color: '#fff',
                width: 32,
                height: 32,
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: 16
              }}
            >
              ✕
            </button>
          </div>
          {children}
        </div>
      </Motion>
    </div>
  )
}
