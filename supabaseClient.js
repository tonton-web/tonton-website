import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/module/index.js';

// Replace with your project's URL and anon key
const supabaseUrl = 'https://vambodsgqcdfjjveqqiq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhbWJvZHNncWNkZmpqdmVxcWlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNDc1MDEsImV4cCI6MjA3MTkyMzUwMX0.9jsF-L74ntI1FZVyLuy4hXMn4stz6X2dwRrogYX9Hwk';

export const supabase = createClient(supabaseUrl, supabaseKey);

