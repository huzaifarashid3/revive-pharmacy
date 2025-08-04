// Test script to check Supabase connection
import { supabase } from './src/lib/supabase';

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('medicines')
      .select('count(*)')
      .limit(1);
      
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('Database response:', data);
    return true;
  } catch (err) {
    console.error('❌ Connection error:', err);
    return false;
  }
}

testConnection();
