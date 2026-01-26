"use client";

import { supabase } from "@/lib/supabaseClient";
import type { Session, User } from "@supabase/supabase-js";

export async function getSession(): Promise<Session | null> {
  if (!supabase) {
    console.error("Supabase não está configurado");
    return null;
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("Erro ao obter sessão:", error);
    return null;
  }
  return data.session ?? null;
}

export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) {
    console.error("Supabase não está configurado");
    return null;
  }

  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Erro ao obter usuário atual:", error);
    return null;
  }
  return data.user ?? null;
}

export async function getUserRole(userId?: string): Promise<"admin" | "user"> {
  if (!supabase) {
    console.error("Supabase não está configurado");
    return "user"; // Default para 'user' em vez de null
  }

  try {
    let id = userId;

    // Se não vier id, pega da sessão atual
    if (!id) {
      const user = await getCurrentUser();
      if (!user) {
        console.warn("getUserRole: Usuário não encontrado na sessão, retornando 'user' como default");
        return "user";
      }
      id = user.id;
    }

    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", id)
      .single();

    if (error) {
      // Se erro é "not found" (PGRST116), significa que não há linha na tabela
      if (error.code === 'PGRST116' || error.message?.includes('No rows')) {
        console.warn(`getUserRole: Usuário ${id} não encontrado na tabela users, retornando 'user' como default`);
        return "user";
      }
      
      // Se erro é de RLS (PGRST301), também retorna 'user' como fallback
      if (error.code === 'PGRST301' || error.message?.includes('permission denied') || error.message?.includes('RLS')) {
        console.warn(`getUserRole: Erro de RLS ao buscar role do usuário ${id}, retornando 'user' como default`, error);
        return "user";
      }

      console.error("Erro ao buscar role do usuário:", error);
      return "user"; // Default para 'user' em caso de erro
    }

    if (!data) {
      console.warn(`getUserRole: Nenhum dado retornado para usuário ${id}, retornando 'user' como default`);
      return "user";
    }

    // Retorna a role encontrada ou 'user' como default
    const role = data.role as "admin" | "user";
    return role || "user";
  } catch (err) {
    console.error("Erro inesperado em getUserRole:", err);
    return "user"; // Default para 'user' em caso de exceção
  }
}

export async function signInWithEmail(email: string, password: string) {
  if (!supabase) {
    return {
      data: null,
      error: { message: "Supabase não está configurado" } as any,
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}

export async function signUpWithEmail(name: string, email: string, password: string) {
  if (!supabase) {
    return {
      data: null,
      error: { message: "Supabase não está configurado" } as any,
    };
  }

  // Cria usuário no Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { data: null, error };
  }

  const user = data.user;
  if (!user) {
    return { data: null, error: new Error("Usuário não retornado pelo Supabase") as any };
  }

  // Cria registro na tabela users com role = 'user' por padrão
  const { error: insertError } = await supabase.from("users").insert({
    id: user.id,
    email,
    name,
    role: "user",
  });

  if (insertError) {
    // Se erro é "duplicate key" (23505), significa que o usuário já existe (pode ter sido criado antes)
    if (insertError.code === '23505' || insertError.message?.includes('duplicate')) {
      console.warn("Usuário já existe na tabela users (provavelmente criado anteriormente), continuando...");
      // Continua mesmo assim, pois o usuário já existe
    } else {
      console.error("Erro ao inserir usuário na tabela users:", insertError);
      // Não bloqueia o cadastro se houver erro - o usuário pode logar mesmo sem linha na tabela users
      // (o getUserRole retornará 'user' como default)
      console.warn("⚠️ Continuando cadastro mesmo com erro na inserção da tabela users. O usuário poderá fazer login.");
    }
  } else {
    console.log("✅ Usuário inserido na tabela users com sucesso");
  }

  return { data, error: null };
}

export async function signOut() {
  if (!supabase) {
    return { error: { message: "Supabase não está configurado" } as any };
  }

  const { error } = await supabase.auth.signOut();
  if (error) console.error("Erro ao fazer logout:", error);
  return { error };
}
