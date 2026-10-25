import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Send, RotateCcw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, isConfigured } from '@/lib/supabase';
import { ROOM_TYPES, type Room } from '@/lib/types';
import { roomImage } from '@/lib/images';
import { localDate, validDate, validateStay, stayEstimate, type StayDetails } from '@/lib/booking-chat';

type Step = 'checkIn' | 'checkOut' | 'guests' | 'category' | 'rooms' | 'confirm' | 'done';
type Message = { from: 'assistant' | 'guest'; text: string };
const greeting = 'Hi! I’m the Zenith booking assistant. I’ll help you find a room and reserve it. What is your check-in date? Use YYYY-MM-DD, or choose a date below.';
const money = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

export function BookingAssistant() {
  const { user, role } = useAuth();
  const [step, setStep] = useState<Step>('checkIn');
  const [messages, setMessages] = useState<Message[]>([{ from: 'assistant', text: greeting }]);
  const [stay, setStay] = useState<StayDetails>({ checkIn: '', checkOut: '', guests: 2, category: '' });
  const [input, setInput] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selected, setSelected] = useState<Room | null>(null);
  const [reservationId, setReservationId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const transcript = useRef<HTMLDivElement>(null);
  const composer = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (transcript.current) transcript.current.scrollTop = transcript.current.scrollHeight;
  }, [messages, busy]);
  useEffect(() => { if (!busy) composer.current?.focus(); }, [step, busy]);

  function say(text: string, from: Message['from'] = 'assistant') {
    setMessages(previous => [...previous, { from, text }]);
  }
  function restart() {
    if (inFlight.current) return;
    setStep('checkIn'); setMessages([{ from: 'assistant', text: greeting }]);
    setStay({ checkIn: '', checkOut: '', guests: 2, category: '' });
    setInput(''); setRooms([]); setSelected(null); setReservationId(''); setError('');
  }

  async function search(details: StayDetails) {
    if (inFlight.current) return;
    const invalid = validateStay(details);
    if (invalid) { setError(invalid); return; }
    inFlight.current = true; setBusy(true); setError(''); setRooms([]); setSelected(null); setStep('rooms');
    try {
      const { data, error } = await supabase.rpc('available_rooms', {
        p_check_in: details.checkIn, p_check_out: details.checkOut,
        p_guests: details.guests, p_category: details.category || null,
      });
      if (error) throw error;
      const found = (data || []) as Room[];
      setRooms(found);
      say(found.length
        ? `I found ${found.length} available rooms for ${details.guests} guest${details.guests === 1 ? '' : 's'}, ${details.checkIn} to ${details.checkOut}. Choose a room below to review your stay.`
        : 'No rooms match this stay. Try all categories, change your dates, or start again.');
    } catch (failure) {
      setError(`I couldn’t check availability: ${(failure as Error).message}. You can retry the search.`);
    } finally { inFlight.current = false; setBusy(false); }
  }

  async function reply(text: string) {
    if (inFlight.current) return;
    const value = text.trim();
    if (!value) return;
    setInput(''); setError(''); say(value, 'guest');
    const command = value.toLowerCase();
    if (['restart', 'start over', 'reset'].includes(command)) { restart(); return; }
    if (command === 'help') {
      say('I can guide you through check-in, check-out, guest count, room category and booking. Enter dates as YYYY-MM-DD. Type “restart” to change your stay. I will only reserve a room after you press Confirm reservation.');
      return;
    }
    if (step === 'checkIn') {
      if (!validDate(value) || value < localDate()) { say('Please choose today or a later check-in date, in YYYY-MM-DD format.'); return; }
      setStay(previous => ({ ...previous, checkIn: value })); setStep('checkOut');
      say('And when will you check out? Choose a date after check-in.');
    } else if (step === 'checkOut') {
      if (!validDate(value) || value <= stay.checkIn) { say('Check-out must be a real date after check-in, in YYYY-MM-DD format.'); return; }
      setStay(previous => ({ ...previous, checkOut: value })); setStep('guests');
      say('How many guests will be staying? Enter a number from 1 to 20.');
    } else if (step === 'guests') {
      const match = value.match(/^(\d+)(?:\s+(?:guests?|people|persons?))?$/i);
      const count = match ? Number(match[1]) : 0;
      if (count < 1 || count > 20) { say('Please enter a whole guest count from 1 to 20.'); return; }
      setStay(previous => ({ ...previous, guests: count })); setStep('category');
      say('What kind of room would you like? Choose a category below, type its name, or say “any”.');
    } else if (step === 'category') {
      const category = ROOM_TYPES.find(type => type.toLowerCase() === command);
      if (!category && !['any', 'all', 'all categories'].includes(command)) { say('Choose one of the five room categories below, or type “any”.'); return; }
      const next: StayDetails = { ...stay, category: category || '' };
      setStay(next); await search(next);
    } else if (step === 'rooms') {
      say('Choose a room card below. To change the stay details, press Start over.');
    } else if (step === 'confirm') {
      say('Review the room and estimated total below, then press Confirm reservation to book, or Choose another room.');
    } else { say('Your reservation is saved. Open My reservations to see its details, or start another search.'); }
  }

  function choose(room: Room) {
    if (inFlight.current) return;
    setSelected(room); setStep('confirm'); setError('');
    say(`Room ${room.room_number} — ${room.room_type}`, 'guest');
    say('Here is your stay summary. The room is not held yet. Please confirm when you’re ready.');
  }

  async function confirm() {
    if (!selected || step !== 'confirm' || inFlight.current) return;
    if (!user || role) { setError('Please sign in with a customer account to reserve a room.'); return; }
    const invalid = validateStay(stay);
    if (invalid) { setError(invalid); return; }
    inFlight.current = true; setBusy(true); setError('');
    try {
      const { data, error } = await supabase.rpc('book_room', {
        p_room_id: selected.id, p_check_in: stay.checkIn,
        p_check_out: stay.checkOut, p_guests: stay.guests,
      });
      if (error) {
        if (error.code === '23P01') {
          say('Someone just reserved that room for these dates. Please refresh the room choices to find another.');
          setSelected(null); setRooms([]); setStep('rooms');
        } else { setError(`The booking was not confirmed: ${error.message}. If your connection was interrupted, check My reservations before retrying.`); }
        return;
      }
      setReservationId(String(data)); setStep('done');
      say(`Your reservation is confirmed! Reference: ${data}. No payment has been collected. Open My reservations for your saved booking and final bill.`);
    } catch {
      setError('The connection was interrupted. Check My reservations before retrying; your booking may already have been saved.');
    } finally { inFlight.current = false; setBusy(false); }
  }

  function submit(event: FormEvent) { event.preventDefault(); void reply(input); }
  const estimate = selected ? stayEstimate(stay, Number(selected.nightly_price)) : null;

  if (role) return <div className="card p-6"><h1 className="text-3xl">Customer booking assistant</h1><p className="mt-4">Use a customer account for booking. Staff can view room availability.</p><Link className="btn-outline mt-5" to="/availability">Room availability</Link></div>;

  return <section className="max-w-4xl mx-auto">
    <p className="section-eyebrow">Your stay, one message at a time</p>
    <div className="flex flex-wrap justify-between gap-4 items-center my-4">
      <h1 className="text-4xl flex items-center gap-3"><MessageCircle aria-hidden="true"/>Zenith booking assistant</h1>
      <button className="btn-outline" onClick={restart} disabled={busy}><RotateCcw className="w-4 h-4" aria-hidden="true"/>Start over</button>
    </div>
    <p className="text-sm mb-6">A guided chatbot for reservations, using live room availability. Type “help” at any step. Your booking is saved only after confirmation.</p>
    {!isConfigured && <p role="alert" className="bg-amber-50 p-4 mb-4">Connect Supabase to search and reserve rooms.</p>}
    <div className="card overflow-hidden">
      <div ref={transcript} role="log" aria-label="Booking conversation" aria-live="polite" aria-relevant="additions text" className="p-5 sm:p-8 space-y-4 max-h-[48vh] overflow-y-auto">
        {messages.map((message, index) => <div key={index} className={`flex ${message.from === 'guest' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[92%] rounded-2xl px-5 py-4 whitespace-pre-wrap break-words ${message.from === 'guest' ? 'bg-midnight-900 text-ivory-50' : 'bg-ivory-100 text-midnight-900'}`}><span className="block text-xs font-semibold mb-1">{message.from === 'guest' ? 'You' : 'Zenith'}</span>{message.text}</div></div>)}
        {busy && <p role="status">{step === 'confirm' ? 'Confirming your reservation…' : 'Checking live availability…'}</p>}
      </div>
      <div className="p-5 sm:p-8 border-t border-stone-100 space-y-5">
        {error && <p role="alert" className="bg-red-50 p-4 text-red-800 rounded-xl">{error}</p>}
        {step === 'category' && <div className="flex flex-wrap gap-2">{['Any', ...ROOM_TYPES].map(type => <button key={type} className="btn-outline" disabled={busy} onClick={() => void reply(type)}>{type}</button>)}</div>}
        {<form onSubmit={submit} className="flex gap-3 items-end"><label className="flex-1 min-w-0"><span className="block text-sm mb-2">{step === 'checkIn' ? 'Check-in date (YYYY-MM-DD)' : step === 'checkOut' ? 'Check-out date (YYYY-MM-DD)' : step === 'guests' ? 'Number of guests' : step === 'category' ? 'Room category or any' : 'Message (help or restart)'}</span><input ref={composer} className="input-field" value={input} maxLength={120} onChange={event => setInput(event.target.value)} placeholder={step === 'checkIn' || step === 'checkOut' ? 'YYYY-MM-DD' : step === 'guests' ? 'e.g. 2 guests' : step === 'category' ? 'e.g. Deluxe Room' : 'Type help or restart'} disabled={busy} required/></label><button className="btn-primary" disabled={busy || !isConfigured || !input.trim()}><Send className="w-4 h-4" aria-hidden="true"/><span className="sr-only sm:not-sr-only">Send</span></button></form>}
        {(step === 'checkIn' || step === 'checkOut') && <label className="block text-sm">Or choose a date<input aria-label="Choose a date" type="date" min={step === 'checkIn' ? localDate() : stay.checkIn} className="input-field mt-2 max-w-xs" disabled={busy} value="" onChange={event => { if (event.target.value) void reply(event.target.value); }}/></label>}
        {step === 'rooms' && !busy && <><button className="btn-outline" onClick={() => void search(stay)} disabled={!isConfigured}>Refresh room choices</button>{stay.category && <button className="btn-outline ml-2" onClick={() => { const next = { ...stay, category: '' as const }; setStay(next); void search(next); }}>Try all categories</button>}<div className="grid sm:grid-cols-2 gap-4">{rooms.map(room => <article className="rounded-xl border border-stone-200 overflow-hidden" key={room.id}><img src={roomImage(room)} alt={room.room_type} className="h-32 w-full object-cover"/><div className="p-4"><h2 className="text-2xl">{room.room_type}</h2><p className="my-2">Room {room.room_number} • Up to {room.capacity} guests</p><p>{money(Number(room.nightly_price))} / night + 3% tax</p><p className="text-sm mt-2">{room.amenities.join(' · ')}</p><button className="btn-primary mt-4" onClick={() => choose(room)}>Choose room {room.room_number}</button></div></article>)}</div></>}
        {step === 'confirm' && selected && estimate && <div className="rounded-xl bg-ivory-50 p-5 space-y-3"><h2 className="text-3xl">Review your reservation</h2><p>{selected.room_type} • Room {selected.room_number}</p><p>{stay.checkIn} → {stay.checkOut} • {estimate.nights} night{estimate.nights === 1 ? '' : 's'} • {stay.guests} guest{stay.guests === 1 ? '' : 's'}</p><dl className="grid grid-cols-2 gap-2"><dt>Room fare</dt><dd>{money(estimate.base)}</dd><dt>Tax (3%)</dt><dd>{money(estimate.tax)}</dd><dt className="font-semibold">Estimated total</dt><dd className="font-semibold">{money(estimate.total)}</dd></dl><p className="text-sm">Final pricing and availability are checked by the database when you confirm. No payment is taken here.</p><div className="flex flex-wrap gap-3"><button className="btn-gold" disabled={busy || !user} onClick={() => void confirm()}>Confirm reservation</button><button className="btn-outline" disabled={busy} onClick={() => { setStep('rooms'); setSelected(null); setError(''); }}>Choose another room</button></div></div>}
        {step === 'done' && <p role="status" className="text-emerald-800">Saved reservation: <span className="break-all">{reservationId}</span></p>}
        <Link className="inline-block underline text-sm" to="/customer/dashboard">My reservations</Link>
      </div>
    </div>
  </section>;
}
