-- Create TrueLocal Database Schema
--
-- 1. New Tables
--    - locations: Bangalore neighborhoods and attractions
--    - vendors: Local businesses and experience providers
--    - listings: Bookable experiences, tours, and events
--    - bookings: User booking records
--
-- 2. Security
--    - Enable RLS on all tables
--    - Public read access for locations, vendors, listings
--    - Authenticated user access for bookings

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id text PRIMARY KEY,
  name text NOT NULL,
  emoji text NOT NULL,
  tagline text NOT NULL,
  color text NOT NULL,
  bg text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id text PRIMARY KEY,
  location_id text NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL,
  rating decimal(2,1) NOT NULL DEFAULT 0,
  reviews integer NOT NULL DEFAULT 0,
  verified boolean DEFAULT false,
  image text NOT NULL,
  bio text NOT NULL,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
  id text PRIMARY KEY,
  vendor_id text NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  location_id text NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL,
  price integer NOT NULL,
  student_price integer NOT NULL,
  duration text NOT NULL,
  capacity integer NOT NULL,
  slots text[] DEFAULT '{}',
  add_ons jsonb DEFAULT '[]'::jsonb,
  description text NOT NULL,
  tags text[] DEFAULT '{}',
  cancellation text NOT NULL,
  entry_fee integer DEFAULT 0,
  min_age integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id text NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  booking_date date NOT NULL,
  time_slot text NOT NULL,
  guests integer NOT NULL DEFAULT 1,
  is_student boolean DEFAULT false,
  add_ons jsonb DEFAULT '[]'::jsonb,
  total_price integer NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policies for locations (public read)
CREATE POLICY "Public can view locations"
  ON locations FOR SELECT
  TO public
  USING (true);

-- Policies for vendors (public read)
CREATE POLICY "Public can view vendors"
  ON vendors FOR SELECT
  TO public
  USING (true);

-- Policies for listings (public read)
CREATE POLICY "Public can view listings"
  ON listings FOR SELECT
  TO public
  USING (true);

-- Policies for bookings (users can view their own bookings)
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vendors_location ON vendors(location_id);
CREATE INDEX IF NOT EXISTS idx_listings_vendor ON listings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings(location_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_listing ON bookings(listing_id);
