import { useState, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
export function StaffCreate({ onSaved }: {
    onSaved: () => Promise<void>;
}) {
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);
    async function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const form = e.currentTarget; const f = new FormData(form); setBusy(true); setMessage(''); try {
        const body = Object.fromEntries(f.entries());
        const { data, error } = await supabase.functions.invoke('admin-staff', { body: { ...body, salary: Number(body.salary) } });
        if (error)
            throw error;
        if (data?.error)
            throw new Error(data.error);
        form.reset();
        setMessage('Employee created.');
        await onSaved();
    }
    catch (e) {
        setMessage((e as Error).message);
    }
    finally {
        setBusy(false);
    } }
    return <details className="card p-5 mb-6"><summary>Create employee</summary><form onSubmit={submit} className="grid md:grid-cols-3 gap-4 mt-5">{['employee_id', 'name', 'email', 'password', 'phone', 'salary'].map(k => <label className="capitalize" key={k}>{k.replace('_', ' ')}<input required={k !== 'phone'} name={k} type={k === 'password' ? 'password' : k === 'email' ? 'email' : k === 'salary' ? 'number' : 'text'} min={k === 'salary' ? 0 : undefined} step={k === 'salary' ? '0.01' : undefined} minLength={k === 'password' ? 12 : undefined} autoComplete={k === 'password' ? 'new-password' : 'off'} className="input-field"/></label>)}<label>Department<select name="department" className="input-field">{['assistant_manager', 'receptionist', 'clerk', 'room_service', 'manager'].map(r => <option key={r}>{r}</option>)}</select></label><button className="btn-primary" disabled={busy}>Create employee</button></form>{message && <p role="status" className="mt-4">{message}</p>}</details>;
}
