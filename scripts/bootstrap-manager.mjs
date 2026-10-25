import { createClient } from '@supabase/supabase-js';
// Operator-only first-manager provisioning. Use a local trusted shell, never VITE_ secrets.
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ZENITH_MANAGER_EMAIL, ZENITH_MANAGER_PASSWORD, ZENITH_MANAGER_NAME }=process.env;
if(!SUPABASE_URL||!SUPABASE_SERVICE_ROLE_KEY||!ZENITH_MANAGER_EMAIL||!ZENITH_MANAGER_PASSWORD||!ZENITH_MANAGER_NAME)throw new Error('Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ZENITH_MANAGER_EMAIL, ZENITH_MANAGER_PASSWORD, ZENITH_MANAGER_NAME in the operator shell.');
if(ZENITH_MANAGER_PASSWORD.length<12)throw new Error('Use at least 12 password characters.');
const client=createClient(SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const existing=await client.from('employees').select('id').eq('department','manager').limit(1);
if(existing.error)throw existing.error;
if(existing.data.length)throw new Error('A manager already exists. Use the manager staff creation interface.');
const {data,error}=await client.auth.admin.createUser({email:ZENITH_MANAGER_EMAIL,password:ZENITH_MANAGER_PASSWORD,email_confirm:true,app_metadata:{role:'manager'},user_metadata:{full_name:ZENITH_MANAGER_NAME}});
if(error)throw error;
const saved=await client.from('employees').insert({employee_id:'M-'+data.user.id,auth_user_id:data.user.id,name:ZENITH_MANAGER_NAME,department:'manager',salary:0});
if(saved.error){const cleanup=await client.auth.admin.deleteUser(data.user.id);if(cleanup.error)console.error('Cleanup required for auth user',data.user.id);throw saved.error;}
console.log('Initial manager provisioned. Clear the provisioning environment variables from your shell.');
