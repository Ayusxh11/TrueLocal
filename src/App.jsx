import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { LocationCard } from './components/LocationCard'
import { Motion, Btn, Badge, Stars, VerifiedBadge, Card, Modal, Input } from './components/UI'

const fmt = (n) => `₹${n.toLocaleString('en-IN')}`

function App() {
  const [view, setView] = useState('home')
  const [locations, setLocations] = useState([])
  const [vendors, setVendors] = useState([])
  const [listings, setListings] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [selectedListing, setSelectedListing] = useState(null)
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [locData, vendData, listData] = await Promise.all([
        supabase.from('locations').select('*'),
        supabase.from('vendors').select('*'),
        supabase.from('listings').select('*')
      ])

      if (locData.data) setLocations(locData.data)
      if (vendData.data) setVendors(vendData.data)
      if (listData.data) setListings(listData.data)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (listing, slot, guests, isStudent, selectedAddOns) => {
    const price = isStudent ? listing.student_price : listing.price
    const addOnsTotal = selectedAddOns.reduce((sum, addon) => sum + addon.price, 0)

    setCart([
      ...cart,
      {
        id: Date.now() + Math.random(),
        listing,
        slot,
        guests,
        isStudent,
        addOns: selectedAddOns,
        total: price * guests + addOnsTotal
      }
    ])
  }

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id))
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0)

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🌟</div>
          <h2 style={{ color: '#fff', fontFamily: "'Playfair Display', serif" }}>Loading experiences...</h2>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Motion>
          <div style={styles.headerContent}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 32 }}>🌟</span>
              <div>
                <h1 style={styles.logo}>TrueLocal</h1>
                <p style={styles.tagline}>Bangalore's Authentic Experiences</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {view !== 'home' && (
                <Btn variant="ghost" onClick={() => { setView('home'); setSelectedLocation(null) }}>
                  ← Back
                </Btn>
              )}
              <Btn
                variant="secondary"
                onClick={() => setShowCart(true)}
                style={{ position: 'relative' }}
              >
                🛒 Cart {cart.length > 0 && `(${cart.length})`}
                {cart.length > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      background: '#FF6B35',
                      color: '#fff',
                      borderRadius: '50%',
                      width: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 700
                    }}
                  >
                    {cart.length}
                  </span>
                )}
              </Btn>
            </div>
          </div>
        </Motion>
      </header>

      <main style={styles.main}>
        {view === 'home' && <HomeView locations={locations} onSelectLocation={(loc) => { setSelectedLocation(loc); setView('location') }} />}
        {view === 'location' && selectedLocation && (
          <LocationView
            location={selectedLocation}
            vendors={vendors.filter(v => v.location_id === selectedLocation.id)}
            listings={listings.filter(l => l.location_id === selectedLocation.id)}
            onSelectListing={(listing) => setSelectedListing(listing)}
          />
        )}
      </main>

      <Modal open={!!selectedListing} onClose={() => setSelectedListing(null)} title={selectedListing?.title}>
        {selectedListing && (
          <ListingModal
            listing={selectedListing}
            vendor={vendors.find(v => v.id === selectedListing.vendor_id)}
            onBook={(slot, guests, isStudent, addOns) => {
              addToCart(selectedListing, slot, guests, isStudent, addOns)
              setSelectedListing(null)
              setShowCart(true)
            }}
          />
        )}
      </Modal>

      <Modal open={showCart} onClose={() => setShowCart(false)} title="Your Cart">
        <CartView cart={cart} onRemove={removeFromCart} total={cartTotal} />
      </Modal>
    </div>
  )
}

function HomeView({ locations, onSelectLocation }) {
  return (
    <div style={{ padding: '40px 20px' }}>
      <Motion>
        <div style={{ textAlign: 'center', marginBottom: 60, maxWidth: 720, margin: '0 auto 60px' }}>
          <h2
            style={{
              fontSize: 48,
              fontFamily: "'Playfair Display', serif",
              color: '#fff',
              margin: '0 0 16px',
              lineHeight: 1.2
            }}
          >
            Discover Bangalore Like a Local
          </h2>
          <p style={{ fontSize: 18, color: '#9CA3AF', lineHeight: 1.6, margin: 0 }}>
            Authentic experiences, hidden gems, and local experts. Book unique tours, workshops, and adventures across
            Bangalore's most iconic neighborhoods.
          </p>
        </div>
      </Motion>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 24,
          maxWidth: 1400,
          margin: '0 auto'
        }}
      >
        {locations.map((location, index) => (
          <LocationCard
            key={location.id}
            location={location}
            onClick={() => onSelectLocation(location)}
            index={index}
          />
        ))}
      </div>
    </div>
  )
}

