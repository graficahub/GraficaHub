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

export async function getUserRole(userId?: string): Promise<"admin" | "user" | null> {
  if (!supabase) {
    console.error("Supabase não está configurado");
    return null;
  }

  try {
    let id = userId;

    // Se não vier id, pega da sessão atual
    if (!id) {
      const user = await getCurrentUser();
      if (!user) return null;
      id = user.id;
    }

    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao buscar role do usuário:", error);
      return null;
    }

    if (!data) return null;

    return (data.role as "admin" | "user") ?? null;
  } catch (err) {
    console.error("Erro inesperado em getUserRole:", err);
    return null;
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
    console.error("Erro ao inserir usuário na tabela users:", insertError);
    return { data: null, error: insertError };
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
