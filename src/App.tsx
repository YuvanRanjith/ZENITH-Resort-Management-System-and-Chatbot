import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { supabase, isConfigured } from '@/lib/supabase';
import { IMAGES, roomImage } from '@/lib/images';
import { ROOM_TYPES, RESERVATION_STATUSES, type Room, type DashboardStats } from '@/lib/types';
import { downloadCsv } from '@/lib/csv';
import { ManagerEditor } from '@/components/ManagerEditor';
import { StaffCreate } from '@/components/StaffCreate';
import { BookingAssistant } from '@/components/BookingAssistant';
type Row = Record<string, unknown>;
const money = (n: unknown) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(n || 0));
const today = () => new Date().toLocaleDateString('en-CA');
function ErrorMessage({ message }: {
    message: string;
}) { return message ? <p role="alert" className="my-4 rounded-xl bg-red-50 p-4 text-red-800">{message}</p> : null; }
function Protected({ children, manager = false, staff = false }: {
    children: ReactNode;
    manager?: boolean;
    staff?: boolean;
}) {
    const auth = useAuth();
    const location = useLocation();
    if (auth.loading)
        return <p>Loading session…</p>;
    if (!auth.user)
        return <Navigate to={manager || staff ? '/staff/login' : '/login'} state={{ from: location.pathname }} replace/>;
    if (manager && auth.role !== 'manager' || staff && !auth.role)
        return <p role="alert">You do not have permission to view this page.</p>;
    return children;
}
function Home() { return <><section className="relative min-h-[80vh] flex items-center bg-midnight-950 text-white"><img src={IMAGES.hero} alt="Resort overlooking the water" className="absolute inset-0 w-full h-full object-cover opacity-45"/><div className="relative max-w-7xl mx-auto px-8 py-40"><p className="section-eyebrow">ZENITH • Elevating Every Stay.</p><h1 className="text-6xl md:text-8xl mt-6 max-w-3xl">A little closer to paradise.</h1><p className="my-8 text-lg">Space to unwind. Moments to remember.</p><Link className="btn-gold" to="/availability">Discover your stay</Link></div></section><section className="max-w-5xl mx-auto p-10 text-center"><p className="section-eyebrow">An extraordinary escape</p><h2 className="text-4xl my-5">Hospitality, elevated.</h2><p>Explore five room categories, thoughtful amenities, and a stay shaped around you.</p><Link to="/rooms" className="btn-outline mt-6">Explore rooms & suites</Link></section></>; }
function Availability() {
    const { user, role } = useAuth();
    const navigate = useNavigate();
    const [arrival, setArrival] = useState(today());
    const [departure, setDeparture] = useState('');
    const [guests, setGuests] = useState(2);
    const [category, setCategory] = useState('');
    const [rooms, setRooms] = useState<Room[]>([]);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [searched, setSearched] = useState(false);
    const [criteria, setCriteria] = useState<{
        arrival: string;
        departure: string;
        guests: number;
        category: string;
    } | null>(null);
    const search = useCallback(async (c: {
        arrival: string;
        departure: string;
        guests: number;
        category: string;
    }) => {
        setBusy(true);
        setError('');
        setRooms([]);
        try {
            const { data, error } = await supabase.rpc('available_rooms', { p_check_in: c.arrival, p_check_out: c.departure, p_guests: c.guests, p_category: c.category || null });
            if (error)
                throw error;
            setRooms(data || []);
            setSearched(true);
        }
        catch (e) {
            setError((e as Error).message);
        }
        finally {
            setBusy(false);
        }
    }, []);
    useEffect(() => { if (!criteria)
        return; const refresh = () => void search(criteria); window.addEventListener('focus', refresh); const timer = setInterval(refresh, 30000); return () => { window.removeEventListener('focus', refresh); clearInterval(timer); }; }, [criteria, search]);
    async function submit(e: FormEvent) { e.preventDefault(); const c = { arrival, departure, guests, category }; setCriteria(c); await search(c); }
    async function reserve(room: Room) { if (!user) {
        navigate('/login', { state: { from: '/availability' } });
        return;
    } if (!criteria)
        return; setBusy(true); const { error } = await supabase.rpc('book_room', { p_room_id: room.id, p_check_in: criteria.arrival, p_check_out: criteria.departure, p_guests: criteria.guests }); if (error) {
        await search(criteria);
        setError(error.code === '23P01' ? 'That room was just reserved. Please choose another room.' : error.message);
    }
    else {
        navigate('/customer/dashboard');
    } setBusy(false); }
    return <><p className="section-eyebrow">Your next escape</p><h1 className="text-5xl mb-6">Room availability</h1>{!role && <Link className="btn-outline mb-6" to="/customer/assistant">Need help? Chat to book</Link>}<form onSubmit={submit} className="card p-6 grid sm:grid-cols-2 lg:grid-cols-5 gap-4"><label>Check-in<input required type="date" min={today()} value={arrival} onChange={e => setArrival(e.target.value)} className="input-field"/></label><label>Check-out<input required type="date" min={arrival} value={departure} onChange={e => setDeparture(e.target.value)} className="input-field"/></label><label>Guests<input required type="number" min="1" max="20" value={guests} onChange={e => setGuests(Number(e.target.value))} className="input-field"/></label><label>Category<select value={category} onChange={e => setCategory(e.target.value)} className="input-field"><option value="">All categories</option>{ROOM_TYPES.map(t => <option key={t}>{t}</option>)}</select></label><button disabled={busy || !isConfigured || departure <= arrival} className="btn-primary">{busy ? 'Searching…' : 'Search rooms'}</button></form><ErrorMessage message={error}/><p className="my-5 text-sm">Rates are per night, plus 3% tax. Availability refreshes every 30 seconds and when you return to this window.</p>{searched && !rooms.length && !busy && <p>No rooms match this stay. Try another date or category.</p>}<div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">{rooms.map(room => <article key={room.id} className="card overflow-hidden"><img src={roomImage(room)} alt={room.room_type} className="w-full h-52 object-cover"/><div className="p-6"><p className="section-eyebrow">Available • Room {room.room_number}</p><h2 className="text-3xl my-2">{room.room_type}</h2><p>{room.description}</p><p className="my-3">Up to {room.capacity} guests • {money(room.nightly_price)} / night</p><p className="text-sm mb-5">{room.amenities.join(' · ')}</p><button disabled={busy || Boolean(role)} onClick={() => void reserve(room)} className="btn-primary">{user ? 'Reserve room' : 'Sign in to reserve'}</button></div></article>)}</div></>;
}
function Rooms() { const [rooms, setRooms] = useState<Room[]>([]); const [error, setError] = useState(''); useEffect(() => { if (isConfigured)
    supabase.from('rooms').select('*').order('nightly_price').then(({ data, error }) => { setRooms(data || []); setError(error?.message || ''); }); }, []); return <><h1 className="text-5xl mb-6">Rooms & suites</h1><ErrorMessage message={error}/><div className="grid md:grid-cols-3 gap-6">{rooms.map(r => <article className="card p-5" key={r.id}><img className="h-48 w-full object-cover rounded-xl" src={roomImage(r)} alt={r.room_type}/><h2 className="text-3xl my-4">{r.room_type}</h2><p>Room {r.room_number} • {money(r.nightly_price)} / night</p><p>{r.capacity} guests • {r.amenities.join(', ')}</p><Link className="btn-primary mt-4" to="/availability">Check dates</Link></article>)}</div>{!rooms.length && <p>No rooms loaded. Configure the database and apply the room seed migration.</p>}</>; }
