// ============================================================
// SUPABASE CONFIGURATION
// Replace with your actual Supabase project credentials
// ============================================================
const SUPABASE_URL = 'https://udmlzpvpsllitrhxejvj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkbWx6cHZwc2xsaXRyaHhlanZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MjAyMzEsImV4cCI6MjA5NjQ5NjIzMX0.YK8IxVwt2-cqXRV1nGHLNsHZsvSflcTb1tpUY2dJ0pQ';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// App version
const APP_VERSION = '1.0.0';
const APP_NAME = 'SupervisãoAgentes';
