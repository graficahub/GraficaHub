'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import Tabs from './Tabs'
import AuthForm from './AuthForm'

export default function AuthCard() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')

  return (
    <Card className="w-full max-w-md mx-auto">
      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
      <AuthForm mode={activeTab} />
    </Card>
  )
}