function Login({ register = false, staff = false }: {
    register?: boolean;
    staff?: boolean;
}) {
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    async function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); setBusy(true); setError(''); const f = new FormData(e.currentTarget); try {
        const email = String(f.get('email'));
        const password = String(f.get('password'));
        const { data, error } = register ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: new URL('/login', window.location.origin).href, data: { full_name: String(f.get('name')) } } }) : await supabase.auth.signInWithPassword({ email, password });
        if (error)
            throw error;
        if (register && !data.session) {
            setError('Check your email to confirm your account, then sign in.');
            return;
        }
        const role = data.user?.app_metadata.role;
        const from = location.state?.from;
        navigate(from || (role === 'manager' ? '/manager/dashboard' : role ? '/staff/dashboard' : '/customer/dashboard'));
    }
    catch (e) {
        setError((e as Error).message);
    }
    finally {
        setBusy(false);
    } }
    return <div className="card max-w-md mx-auto p-8"><h1 className="text-4xl mb-6">{register ? 'Create your account' : staff ? 'Staff sign in' : 'Welcome back'}</h1><form onSubmit={submit} className="space-y-4">{register && <label className="block">Name<input name="name" required maxLength={120} className="input-field" autoComplete="name"/></label>}<label className="block">Email<input name="email" type="email" required className="input-field" autoComplete="email"/></label><label className="block">Password<input name="password" type="password" minLength={8} required className="input-field" autoComplete={register ? 'new-password' : 'current-password'}/></label><button disabled={busy || !isConfigured} className="btn-primary">{busy ? 'Please wait…' : register ? 'Register' : 'Sign in'}</button></form><ErrorMessage message={error}/>{!staff && <Link to={register ? '/login' : '/register'} className="block mt-5 underline">{register ? 'Already registered? Sign in' : 'Create an account'}</Link>}</div>;
}
function DataTable({ rows }: {
    rows: Row[];
}) { if (!rows.length)
    return <p className="card p-6">No matching records.</p>; const keys = Object.keys(rows[0]); return <div className="overflow-x-auto card"><table className="w-full text-sm text-left"><thead><tr>{keys.map(k => <th className="p-4 whitespace-nowrap" key={k}>{k.replace(/_/g, ' ')}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={i} className="border-t">{keys.map(k => <td className="p-4 max-w-xs break-words" key={k}>{r[k] === null ? '—' : typeof r[k] === 'object' ? JSON.stringify(r[k]) : String(r[k])}</td>)}</tr>)}</tbody></table></div>; }
