/**
 * Cliente Supabase para o Tocantins Integrado
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL não configurada');
}

// Cliente com privilégios de serviço (para operações administrativas)
export function createServiceClient(): SupabaseClient {
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada');
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Cliente público (para operações do usuário)
export function createPublicClient(): SupabaseClient {
  if (!supabaseAnonKey) {
    throw new Error('SUPABASE_ANON_KEY não configurada');
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Instância singleton do cliente de serviço
let serviceClient: SupabaseClient | null = null;

export function getServiceClient(): SupabaseClient {
  if (!serviceClient) {
    serviceClient = createServiceClient();
  }
  return serviceClient;
}

// Instância singleton do cliente público
let publicClient: SupabaseClient | null = null;

export function getPublicClient(): SupabaseClient {
  if (!publicClient) {
    publicClient = createPublicClient();
  }
  return publicClient;
}

// Exportação padrão do cliente de serviço
export default getServiceClient;