function LocationView({ location, vendors, listings, onSelectListing }) {
  return (
    <div style={{ padding: '40px 20px' }}>
      <Motion>
        <div
          style={{
            background: `linear-gradient(135deg, ${location.color}33, ${location.color}11)`,
            border: `1px solid ${location.color}44`,
            borderRadius: 20,
            padding: 40,
            marginBottom: 40,
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: 72, marginBottom: 16 }}>{location.emoji}</div>
          <h2
            style={{
              fontSize: 36,
              fontFamily: "'Playfair Display', serif",
              color: '#fff',
              margin: '0 0 8px'
            }}
          >
            {location.name}
          </h2>
          <p style={{ fontSize: 18, color: '#9CA3AF', margin: 0 }}>{location.tagline}</p>
        </div>
      </Motion>

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h3 style={{ color: '#fff', fontSize: 24, marginBottom: 24 }}>Available Experiences</h3>
        <div style={{ display: 'grid', gap: 24 }}>
          {listings.map((listing, index) => {
            const vendor = vendors.find(v => v.id === listing.vendor_id)
            return (
              <Motion key={listing.id} delay={index * 50}>
                <Card onClick={() => onSelectListing(listing)}>
                  <div style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 8px', fontSize: 20, color: '#fff', fontWeight: 700 }}>
                          {listing.title}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                          <span style={{ fontSize: 20 }}>{vendor?.image}</span>
                          <span style={{ color: '#9CA3AF', fontSize: 14 }}>{vendor?.name}</span>
                          {vendor?.verified && <VerifiedBadge />}
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                          {listing.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} color={location.color}>{tag}</Badge>
                          ))}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#FF6B35' }}>
                          {fmt(listing.price)}
                        </div>
                        {listing.student_price < listing.price && (
                          <div style={{ fontSize: 12, color: '#00C9A7' }}>
                            Student: {fmt(listing.student_price)}
                          </div>
                        )}
                      </div>
                    </div>
                    <p style={{ color: '#9CA3AF', fontSize: 14, lineHeight: 1.6, margin: '0 0 16px' }}>
                      {listing.description}
                    </p>
                    <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#9CA3AF' }}>
                      <span>⏱️ {listing.duration}</span>
                      <span>👥 Max {listing.capacity} guests</span>
                      <span>🎟️ {listing.type}</span>
                    </div>
                  </div>
                </Card>
              </Motion>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ListingModal({ listing, vendor, onBook }) {
  const [selectedSlot, setSelectedSlot] = useState('')
  const [guests, setGuests] = useState(1)
  const [isStudent, setIsStudent] = useState(false)
  const [selectedAddOns, setSelectedAddOns] = useState([])

  const addOns = listing.add_ons || []
  const price = isStudent ? listing.student_price : listing.price
  const addOnsTotal = selectedAddOns.reduce((sum, addon) => sum + addon.price, 0)
  const total = price * guests + addOnsTotal

  const toggleAddOn = (addon) => {
    if (selectedAddOns.find(a => a.name === addon.name)) {
      setSelectedAddOns(selectedAddOns.filter(a => a.name !== addon.name))
    } else {
      setSelectedAddOns([...selectedAddOns, addon])
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <span style={{ fontSize: 32 }}>{vendor?.image}</span>
          <div>
            <div style={{ color: '#fff', fontWeight: 600 }}>{vendor?.name}</div>
            <Stars rating={vendor?.rating || 0} />
          </div>
        </div>
        <p style={{ color: '#9CA3AF', fontSize: 14, lineHeight: 1.6 }}>{listing.description}</p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', color: '#9CA3AF', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
          SELECT TIME SLOT
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
          {listing.slots.map(slot => (
            <button
              key={slot}
              onClick={() => setSelectedSlot(slot)}
              style={{
                padding: '10px',
                borderRadius: 8,
                border: selectedSlot === slot ? '2px solid #FF6B35' : '1px solid rgba(255,255,255,0.2)',
                background: selectedSlot === slot ? 'rgba(255,107,53,0.2)' : 'rgba(255,255,255,0.05)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600
              }}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <Input
          label="Guests"
          type="number"
          value={guests}
          onChange={(v) => setGuests(Math.max(1, Math.min(listing.capacity, parseInt(v) || 1)))}
        />
        <div>
          <label style={{ display: 'block', color: '#9CA3AF', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
            STUDENT DISCOUNT
          </label>
          <button
            onClick={() => setIsStudent(!isStudent)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 10,
              border: isStudent ? '2px solid #00C9A7' : '1px solid rgba(255,255,255,0.2)',
              background: isStudent ? 'rgba(0,201,167,0.2)' : 'rgba(255,255,255,0.05)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600
            }}
          >
            {isStudent ? '✓ Student' : 'Regular'}
          </button>
        </div>
      </div>

      {addOns.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', color: '#9CA3AF', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
            ADD-ONS
          </label>
          {addOns.map(addon => (
            <button
              key={addon.name}
              onClick={() => toggleAddOn(addon)}
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: 8,
                borderRadius: 10,
                border: selectedAddOns.find(a => a.name === addon.name) ? '2px solid #FF6B35' : '1px solid rgba(255,255,255,0.2)',
                background: selectedAddOns.find(a => a.name === addon.name) ? 'rgba(255,107,53,0.1)' : 'rgba(255,255,255,0.05)',
                color: '#fff',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>{addon.name}</span>
              <span style={{ fontWeight: 700 }}>{addon.price > 0 ? fmt(addon.price) : 'Free'}</span>
            </button>
          ))}
        </div>
      )}

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ color: '#9CA3AF' }}>Base Price × {guests}</span>
          <span style={{ color: '#fff' }}>{fmt(price * guests)}</span>
        </div>
        {addOnsTotal > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: '#9CA3AF' }}>Add-ons</span>
            <span style={{ color: '#fff' }}>{fmt(addOnsTotal)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 700 }}>
          <span style={{ color: '#fff' }}>Total</span>
          <span style={{ color: '#FF6B35' }}>{fmt(total)}</span>
        </div>
      </div>

      <Btn
        variant="primary"
        size="lg"
        onClick={() => onBook(selectedSlot, guests, isStudent, selectedAddOns)}
        disabled={!selectedSlot}
        style={{ width: '100%' }}
      >
        Add to Cart
      </Btn>

      <p style={{ color: '#6B7280', fontSize: 11, textAlign: 'center', marginTop: 12 }}>
        {listing.cancellation}
      </p>
    </div>
  )
}

function CartView({ cart, onRemove, total }) {
  if (cart.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
        <p style={{ color: '#9CA3AF' }}>Your cart is empty</p>
      </div>
    )
  }

  return (
    <div>
      {cart.map(item => (
        <div
          key={item.id}
          style={{
            padding: 16,
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 12,
            marginBottom: 12,
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>{item.listing.title}</div>
              <div style={{ color: '#9CA3AF', fontSize: 13 }}>
                {item.slot} • {item.guests} {item.guests > 1 ? 'guests' : 'guest'}
                {item.isStudent && ' • Student rate'}
              </div>
              {item.addOns.length > 0 && (
                <div style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>
                  + {item.addOns.map(a => a.name).join(', ')}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#FF6B35', fontWeight: 700, marginBottom: 8 }}>{fmt(item.total)}</div>
              <button
                onClick={() => onRemove(item.id)}
                style={{
                  background: 'rgba(239,68,68,0.2)',
                  border: '1px solid rgba(239,68,68,0.4)',
                  color: '#EF4444',
                  padding: '4px 8px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 11
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ))}

      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: 20,
          marginTop: 20
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 24, fontWeight: 700, marginBottom: 20 }}>
          <span style={{ color: '#fff' }}>Total</span>
          <span style={{ color: '#FF6B35' }}>{fmt(total)}</span>
        </div>
        <Btn variant="teal" size="lg" style={{ width: '100%' }}>
          Proceed to Checkout
        </Btn>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0F0320 0%, #1A0A2E 50%, #0F0320 100%)',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  },
  header: {
    background: 'rgba(26, 10, 46, 0.8)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  headerContent: {
    maxWidth: 1400,
    margin: '0 auto',
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logo: {
    margin: 0,
    fontSize: 24,
    fontWeight: 800,
    background: 'linear-gradient(135deg, #FF6B35, #FFD700)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.02em'
  },
  tagline: {
    margin: 0,
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: 500
  },
  main: {
    minHeight: 'calc(100vh - 80px)'
  }
}

export default App
