const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const SUPABASE_URL = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testLogin() {
    console.log('Testing login for:', 'comunicacion@bylamambanegra.com');
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'comunicacion@bylamambanegra.com',
        password: 'fpZp_g.2n7ieZJ3'
    });

    if (error) {
        console.error('❌ LOGIN FAILED:', error.message);
        console.error('Full Error Object:', error);
    } else {
        console.log('✅ LOGIN SUCCESS! Session created.');
    }
}

testLogin();
