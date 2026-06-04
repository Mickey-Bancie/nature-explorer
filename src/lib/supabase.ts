import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zkiomwvcjwhvlxyveypu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpraW9td3Zjandodmx4eXZleXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5OTM3MzUsImV4cCI6MjA5NTU2OTczNX0.xo6TaUYpPbmdcnjWR1LYCLylKi7odTnFSKEjP5BDBhE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey)
