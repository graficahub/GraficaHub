/**
 * Utilitários de autenticação com Supabase Auth
 * 
 * Este módulo fornece funções para gerenciar autenticação usando Supabase Auth:
 * - signUpWithEmail: Cadastro de novo usuário
 * - signInWithEmail: Login de usuário existente
 * - signOut: Logout do usuário
 * - getCurrentUser: Obter usuário atual autenticado
 * - getSession: Obter sessão atual
 * 
 * Após o cadastro bem-sucedido, insere automaticamente um registro na tabela public.users
 * com o mesmo ID do Supabase Auth.
 */

import { supabase } from './supabaseClient'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthError {
  name?: string
  message: string
  status?: number
}

export interface AuthResponse {
  user: User | null
  session: Session | null
  error: AuthError | null
}

export interface SignUpResponse extends AuthResponse {
  userInserted: boolean
}

/**
 * Cadastra um novo usuário com email e senha
 * 
 * Fluxo:
 * 1. Cria conta no Supabase Auth usando signUp
 * 2. Se bem-sucedido, insere registro na tabela public.users
 * 3. Retorna dados do usuário e sessão
 * 
 * @param email - Email do usuário
 * @param password - Senha do usuário
 * @param name - Nome completo do usuário (será salvo na tabela users)
 * @returns Resposta com user, session e error
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  name: string
): Promise<SignUpResponse> {
  if (!supabase) {
    return {
      user: null,
      session: null,
      error: {
        name: 'SupabaseNotConfigured',
        message: 'Supabase não está configurado. Verifique as variáveis de ambiente.',
      },
      userInserted: false,
    }
  }

  try {
    // 1. Cria conta no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name, // Salva name nos metadados do usuário
        },
      },
    })

    if (authError) {
      return {
        user: null,
        session: null,
        error: {
          name: authError.name,
          message: authError.message,
          status: authError.status,
        },
        userInserted: false,
      }
    }

    // 2. Se o cadastro foi bem-sucedido, insere na tabela public.users
    let userInserted = false
    if (authData.user) {
      try {
        // Tenta inserir na tabela users
        // Assumindo que a tabela tem: id, email, name (ou full_name)
        // Ajuste os campos conforme o schema real da sua tabela
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id, // Mesmo ID do Supabase Auth
            email: authData.user.email,
            name: name, // Tente 'name' primeiro
            // Se sua tabela usar 'full_name' em vez de 'name', descomente:
            // full_name: name,
            created_at: new Date().toISOString(),
          })

        if (insertError) {
          // Se 'name' não existir, tenta 'full_name'
          if (insertError.code === '42703' || insertError.message.includes('name')) {
            const { error: retryError } = await supabase
              .from('users')
              .insert({
                id: authData.user.id,
                email: authData.user.email,
                full_name: name,
                created_at: new Date().toISOString(),
              })

            if (!retryError) {
              userInserted = true
            } else {
              console.error('❌ Erro ao inserir usuário na tabela (tentativa com full_name):', retryError)
            }
          } else {
            console.error('❌ Erro ao inserir usuário na tabela:', insertError)
          }
        } else {
          userInserted = true
        }
      } catch (insertErr) {
        console.error('❌ Erro ao inserir usuário na tabela:', insertErr)
        // Não falha o cadastro se o insert falhar - o usuário já está criado no Auth
      }
    }

    return {
      user: authData.user,
      session: authData.session,
      error: null,
      userInserted,
    }
  } catch (error) {
    return {
      user: null,
      session: null,
      error: {
        name: 'UnexpectedError',
        message: error instanceof Error ? error.message : 'Erro inesperado ao cadastrar usuário',
      },
      userInserted: false,
    }
  }
}

/**
 * Faz login com email e senha
 * 
 * @param email - Email do usuário
 * @param password - Senha do usuário
 * @returns Resposta com user, session e error
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResponse> {
  if (!supabase) {
    return {
      user: null,
      session: null,
      error: {
        name: 'SupabaseNotConfigured',
        message: 'Supabase não está configurado. Verifique as variáveis de ambiente.',
      },
    }
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    return {
      user: data?.user ?? null,
      session: data?.session ?? null,
      error: error
        ? {
            name: error.name,
            message: error.message,
            status: error.status,
          }
        : null,
    }
  } catch (error) {
    return {
      user: null,
      session: null,
      error: {
        name: 'UnexpectedError',
        message: error instanceof Error ? error.message : 'Erro inesperado ao fazer login',
      },
    }
  }
}

/**
 * Faz logout do usuário atual
 * 
 * @returns true se logout foi bem-sucedido, false caso contrário
 */
export async function signOut(): Promise<boolean> {
  if (!supabase) {
    return false
  }

  try {
    const { error } = await supabase.auth.signOut()
    return !error
  } catch (error) {
    console.error('❌ Erro ao fazer logout:', error)
    return false
  }
}

/**
 * Obtém o usuário atual autenticado
 * 
 * @returns User ou null se não houver usuário autenticado
 */
export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) {
    return null
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('❌ Erro ao obter usuário atual:', error)
    return null
  }
}

/**
 * Obtém a sessão atual
 * 
 * @returns Session ou null se não houver sessão ativa
 */
export async function getSession(): Promise<Session | null> {
  if (!supabase) {
    return null
  }

  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error('❌ Erro ao obter sessão:', error)
    return null
  }
}

