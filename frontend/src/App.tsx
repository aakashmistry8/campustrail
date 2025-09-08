import React, { useState, useMemo, useEffect } from 'react';
import { AuthForm } from './components/AuthForm';
import { ProductList } from './components/ProductList';
import { Product } from './types/Product';
import { Navbar } from './components/Navbar'; // kept for LayoutShell composition
import { LayoutShell } from './components/LayoutShell';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/Card';
import CitySelector from './components/CitySelector';
import ItineraryCard from './components/ItineraryCard';
import CompanionCard from './components/CompanionCard';
import GearManager from './components/GearManager';
import ReviewPanel from './components/ReviewPanel';
import { ProductDetailPage } from './components/ProductDetailPage';
import ItineraryDetailPage from './components/ItineraryDetailPage';
import CompanionDetailPage from './components/CompanionDetailPage';
import LoginPage from './components/LoginPage';
import UserProfile from './components/UserProfile';
import Checkout from './components/Checkout';
import productDetailsData from './data/productDetails';

interface SessionUser { email: string; name?: string }

// Removed duplicate App component to avoid merged declaration error.


export default function App() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [view, setView] = useState<'home' | 'products' | 'gear' | 'itineraries' | 'companions' | 'cart' | 'checkout' | 'auth' | 'login' | 'profile' | 'manage-gear' | 'reviews' | 'manage-itineraries' | 'manage-companions' | 'product-detail' | 'itinerary-detail' | 'companion-detail'>('home');
  const [reviewContext, setReviewContext] = useState<{ itineraryId?: string; companionRequestId?: string; } | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedItinerary, setSelectedItinerary] = useState<string | null>(null);
  const [selectedCompanion, setSelectedCompanion] = useState<string | null>(null);
  const envApi = (import.meta as any).env?.VITE_API_BASE || (import.meta as any).env?.VITE_API_URL || (window as any).__API__ || 'http://localhost:4000';
  const [apiBase] = useState<string>(envApi);
  const [selectedGearId, setSelectedGearId] = useState<string | null>(null);
  const [cart, setCart] = useState<Record<string, { product: Product; qty: number }>>({});
  const [dark, setDark] = useState(false);

  useEffect(()=>{
    const root = document.documentElement;
    if (dark) root.classList.add('dark'); else root.classList.remove('dark');
  },[dark]);

  const sampleProducts: Product[] = useMemo(() => {
    const baseProducts = [
      { id: 'p1', name: '65L Trekking Backpack', description: 'Ergonomic frame • Weather resistant • 1.2kg', price: 2499, stock: 5, category: 'Backpacks', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=220&fit=crop', deposit: 800, owner: 'Ankit' },
      { id: 'p2', name: '2-Person Dome Tent', description: 'Aluminum poles • 3-season • Ultra compact', price: 4599, stock: 2, category: 'Tents', image: 'https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=400&h=220&fit=crop', deposit: 1200, owner: 'Meera' },
      { id: 'p3', name: 'Sleeping Bag -5°C', description: 'Mummy shape • Draft collar • 1.1kg fill', price: 1899, stock: 0, category: 'Sleeping', image: 'https://images.unsplash.com/photo-1471115853179-bb1d604434e0?w=400&h=220&fit=crop', deposit: 600, owner: 'Ravi' },
      { id: 'p4', name: 'Portable Gas Stove', description: 'Fast boil • Piezo ignition • Stable base', price: 1299, stock: 7, category: 'Cooking', image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=400&h=220&fit=crop', deposit: 400, owner: 'Priya' },
      { id: 'p5', name: 'Carbon Trekking Poles', description: 'Shock absorption • Quick-lock • 240g', price: 1599, stock: 4, category: 'Accessories', image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=220&fit=crop', deposit: 500, owner: 'Nikhil' },
      { id: 'p6', name: '30L Daypack', description: 'Urban/outdoor hybrid • Laptop sleeve', price: 1699, stock: 8, category: 'Backpacks', image: 'https://images.unsplash.com/photo-1622260614153-03223fb72052?w=400&h=220&fit=crop', deposit: 550, owner: 'Kavya' },
      { id: 'p7', name: 'Titanium Cook Set', description: 'Ultra-light pot & pan duo', price: 2199, stock: 6, category: 'Cooking', image: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=400&h=220&fit=crop', deposit: 700, owner: 'Arjun' },
      { id: 'p8', name: 'Trail Running Vest 12L', description: 'Hydration compatible • Vent mesh', price: 2099, stock: 3, category: 'Vests', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=220&fit=crop', deposit: 650, owner: 'Zara' },
      { id: 'p9', name: 'LED Headlamp 400lm', description: 'Rechargeable • IPX5 • Multiple modes', price: 899, stock: 15, category: 'Lighting', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=220&fit=crop', deposit: 250, owner: 'Sonia' },
      { id: 'p10', name: 'Water Filter Straw', description: '0.1 micron hollow fiber filter', price: 699, stock: 20, category: 'Hydration', image: 'https://images.unsplash.com/photo-1581349485608-9469926a8e5e?w=400&h=220&fit=crop', deposit: 200, owner: 'Vivek' },
      { id: 'p11', name: 'Insulated Sleeping Pad', description: 'R-value 4.2 • Compact fold', price: 2399, stock: 5, category: 'Sleeping', image: 'https://images.unsplash.com/photo-1445308394109-4ec2920981b1?w=400&h=220&fit=crop', deposit: 750, owner: 'Divya' },
      { id: 'p12', name: 'Hammock Single', description: 'Ripstop nylon • 300kg capacity', price: 1199, stock: 11, category: 'Relax', image: 'https://images.unsplash.com/photo-1573160813859-3f80f4379fb8?w=400&h=220&fit=crop', deposit: 350, owner: 'Sara' },
      { id: 'p13', name: 'Quick-Dry Towel L', description: 'Antimicrobial • Fast drying', price: 499, stock: 25, category: 'Accessories', image: 'https://images.unsplash.com/photo-1564053889584-ef73784c3db7?w=400&h=220&fit=crop', deposit: 120, owner: 'Neha' },
      { id: 'p14', name: 'Compact Multi-tool', description: '14 functions • Stainless', price: 1299, stock: 9, category: 'Tools', image: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=400&h=220&fit=crop', deposit: 400, owner: 'Rahul' },
      { id: 'p15', name: 'GPS Watch', description: 'Route tracking • HR monitor', price: 5999, stock: 2, category: 'Electronics', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=220&fit=crop', deposit: 1800, owner: 'Aisha' },
      { id: 'p16', name: 'Power Bank 20k mAh', description: 'Dual USB • Fast charge', price: 1599, stock: 14, category: 'Electronics', image: 'https://images.unsplash.com/photo-1609592192972-8ba4b6f07b5e?w=400&h=220&fit=crop', deposit: 500, owner: 'Pranav' },
      { id: 'p17', name: 'Ultra-light Chair', description: 'Foldable frame • 900g', price: 1899, stock: 6, category: 'Camp', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=220&fit=crop', deposit: 650, owner: 'Farah' },
      { id: 'p18', name: 'Rain Jacket', description: '2.5 layer • Seam sealed', price: 2799, stock: 7, category: 'Apparel', image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=400&h=220&fit=crop', deposit: 900, owner: 'Maya' },
      { id: 'p19', name: 'Merino Base Layer', description: 'Odor resistant • Breathable', price: 1599, stock: 10, category: 'Apparel', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=220&fit=crop', deposit: 500, owner: 'Nikhil' },
      { id: 'p20', name: 'Dry Sack 10L', description: 'Roll-top • Waterproof', price: 599, stock: 18, category: 'Waterproof', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=220&fit=crop', deposit: 180, owner: 'Karan' },
      { id: 'p21', name: 'Cooking Fuel Canister', description: 'Iso-butane mix • 230g', price: 349, stock: 30, category: 'Cooking', image: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=400&h=220&fit=crop', deposit: 90, owner: 'Pooja' }
    ];

    // Add review data to products
    return baseProducts.map(product => {
      const details = productDetailsData[product.id];
      return {
        ...product,
        avgRating: details?.avgRating || (3.5 + Math.random() * 1.5),
        reviewCount: details?.reviewCount || Math.floor(Math.random() * 10) + 1
      };
    });
  }, []);

  interface LiteItinerary { id: string; title: string; dates: string; creator: string; stops: string[]; notes: string; seats: number; }
  const itineraries: LiteItinerary[] = useMemo(() => ([
    { id: 'it1', title: 'Kedarkantha Weekend', dates: 'Oct 18–20', creator: 'Vikram', stops: ['Dehradun','Sankri','Juda Talab','Summit'], notes: 'Budget ~₹6k, rental gear welcome.', seats: 3 },
    { id: 'it2', title: 'Pondicherry Ride', dates: 'Nov 1–3', creator: 'Sara', stops: ['Chennai','Auroville','Promenade'], notes: 'Scooter rentals, beach hostel.', seats: 2 },
    { id: 'it3', title: 'Spiti Roadtrip', dates: 'Jun 10–18', creator: 'Aisha', stops: ['Manali','Kaza','Chandratal'], notes: 'High altitude caution.', seats: 4 },
    { id: 'it4', title: 'Goa New Year', dates: 'Dec 28–Jan 2', creator: 'Neha', stops: ['Baga','Anjuna','Old Goa'], notes: 'Beach hostel planned.', seats: 5 },
    { id: 'it5', title: 'Hampi Exploration', dates: 'Oct 25–27', creator: 'Arjun', stops: ['Virupaksha','Hemakuta','Matanga'], notes: 'Focus on ruins & sunrise.', seats: 2 },
    { id: 'it6', title: 'Sikkim Loop', dates: 'Mar 12–19', creator: 'Maya', stops: ['Gangtok','Lachen','Gurudongmar'], notes: 'Need permits early.', seats: 3 },
    { id: 'it7', title: 'Valley of Flowers', dates: 'Aug 5–9', creator: 'Ravi', stops: ['Govindghat','Ghangaria','VoF','Hemkund'], notes: 'Monsoon gear required.', seats: 2 },
    { id: 'it8', title: 'Andaman Dive Trip', dates: 'Feb 14–20', creator: 'Karan', stops: ['Port Blair','Havelock','Neil'], notes: 'PADI fun dives planned.', seats: 3 },
    { id: 'it9', title: 'Leh Ladakh Circuit', dates: 'Jul 1–10', creator: 'Rahul', stops: ['Leh','Nubra','Pangong'], notes: 'Acclimatization days included.', seats: 5 },
    { id: 'it10', title: 'Rann of Kutch', dates: 'Jan 8–12', creator: 'Pooja', stops: ['Bhuj','White Rann','Kala Dungar'], notes: 'Cultural photography.', seats: 3 },
    { id: 'it11', title: 'Coorg Coffee Trails', dates: 'Nov 11–14', creator: 'Ishan', stops: ['Madikeri','Abbey Falls'], notes: 'Plantation stay target.', seats: 4 },
    { id: 'it12', title: 'Kasol Chill Hike', dates: 'Apr 6–9', creator: 'Divya', stops: ['Kasol','Chalal','Tosh'], notes: 'Relax + short hikes.', seats: 6 },
    { id: 'it13', title: 'Jaisalmer Desert Camp', dates: 'Dec 10–13', creator: 'Farah', stops: ['Fort','Sam Dunes'], notes: 'Camel safari + stargaze.', seats: 4 },
    { id: 'it14', title: 'Meghalaya Waterfalls', dates: 'Sep 3–8', creator: 'Zara', stops: ['Shillong','Cherrapunji','Living Roots'], notes: 'Rain gear essential.', seats: 3 },
    { id: 'it15', title: 'Kodaikanal Cycling', dates: 'Jun 22–25', creator: 'Pranav', stops: ['Lake','Pillar Rocks'], notes: 'Bring warm layers.', seats: 2 },
    { id: 'it16', title: 'Kerala Backwaters', dates: 'Feb 2–6', creator: 'Anjali', stops: ['Alleppey','Kumarakom'], notes: 'Houseboat night planned.', seats: 3 },
    { id: 'it17', title: 'Munnar Trails', dates: 'Jan 15–18', creator: 'Sonia', stops: ['Tea Gardens','Top Station'], notes: 'Mild trek focus.', seats: 5 },
    { id: 'it18', title: 'Gokarna Beaches', dates: 'Oct 2–5', creator: 'Vivek', stops: ['Om Beach','Half Moon','Paradise'], notes: 'Beach hopping trek.', seats: 4 },
    { id: 'it19', title: 'Araku Valley Escape', dates: 'Aug 16–19', creator: 'Nikhil', stops: ['Borra Caves','Coffee Museum'], notes: 'Train scenic route.', seats: 3 },
    { id: 'it20', title: 'Rishikesh Rafting', dates: 'Mar 4–6', creator: 'Kavya', stops: ['Shivpuri','Beatles Ashram'], notes: 'Raft + yoga mornings.', seats: 6 }
  ]), []);

  interface CompanionProfile { id: string; name: string; trip: string; dates: string; prefs: string[]; seats: number; }
  const companions: CompanionProfile[] = useMemo(() => ([
    { id: 'c1', name: 'Maya', trip: 'Spiti Circuit', dates: 'Nov 6–14', prefs: ['Budget','Backpacking','Photography'], seats: 2 },
    { id: 'c2', name: 'Arjun', trip: 'Hampi Weekend', dates: 'Oct 25–27', prefs: ['History','Hostels','Sunrise'], seats: 3 },
    { id: 'c3', name: 'Sara', trip: 'Goa NYE', dates: 'Dec 28–Jan 2', prefs: ['Beach','Budget','Nightlife'], seats: 2 },
    { id: 'c4', name: 'Rahul', trip: 'Leh Circuit', dates: 'Jul 1–10', prefs: ['Adventure','Photography','Slow'], seats: 4 },
    { id: 'c5', name: 'Aisha', trip: 'Sikkim Loop', dates: 'Mar 12–19', prefs: ['Culture','Scenic','Budget'], seats: 2 },
    { id: 'c6', name: 'Neha', trip: 'Valley of Flowers', dates: 'Aug 5–9', prefs: ['Trekking','Flora','Photography'], seats: 3 },
    { id: 'c7', name: 'Ishan', trip: 'Kasol Chill', dates: 'Apr 6–9', prefs: ['Chill','Cafe','Short hikes'], seats: 4 },
    { id: 'c8', name: 'Karan', trip: 'Andaman Dive', dates: 'Feb 14–20', prefs: ['Diving','Marine','Hostel'], seats: 3 },
    { id: 'c9', name: 'Zara', trip: 'Meghalaya Falls', dates: 'Sep 3–8', prefs: ['Rain','Waterfalls','Trek'], seats: 2 },
    { id: 'c10', name: 'Vivek', trip: 'Gokarna Trek', dates: 'Oct 2–5', prefs: ['Beach','Trek','Budget'], seats: 3 },
    { id: 'c11', name: 'Sonia', trip: 'Munnar Relax', dates: 'Jan 15–18', prefs: ['Tea','Mild trek','Scenic'], seats: 2 },
    { id: 'c12', name: 'Pranav', trip: 'Kodaikanal Ride', dates: 'Jun 22–25', prefs: ['Cycling','Budget','Viewpoints'], seats: 2 },
    { id: 'c13', name: 'Anjali', trip: 'Kerala Backwaters', dates: 'Feb 2–6', prefs: ['Houseboat','Cuisine','Relax'], seats: 3 },
    { id: 'c14', name: 'Farah', trip: 'Desert Camp', dates: 'Dec 10–13', prefs: ['Culture','Stargaze','Camel'], seats: 4 },
    { id: 'c15', name: 'Ravi', trip: 'Himalaya Prep', dates: 'May 3–7', prefs: ['Acclimatize','Trek','Gear'], seats: 5 },
    { id: 'c16', name: 'Nikhil', trip: 'Araku Scenic', dates: 'Aug 16–19', prefs: ['Train','Coffee','Budget'], seats: 2 },
    { id: 'c17', name: 'Kavya', trip: 'Rishikesh Yoga', dates: 'Mar 4–6', prefs: ['Yoga','Rafting','Veg'], seats: 3 },
    { id: 'c18', name: 'Divya', trip: 'Coorg Retreat', dates: 'Nov 11–14', prefs: ['Plantation','Coffee','Relax'], seats: 2 },
    { id: 'c19', name: 'Pooja', trip: 'Rann Culture', dates: 'Jan 8–12', prefs: ['Culture','Photography','Folk'], seats: 3 },
    { id: 'c20', name: 'Rahim', trip: 'City Heritage', dates: 'May 10–13', prefs: ['Museums','History','Walks'], seats: 4 }
  ]), []);

  // Cart helpers
  const cartItems = Object.values(cart);
  const cartTotal = cartItems.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const addToCart = (p: Product) => setCart(c => ({ ...c, [p.id]: { product: p, qty: (c[p.id]?.qty || 0) + 1 } }));
  const addToCartWithQuantity = (p: Product, quantity: number) => setCart(c => ({ 
    ...c, 
    [p.id]: { product: p, qty: (c[p.id]?.qty || 0) + quantity } 
  }));
  const updateQty = (id: string, delta: number) => setCart(c => {
    const cur = c[id]; if (!cur) return c; const qty = cur.qty + delta; const copy = { ...c }; if (qty <= 0) { delete copy[id]; } else copy[id] = { ...cur, qty }; return copy;
  });
  const clearCart = () => setCart({});
  const startCheckout = () => { if (!user) { setView('login'); return; } setView('checkout'); };

  // Product detail handlers
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product.id);
    setView('product-detail');
  };

  const handleBackToProducts = () => {
    setSelectedProduct(null);
    setView('products');
  };

  // Itinerary detail handlers
  const handleViewItinerary = (itineraryId: string) => {
    setSelectedItinerary(itineraryId);
    setView('itinerary-detail');
  };

  const handleBackToItineraries = () => {
    setSelectedItinerary(null);
    setView('itineraries');
  };

  const handleBookItinerary = (itineraryId: string, quantity: number) => {
    if (!user) {
      setView('login');
      return;
    }
    // Book the itinerary
    console.log(`Booking ${quantity} seats for itinerary ${itineraryId}`);
  };

  // Companion detail handlers
  const handleViewCompanion = (companionId: string) => {
    setSelectedCompanion(companionId);
    setView('companion-detail');
  };

  const handleBackToCompanions = () => {
    setSelectedCompanion(null);
    setView('companions');
  };

  const handleConnectCompanion = (companionId: string) => {
    if (!user) {
      setView('login');
      return;
    }
    // Connect with the companion
    console.log(`Connecting with companion ${companionId}`);
  };

  // (Optional) filtering placeholders retained from legacy code (not fully wired to new UI yet)
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [gearQuery, setGearQuery] = useState('');
  const categories = useMemo(()=> Array.from(new Set(sampleProducts.map(p=>p.category))), [sampleProducts]);
  const filteredProducts = sampleProducts.filter(p => (!categoryFilter || p.category === categoryFilter) && (!gearQuery || p.name.toLowerCase().includes(gearQuery.toLowerCase())));
  return (
    <LayoutShell view={view} onNavigate={setView} dark={dark} toggleDark={()=>setDark(d=>!d)} user={user} onAuthClick={()=> setView('login')} onLogout={()=> { setUser(null); setToken(null); }} cartCount={cartItems.reduce((s,i)=> s + i.qty,0)}>
      {view === 'home' && (
        <div className="space-y-10">
          <div className="panel panel-hover px-10 py-16 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" style={{background:'radial-gradient(circle at 20% 25%, rgba(255,255,255,.10), transparent 60%), linear-gradient(140deg, rgba(255,255,255,.08), rgba(255,255,255,.02))'}} />
            <div className="relative z-10 max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight gradient-text">Plan trips. Share gear. Find trusted companions.</h1>
              <p className="mt-6 text-base text-soft max-w-xl">Unified campus travel hub — rentals, itineraries, matching, reputation & dispute flows rebuilt with a fresh 2025 interface.</p>
              <div className="mt-8 flex flex-wrap gap-4">
                <button onClick={() => setView('products')} className="btn-brand">Browse Gear</button>
                <button onClick={() => setView('itineraries')} className="btn-outline">Explore Itineraries</button>
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader><CardTitle>Gear Rentals</CardTitle></CardHeader>
              <CardContent>Buffered availability, deposits, disputes, reviews & owner tools in one place.</CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Itineraries & Matching</CardTitle></CardHeader>
              <CardContent>Interest & style scoring produce ranked travel companion suggestions.</CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Trust & Orders</CardTitle></CardHeader>
              <CardContent>Polymorphic reviews, dispute outcomes & saved order history build transparency.</CardContent>
            </Card>
          </div>
          <div className="pt-4">
            <CitySelector />
          </div>
        </div>
      )}
      {view === 'products' && (
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Gear Marketplace</h2>
            <p className="section-sub">Discover premium outdoor gear for your adventures</p>
          </div>
          <ProductList products={sampleProducts} onAdd={addToCart} onViewProduct={handleViewProduct} />
        </div>
      )}
      {view === 'product-detail' && selectedProduct && (
        <ProductDetailPage
          product={productDetailsData[selectedProduct] || {
            ...sampleProducts.find(p => p.id === selectedProduct)!,
            fullDescription: 'High-quality outdoor equipment designed for adventure enthusiasts.',
            specifications: { 'Material': 'Premium materials', 'Weight': 'Lightweight design' },
            tags: ['outdoor', 'adventure'],
            reviews: [],
            images: [sampleProducts.find(p => p.id === selectedProduct)?.image || '']
          }}
          onAddToCart={addToCartWithQuantity}
          onBack={handleBackToProducts}
        />
      )}
      {view === 'itineraries' && (
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Discover Amazing Itineraries</h2>
            <p className="section-sub">Find the perfect journey for your next adventure</p>
          </div>
          <div className="section-grid">
            {itineraries.map(it => (
              <div key={it.id} className="relative group">
                <ItineraryCard
                  id={it.id}
                  title={it.title}
                  owner={it.creator}
                  date={it.dates}
                  start={it.dates.split(' ')[0]}
                  end={it.dates.split(' ')[0]}
                  seats={it.seats}
                  taken={Math.max(0, Math.min(it.seats - 1, Math.floor(it.seats/2)))}
                  stops={it.stops}
                  interests={[...new Set(it.notes.toLowerCase().split(/[^a-z]+/).filter(Boolean).slice(0,5))]}
                  onViewDetails={handleViewItinerary}
                />
                <button onClick={()=> { setReviewContext({ itineraryId: it.id }); setView('reviews'); }} className="absolute top-2 right-2 text-[10px] bg-white/80 hover:bg-white rounded-full px-2 py-1 shadow border border-slate-200">Reviews</button>
              </div>
            ))}
          </div>
        </div>
      )}
      {view === 'companions' && (
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Travel Companions</h2>
            <p className="section-sub">Connect with like-minded travelers for your next adventure</p>
          </div>
          <div className="section-grid">
            {companions.map(c => (
              <div key={c.id} className="relative group">
                <CompanionCard
                  id={c.id}
                  name={c.name}
                  bio={`${c.trip} • ${c.dates}`}
                  rating={4.0 + (c.id.charCodeAt(1) % 10) / 10}
                  interests={c.prefs}
                  trips={c.seats * 2}
                  onConnect={handleViewCompanion}
                />
                <button onClick={()=> { setReviewContext({ companionRequestId: c.id }); setView('reviews'); }} className="absolute top-2 right-2 text-[10px] bg-white/80 hover:bg-white rounded-full px-2 py-1 shadow border border-slate-200">Reviews</button>
              </div>
            ))}
          </div>
        </div>
      )}
      {view === 'cart' && (
        <div className="space-y-6 max-w-xl">
          <h2 className="text-2xl font-semibold tracking-tight">Cart</h2>
          <div className="space-y-4">
            {cartItems.length === 0 && <p className="text-sm text-faint">Your cart is empty.</p>}
            {cartItems.map(i => (
              <div key={i.product.id} className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-200"><img src={i.product.image} alt="" className="w-full h-full object-cover" /></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{i.product.name}</p>
                  <p className="text-xs text-faint">₹{i.product.price} × {i.qty}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-outline px-2 py-1" onClick={()=> updateQty(i.product.id,-1)}>-</button>
                  <span className="text-sm w-5 text-center">{i.qty}</span>
                  <button className="btn-outline px-2 py-1" onClick={()=> updateQty(i.product.id,1)}>+</button>
                </div>
              </div>
            ))}
            {cartItems.length > 0 && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                <div className="flex justify-between text-sm"><span>Total</span><span className="font-semibold">₹{cartTotal}</span></div>
                <button onClick={startCheckout} className="btn-brand w-full justify-center">Checkout</button>
              </div>
            )}
          </div>
        </div>
      )}
      {view === 'checkout' && user && cartItems.length > 0 && (
        <Checkout
          cartItems={cartItems}
          cartTotal={cartTotal}
          user={user}
          onBack={() => setView('cart')}
          onOrderComplete={(orderId) => {
            console.log('Order completed:', orderId);
            setView('profile'); // Redirect to profile to see order history
          }}
          onClearCart={clearCart}
        />
      )}
      {view === 'manage-gear' && user && (
        <GearManager apiBase={apiBase} userEmail={user.email} onBack={()=> setView('home')} onSelectGear={setSelectedGearId} />
      )}
      {view === 'reviews' && (
        <ReviewPanel
          apiBase={apiBase}
          userEmail={user?.email || ''}
          itineraryId={reviewContext?.itineraryId}
          companionRequestId={reviewContext?.companionRequestId}
          onBack={()=> setView('home')}
        />
      )}
      {view === 'itinerary-detail' && selectedItinerary && (
        <ItineraryDetailPage
          itineraryId={selectedItinerary}
          onBack={handleBackToItineraries}
          onBook={handleBookItinerary}
        />
      )}
      {view === 'companion-detail' && selectedCompanion && (
        <CompanionDetailPage
          companionId={selectedCompanion}
          onBack={handleBackToCompanions}
          onConnect={handleConnectCompanion}
        />
      )}
      {view === 'auth' && (
        <div className="max-w-md mx-auto">
          <AuthForm apiBase={apiBase} mode={authMode} onAuth={(u,t)=> { setUser({ email: u.email, name: u.name }); setToken(t); setView('home'); }} switchMode={()=> setAuthMode(m=> m==='login' ? 'signup':'login')} />
        </div>
      )}
      {view === 'login' && (
        <LoginPage
          apiBase={apiBase}
          onAuth={(u, t) => {
            setUser({ email: u.email, name: u.name });
            setToken(t);
            setView('home');
          }}
          onBack={() => setView('home')}
        />
      )}
      {view === 'profile' && user && token && (
        <UserProfile
          apiBase={apiBase}
          user={user}
          token={token}
          onBack={() => setView('home')}
          onLogout={() => {
            setUser(null);
            setToken(null);
            setView('home');
          }}
        />
      )}
    </LayoutShell>
  );
}

interface ManageProps { apiBase: string; token: string | null; onBack: () => void; }

const ManageItineraries: React.FC<ManageProps> = ({ apiBase, token, onBack }) => {
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', destination: '', description: '', startDate: '', endDate: '', maxPeople: 4 });
  const [loading, setLoading] = useState(false); const [err, setErr] = useState<string | null>(null);
  const headers = () => ({ 'Content-Type': 'application/json', ...(token? { authorization: `Bearer ${token}` }: {}) });
  async function load() { if (!token) return; const r = await fetch(`${apiBase}/my/itineraries`, { headers: headers() }); const d = await r.json(); if (Array.isArray(d)) setList(d); }
  useEffect(()=>{ load(); }, [token]);
  async function create(e: React.FormEvent) { e.preventDefault(); setErr(null); setLoading(true); try { const r = await fetch(`${apiBase}/itineraries`, { method: 'POST', headers: headers(), body: JSON.stringify({ ...form, maxPeople: Number(form.maxPeople) }) }); const d = await r.json(); if (!r.ok) throw new Error(d.error||'Failed'); setForm({ title:'',destination:'',description:'',startDate:'',endDate:'',maxPeople:4 }); load(); } catch(e:any){ setErr(e.message);} finally{ setLoading(false);} }
  return <section className="section animate-fadeIn max-w-4xl">
    <div className="section-header flex items-center gap-4"><button className="btn" onClick={onBack}>Back</button><h2 className="section-title">Manage Itineraries</h2></div>
    {!token && <div className="callout mt-4">Login to manage itineraries.</div>}
    {token && <div className="grid lg:grid-cols-2 gap-10 mt-8">
      <form onSubmit={create} className="card p-5 space-y-4">
        <h4 className="font-medium text-sm">Create Itinerary</h4>
        {err && <div className="alert error">{err}</div>}
        <input className="input" placeholder="Title" value={form.title} onChange={e=> setForm(f=>({...f,title:e.target.value}))} required />
        <input className="input" placeholder="Destination" value={form.destination} onChange={e=> setForm(f=>({...f,destination:e.target.value}))} required />
        <textarea className="input min-h-[70px]" placeholder="Description" value={form.description} onChange={e=> setForm(f=>({...f,description:e.target.value}))} required />
        <div className="grid grid-cols-2 gap-3">
          <input className="input" type="date" value={form.startDate} onChange={e=> setForm(f=>({...f,startDate:e.target.value}))} required />
          <input className="input" type="date" value={form.endDate} onChange={e=> setForm(f=>({...f,endDate:e.target.value}))} required />
        </div>
        <input className="input" type="number" min={1} value={form.maxPeople} onChange={e=> setForm(f=>({...f,maxPeople:Number(e.target.value)||1}))} />
  <button className="btn-brand" disabled={loading}>{loading? 'Creating...' : 'Create'}</button>
      </form>
      <div className="space-y-4">
        <h4 className="font-medium text-sm">Your Itineraries</h4>
        {list.length===0 && <p className="text-sm text-muted">No itineraries yet.</p>}
        <ul className="space-y-3">
          {list.map(it => <li key={it.id} className="glass-card p-4 text-xs flex flex-col gap-1">
            <div className="flex justify-between"><span className="font-semibold text-sm">{it.title}</span><span>{new Date(it.startDate).toLocaleDateString()}</span></div>
            <span className="text-muted">{it.destination}</span>
            <span className="text-[10px]">Seats: {it.maxPeople} • Joins: {it.joins.filter((j:any)=> j.status==='APPROVED').length}</span>
          </li>)}
        </ul>
      </div>
    </div>}
  </section>;
};

const ManageCompanions: React.FC<ManageProps> = ({ apiBase, token, onBack }) => {
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState({ destination: '', startDate: '', endDate: '', notes: '' });
  const [loading, setLoading] = useState(false); const [err, setErr] = useState<string | null>(null);
  const headers = () => ({ 'Content-Type': 'application/json', ...(token? { authorization: `Bearer ${token}` }: {}) });
  async function load() { if (!token) return; const r = await fetch(`${apiBase}/my/companion-requests`, { headers: headers() }); const d = await r.json(); if (Array.isArray(d)) setList(d); }
  useEffect(()=>{ load(); }, [token]);
  async function create(e: React.FormEvent) { e.preventDefault(); setErr(null); setLoading(true); try { const r = await fetch(`${apiBase}/companion-requests`, { method: 'POST', headers: headers(), body: JSON.stringify({ destination: form.destination, startDate: form.startDate, endDate: form.endDate, notes: form.notes }) }); const d = await r.json(); if (!r.ok) throw new Error(d.error||'Failed'); setForm({ destination:'', startDate:'', endDate:'', notes:'' }); load(); } catch(e:any){ setErr(e.message);} finally{ setLoading(false);} }
  return <section className="section animate-fadeIn max-w-4xl">
    <div className="section-header flex items-center gap-4"><button className="btn" onClick={onBack}>Back</button><h2 className="section-title">Manage Companion Requests</h2></div>
    {!token && <div className="callout mt-4">Login to manage companion requests.</div>}
    {token && <div className="grid lg:grid-cols-2 gap-10 mt-8">
      <form onSubmit={create} className="card p-5 space-y-4">
        <h4 className="font-medium text-sm">Create Request</h4>
        {err && <div className="alert error">{err}</div>}
        <input className="input" placeholder="Destination" value={form.destination} onChange={e=> setForm(f=>({...f,destination:e.target.value}))} required />
        <div className="grid grid-cols-2 gap-3">
          <input className="input" type="date" value={form.startDate} onChange={e=> setForm(f=>({...f,startDate:e.target.value}))} required />
          <input className="input" type="date" value={form.endDate} onChange={e=> setForm(f=>({...f,endDate:e.target.value}))} required />
        </div>
        <textarea className="input min-h-[70px]" placeholder="Notes" value={form.notes} onChange={e=> setForm(f=>({...f,notes:e.target.value}))} />
  <button className="btn-brand" disabled={loading}>{loading? 'Creating...' : 'Create'}</button>
      </form>
      <div className="space-y-4">
        <h4 className="font-medium text-sm">Your Requests</h4>
        {list.length===0 && <p className="text-sm text-muted">No requests yet.</p>}
        <ul className="space-y-3">
          {list.map(cr => <li key={cr.id} className="glass-card p-4 text-xs flex flex-col gap-1">
            <div className="flex justify-between"><span className="font-semibold text-sm">{cr.destination}</span><span>{new Date(cr.startDate).toLocaleDateString()}</span></div>
            <span className="text-muted">{cr.notes?.slice(0,80)||'No notes'}</span>
          </li>)}
        </ul>
      </div>
    </div>}
  </section>;
};
