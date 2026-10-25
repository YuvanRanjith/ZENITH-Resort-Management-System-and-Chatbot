import { useState, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { ROOM_TYPES } from '@/lib/types';
export function ManagerEditor({ section, onSaved }: {
    section: string;
    onSaved: () => Promise<void>;
}) {
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);
    if (!['customers', 'employees', 'rooms'].includes(section))
        return null;
    async function submit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = e.currentTarget;
        const f = new FormData(form);
        setBusy(true);
        setMessage('');
        try {
            const result = section === 'customers' ? await supabase.rpc('manager_update_customer', { p_id: f.get('id'), p_name: f.get('name'), p_phone: f.get('phone') }) : section === 'employees' ? await supabase.rpc('manager_update_staff', { p_id: f.get('id'), p_name: f.get('name'), p_salary: Number(f.get('salary')), p_phone: f.get('phone') }) : await supabase.rpc('manager_save_room', { p_number: f.get('id'), p_type: f.get('type'), p_price: Number(f.get('price')), p_capacity: Number(f.get('capacity')), p_status: f.get('status') });
            if (result.error)
                throw result.error;
            setMessage('Saved successfully.');
            form.reset();
            await onSaved();
        }
        catch (e) {
            setMessage((e as Error).message);
        }
        finally {
            setBusy(false);
        }
    }
    return <details className="card p-5 mb-6"><summary className="cursor-pointer">{section === 'rooms' ? 'Add or update a room' : 'Update permitted record fields'}</summary><form onSubmit={submit} className="mt-5 grid md:grid-cols-3 gap-4"><label>{section === 'rooms' ? 'Room number' : section === 'customers' ? 'Customer ID' : 'Employee ID'}<input className="input-field" name="id" required maxLength={80}/></label>{section === 'rooms' ? <><label>Room type<select name="type" className="input-field">{ROOM_TYPES.map(t => <option key={t}>{t}</option>)}</select></label><label>Nightly price<input name="price" className="input-field" type="number" min="0" step="0.01" required/></label><label>Capacity<input name="capacity" className="input-field" type="number" min="1" required/></label><label>Status<select name="status" className="input-field">{['available', 'occupied', 'maintenance'].map(s => <option key={s}>{s}</option>)}</select></label></> : <><label>Name<input className="input-field" name="name" required maxLength={120}/></label><label>Phone<input className="input-field" name="phone" maxLength={40}/></label>{section === 'employees' && <label>Salary<input name="salary" className="input-field" type="number" min="0" step="0.01" required/></label>}</>}<button className="btn-primary" disabled={busy}>Save changes</button></form>{message && <p role="status" className="mt-4">{message}</p>}</details>;
}
