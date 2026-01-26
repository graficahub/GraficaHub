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

export async function signUpWithEmail(
  name: string,
  email: string,
  password: string,
  cpfCnpj?: string,
  phone?: string,
  address?: string,
  cep?: string
) {
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

  // Atualiza (ou cria) registro na tabela users com dados básicos obrigatórios
  const { error: upsertError } = await supabase.from("users").upsert({
    id: user.id,
    email,
    name,
    cpf_cnpj: cpfCnpj ?? null,
    phone: phone ?? null,
    address: address ?? null,
    cep: cep ?? null,
    role: "user",
    receive_orders_enabled: false,
    dismiss_receive_orders_banner: false,
  }, { onConflict: 'id' });

  if (upsertError) {
    console.error("Erro ao atualizar usuário na tabela users:", upsertError);
    console.warn("⚠️ Continuando cadastro mesmo com erro na atualização da tabela users.");
  } else {
    console.log("✅ Usuário atualizado na tabela users com sucesso");
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
