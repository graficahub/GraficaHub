/**
 * Página de Registro - GraficaHub
 * 
 * Fluxo de cadastro:
 * 1. Usuário preenche todos os dados básicos (nome, email, senha, CPF/CNPJ, telefone, endereço, CEP)
 * 2. Chama signUpWithEmail do Supabase Auth (apenas email e senha)
 * 3. Atualiza perfil em public.users com os dados coletados
 * 4. Em caso de sucesso, redireciona para /dashboard (ou /admin se for admin)
 * 5. Em caso de erro, exibe mensagem amigável
 * 
 * Design reutiliza componentes e estilos do GraficaHub existente.
 */

'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { signUpWithEmail, getUserRole, updateUserProfile } from "@/lib/auth";
import { supabase } from '@/lib/supabaseClient'
import { maskCpfCnpj, maskPhone, maskCEP } from '@/lib/utils/masks'
import { validateCpfCnpj, validatePhone, validateCep, validateAddress, removeMask } from '@/lib/utils/validation'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [cpfCnpj, setCpfCnpj] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [cep, setCep] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }

    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido'
    }

    // Valida CPF/CNPJ
    const cpfCnpjValidation = validateCpfCnpj(cpfCnpj)
    if (!cpfCnpjValidation.isValid) {
      newErrors.cpfCnpj = cpfCnpjValidation.error || 'CPF/CNPJ inválido'
    }

    // Valida telefone
    const phoneValidation = validatePhone(phone)
    if (!phoneValidation.isValid) {
      newErrors.phone = phoneValidation.error || 'Telefone inválido'
    }

    // Valida endereço
    const addressValidation = validateAddress(address)
    if (!addressValidation.isValid) {
      newErrors.address = addressValidation.error || 'Endereço inválido'
    }

    // Valida CEP
    const cepValidation = validateCep(cep)
    if (!cepValidation.isValid) {
      newErrors.cep = cepValidation.error || 'CEP inválido'
    }

    if (!password.trim()) {
      newErrors.password = 'Senha é obrigatória'
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log("Enviando formulário de REGISTRO", { email, name });

      // Remove máscaras antes de salvar
      const cpfCnpjCleaned = removeMask(cpfCnpj)
      const phoneCleaned = removeMask(phone)
      const cepCleaned = removeMask(cep)

      // Passo 1: Cria usuário no Auth (sem tocar em public.users)
      const { data, error } = await signUpWithEmail(
        email.trim(),
        password
      );

      if (error || !data?.user) {
        console.error("Erro Supabase registro", error);
        // Mensagens de erro amigáveis
        let errorMessage = 'Erro ao criar conta. Tente novamente.';
        
        if (error?.message?.includes('User already registered')) {
          errorMessage = 'Este email já está cadastrado. Faça login ou use outro email.';
        } else if (error?.message?.includes('Password')) {
          errorMessage = 'A senha não atende aos requisitos de segurança.';
        } else {
          errorMessage = error?.message || errorMessage;
        }

        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      const userId = data.user?.id;
      if (!userId) {
        console.error("❌ Registro: userId não encontrado após signUp");
        setError('Erro inesperado ao obter usuário.');
        setIsLoading(false);
        return;
      }

      console.log("✅ Cadastro bem-sucedido no Supabase Auth");
      console.log("🔍 UserId obtido:", userId);
      console.log("⏳ Aguardando trigger criar registro em public.users e sessão estar disponível...");

      // Passo 2: Aguarda o trigger criar o registro e a sessão estar disponível
      // O trigger handle_new_auth_user cria o registro automaticamente
      // Tentamos atualizar o perfil, mas se falhar, o usuário pode completar depois no dashboard
      let profileUpdated = false;
      let attempts = 0;
      const maxAttempts = 3;

      while (!profileUpdated && attempts < maxAttempts) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Delay crescente

        console.log(`📝 Tentativa ${attempts} de atualizar perfil do usuário...`);
        const { error: updateError } = await updateUserProfile(
          name.trim(),
          email.trim(),
          cpfCnpjCleaned,
          phoneCleaned,
          address.trim(),
          cepCleaned
        );

        if (!updateError) {
          console.log("✅ Perfil atualizado com sucesso");
          profileUpdated = true;
        } else {
          console.warn(`⚠️ Tentativa ${attempts} falhou:`, updateError);
          if (attempts < maxAttempts) {
            console.log("🔄 Tentando novamente...");
          }
        }
      }

      // Passo 3: Log do resultado do update (não bloqueia o fluxo)
      if (!profileUpdated) {
        console.warn("⚠️ Não foi possível atualizar perfil automaticamente. Usuário pode completar depois no dashboard.");
      } else {
        console.log("✅ Perfil atualizado com sucesso");
      }

      // Passo 4: Busca role
      let role: "admin" | "user" = "user"; // Default para 'user'
      
      try {
        role = await getUserRole(userId);
        console.log("✅ Role obtida:", role);
      } catch (err) {
        console.error("⚠️ Erro ao buscar role (continuando com default 'user'):", err);
        // Continua com role = 'user' (já definido como default)
      }

      // Passo 5: Redireciona sempre para dashboard (ou admin se for admin)
      // Não bloqueia acesso por perfil incompleto - usuário pode completar depois
      const redirectPath = role === "admin" ? "/admin" : "/dashboard";
      console.log(`🚀 Redirecionando para: ${redirectPath}`);

      setIsLoading(false); // Desativa loading antes de redirecionar
      
      try {
        router.replace(redirectPath);
      } catch (routerError) {
        console.error("❌ Erro ao redirecionar, usando window.location:", routerError);
        // Fallback para window.location se router falhar
        if (typeof window !== 'undefined') {
          window.location.href = redirectPath;
        }
      }
    } catch (err) {
      console.error("Erro inesperado no registro:", err);
      setError("Erro inesperado ao criar conta.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleChange = (field: string, value: string) => {
    if (field === 'name') {
      setName(value)
    } else if (field === 'email') {
      setEmail(value)
    } else if (field === 'cpfCnpj') {
      const masked = maskCpfCnpj(value)
      setCpfCnpj(masked)
    } else if (field === 'phone') {
      const masked = maskPhone(value)
      setPhone(masked)
    } else if (field === 'address') {
      setAddress(value)
    } else if (field === 'cep') {
      const masked = maskCEP(value)
      setCep(masked)
    } else if (field === 'password') {
      setPassword(value)
    }

    // Limpa erro do campo quando o usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    if (error) {
      setError(null)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden">

        {/* Container principal centralizado */}
        <div className="relative z-10 w-full max-w-md flex flex-col items-center justify-center gap-6">
          {/* Logo e subtexto */}
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-wide">
              GraficaHub
            </h1>
            <p className="text-sm md:text-base text-slate-400">
              Crie sua conta para começar.
            </p>
          </div>

          {/* Card de registro */}
          <Card className="w-full p-6">
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Exibe erro geral */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <Input
                label="Nome"
                type="text"
                placeholder="Seu nome ou nome da empresa"
                value={name}
                onChange={(e) => handleChange('name', e.target.value)}
                error={errors.name}
                autoComplete="name"
                required
                disabled={isLoading}
              />

              <Input
                label="Email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={errors.email}
                autoComplete="email"
                required
                disabled={isLoading}
              />

              <Input
                label="CPF/CNPJ"
                type="text"
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                value={cpfCnpj}
                onChange={(e) => handleChange('cpfCnpj', e.target.value)}
                error={errors.cpfCnpj}
                required
                disabled={isLoading}
              />

              <Input
                label="Telefone"
                type="tel"
                placeholder="(00) 00000-0000"
                value={phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                error={errors.phone}
                required
                disabled={isLoading}
              />

              <Input
                label="Endereço"
                type="text"
                placeholder="Rua, número, complemento"
                value={address}
                onChange={(e) => handleChange('address', e.target.value)}
                error={errors.address}
                required
                disabled={isLoading}
              />

              <Input
                label="CEP"
                type="text"
                placeholder="00000-000"
                value={cep}
                onChange={(e) => handleChange('cep', e.target.value)}
                error={errors.cep}
                required
                disabled={isLoading}
              />

              <Input
                label="Senha"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => handleChange('password', e.target.value)}
                error={errors.password}
                autoComplete="new-password"
                required
                disabled={isLoading}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? 'Criando conta...' : 'Criar conta'}
                </Button>
              </div>

              {/* Link para login */}
              <div className="pt-2 text-center">
                <p className="text-xs text-slate-400">
                  Já tem uma conta?{' '}
                  <Link
                    href="/login"
                    className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-200 font-medium"
                  >
                    Fazer login
                  </Link>
                </p>
              </div>
            </motion.form>
          </Card>
        </div>
      </main>
    </div>
  )
}

