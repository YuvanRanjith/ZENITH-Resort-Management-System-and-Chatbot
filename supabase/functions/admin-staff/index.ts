// Deploy with JWT verification enabled. Service credentials never reach the browser.
import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
Deno.serve(async (req: Request) => {
    const origin = Deno.env.get('APP_ORIGIN');
    const headers = { 'Access-Control-Allow-Origin': origin || '', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Vary': 'Origin', 'Content-Type': 'application/json' };
    const reply = (status: number, value: unknown) => new Response(JSON.stringify(value), { status, headers });
    if (req.method === 'OPTIONS')
        return new Response(null, { status: 204, headers });
    if (req.method !== 'POST')
        return reply(405, { error: 'Method not allowed' });
    if (!origin || req.headers.get('Origin') && req.headers.get('Origin') !== origin)
        return reply(403, { error: 'Origin not permitted' });
    const url = Deno.env.get('SUPABASE_URL')!;
    const token = req.headers.get('Authorization')?.replace(/^Bearer /i, '');
    if (!token)
        return reply(401, { error: 'Authentication required' });
    const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
    const { data: identity, error: authError } = await admin.auth.getUser(token);
    if (authError || !identity.user)
        return reply(401, { error: 'Invalid session' });
    if (identity.user.app_metadata.role !== 'manager')
        return reply(403, { error: 'Manager authorization required' });
    try {
        const body = await req.json();
        const roles = ['manager', 'assistant_manager', 'receptionist', 'clerk', 'room_service'];
        if (typeof body.name !== 'string' || !body.name.trim() || body.name.length > 120 || typeof body.email !== 'string' || !/^\S+@\S+\.\S+$/.test(body.email) || typeof body.password !== 'string' || body.password.length < 12 || !roles.includes(body.department) || typeof body.employee_id !== 'string' || !body.employee_id.trim() || body.employee_id.length > 80 || !Number.isFinite(body.salary) || body.salary < 0 || typeof body.phone !== 'string' || body.phone.length > 40)
            return reply(400, { error: 'Invalid employee details. Password must contain at least 12 characters.' });
        const { data, error } = await admin.auth.admin.createUser({ email: body.email, password: body.password, email_confirm: true, app_metadata: { role: body.department }, user_metadata: { full_name: body.name.trim() } });
        if (error)
            return reply(400, { error: error.message });
        const inserted = await admin.from('employees').insert({ auth_user_id: data.user.id, employee_id: body.employee_id.trim(), name: body.name.trim(), department: body.department, salary: body.salary, phone_no: body.phone || null });
        if (inserted.error) {
            const cleanup = await admin.auth.admin.deleteUser(data.user.id);
            if (cleanup.error)
                console.error('Staff provisioning cleanup failed for user', data.user.id);
            return reply(400, { error: 'Employee record could not be saved. Contact the administrator.' });
        }
        return reply(201, { success: true });
    }
    catch {
        return reply(400, { error: 'Invalid request' });
    }
});