const managerLinks = ['dashboard', 'customers', 'employees', 'rooms', 'reservations', 'exports'];
function Manager({ section }: {
    section: string;
}) {
    const [rows, setRows] = useState<Row[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const load = useCallback(async () => { setBusy(true); setError(''); try {
        if (section === 'dashboard') {
            const { data, error } = await supabase.rpc('manager_dashboard_stats');
            if (error)
                throw error;
            setStats(data);
        }
        else if (section !== 'exports') {
            const result = section === 'employees' ? await supabase.rpc('manager_staff') : await supabase.from(section).select(section === 'customers' ? 'customer_id,name,email,phone_no' : section === 'rooms' ? 'id,room_number,room_type,nightly_price,capacity,operational_status' : 'id,check_in,check_out,total_days,total_amount,status,customers(customer_id,name),rooms(room_number,room_type)');
            if (result.error)
                throw result.error;
            setRows(result.data || []);
        }
    }
    catch (e) {
        setError((e as Error).message);
    }
    finally {
        setBusy(false);
    } }, [section]);
    useEffect(() => { setRows([]); setFilter(''); void load(); }, [load]);
    async function exportData(kind: string) { setBusy(true); setError(''); try {
        const { data, error } = await supabase.rpc('manager_export', { p_kind: kind, p_search: search, p_status: filter || null });
        if (error)
            throw error;
        if (typeof data !== 'string')
            throw new Error('Invalid export response');
        downloadCsv(data, kind);
    }
    catch (e) {
        setError((e as Error).message);
    }
    finally {
        setBusy(false);
    } }
    const filtered = rows.filter(r => Object.values(r).some(v => String(v ?? '').toLowerCase().includes(search.toLowerCase())) && (!filter || r.status === filter || r.department === filter || r.operational_status === filter));
    return <><nav className="flex flex-wrap gap-2 mb-8">{managerLinks.map(s => <Link className={s === section ? 'btn-primary' : 'btn-outline'} to={`/manager/${s}`} key={s}>{s}</Link>)}</nav><h1 className="text-4xl capitalize mb-6">{section === 'exports' ? 'Data Export Center' : section}</h1><ErrorMessage message={error}/>{section === 'dashboard' ? <><button className="btn-outline mb-5" disabled={busy} onClick={() => void load()}>Refresh statistics</button><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">{stats && Object.entries(stats).map(([key, value]) => <div className="card p-6" key={key}><p className="capitalize text-sm">{key.replace(/_/g, ' ')}</p><p className="text-3xl mt-3">{key === 'revenue' || key === 'pending_payments' ? money(value) : value}</p></div>)}</div><p className="mt-4 text-sm">Availability and occupancy are calculated for today. Recorded revenue includes recorded payments.</p></> : <><div className="flex flex-wrap gap-4 mb-6"><label>Search records<input value={search} onChange={e => setSearch(e.target.value)} className="input-field"/></label><label>Filter<select className="input-field" value={filter} onChange={e => setFilter(e.target.value)}><option value="">All records</option>{(section === 'employees' ? ['manager', 'assistant_manager', 'receptionist', 'clerk', 'room_service'] : section === 'rooms' ? ['available', 'occupied', 'maintenance'] : section === 'exports' ? [...RESERVATION_STATUSES, 'manager', 'assistant_manager', 'receptionist', 'clerk', 'room_service'] : RESERVATION_STATUSES).map(s => <option key={s}>{s}</option>)}</select></label><button className="btn-outline" disabled={busy} onClick={() => void load()}>Refresh</button></div>{section === 'exports' ? <div className="card p-8 space-y-5"><p>Customer exports contain one row per reservation, including customers without reservations. Use reservation statuses for customer exports and departments for staff exports.</p><div className="flex gap-4 flex-wrap"><button className="btn-primary" disabled={busy} onClick={() => void exportData('customers')}>Download Customer Data (CSV)</button><button className="btn-gold" disabled={busy} onClick={() => void exportData('staff')}>Download Staff Data (CSV)</button></div><p className="text-sm">Downloads are authorized and audited by the database. Identity documents and authentication credentials are excluded.</p></div> : <>{section === 'employees' && <StaffCreate onSaved={load}/>}<ManagerEditor section={section} onSaved={load}/><DataTable rows={filtered}/></>}</>}{busy && <p role="status" className="mt-5">Loading…</p>}</>;
}
function CustomerDashboard() { const [rows, setRows] = useState<Row[]>([]); const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const load = useCallback(async () => { setBusy(true); try {
    const profile = await supabase.rpc('ensure_customer_profile');
    if (profile.error)
        throw profile.error;
    const { data, error } = await supabase.from('reservations').select('id,check_in,check_out,total_days,base_amount,tax_amount,total_amount,status,rooms(room_number,room_type),payments(amount,payment_status)').eq('customer_id', profile.data).order('check_in', { ascending: false });
    if (error)
        throw error;
    setRows(data || []);
}
catch (e) {
    setError((e as Error).message);
}
finally {
    setBusy(false);
} }, []); useEffect(() => { void load(); }, [load]); async function cancel(id: unknown) { setBusy(true); const { error } = await supabase.rpc('cancel_own_reservation', { p_id: id }); if (error)
    setError(error.message); await load(); } return <><h1 className="text-5xl mb-6">Your stays</h1><div className="flex flex-wrap gap-3 mb-6"><Link className="btn-primary" to="/availability">Book a stay</Link><Link className="btn-gold" to="/customer/assistant">Chat to book a room</Link></div><ErrorMessage message={error}/>{busy && <p>Loading…</p>}<DataTable rows={rows}/><div className="mt-5 space-y-3">{rows.filter(r => ['pending', 'confirmed'].includes(String(r.status))).map(r => <div key={String(r.id)} className="card p-4 flex flex-wrap items-center gap-4"><span>{String(r.check_in)} to {String(r.check_out)}</span><button className="btn-outline" disabled={busy} onClick={() => void cancel(r.id)}>Cancel reservation</button></div>)}</div></>; }
function StaffDashboard() { const { role } = useAuth(); return role === 'manager' ? <Navigate to="/manager/dashboard" replace/> : <><h1 className="text-4xl">Staff dashboard</h1><p className="my-6">Signed in as {role?.replace(/_/g, ' ')}. Your staff session is active. Management records and exports require manager authorization.</p><Link className="btn-primary" to="/availability">View room availability</Link></>; }
function Shell() { const auth = useAuth(); const location = useLocation(); return <><Navbar /><div className={location.pathname === '/' ? 'pt-24' : 'pt-32'}>{!isConfigured && <p role="status" className="bg-amber-50 text-amber-900 p-5 text-center">Database setup required. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then apply the supplied migrations.</p>}{auth.error && <ErrorMessage message={auth.error}/>}<main className={location.pathname === '/' ? '' : 'max-w-7xl mx-auto px-5 min-h-[55vh]'}><Routes><Route path="/" element={<Home />}/><Route path="/rooms" element={<Rooms />}/><Route path="/availability" element={<Availability />}/><Route path="/login" element={<Login />}/><Route path="/register" element={<Login register/>}/><Route path="/staff/login" element={<Login staff/>}/><Route path="/customer/assistant" element={<Protected><BookingAssistant /></Protected>}/><Route path="/customer/dashboard" element={<Protected><CustomerDashboard /></Protected>}/><Route path="/staff/dashboard" element={<Protected staff><StaffDashboard /></Protected>}/>{managerLinks.map(s => <Route key={s} path={`/manager/${s}`} element={<Protected manager><Manager key={s} section={s}/></Protected>}/>)}<Route path="/about" element={<><h1 className="text-5xl mb-6">The Zenith experience</h1><p>Elevating Every Stay. Thoughtful spaces, warm hospitality, and room to reconnect.</p></>}/><Route path="/contact" element={<><h1 className="text-5xl mb-6">Contact Zenith</h1><p>This academic demonstration uses sample contact details in the footer. For assistance with your stay, contact the resort reception through your booking contact.</p></>}/><Route path="*" element={<><h1 className="text-4xl">Page not found</h1><Link to="/">Return home</Link></>}/></Routes>{auth.user && <button className="btn-outline mt-8" onClick={() => void auth.signOut()}>Sign out</button>}</main></div><Footer /></>; }
export default function App() { return <BrowserRouter><AuthProvider><Shell /></AuthProvider></BrowserRouter>; }
