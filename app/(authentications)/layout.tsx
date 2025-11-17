import WelcomeCard from '@/components/ui/welcome-card'
import React from 'react'

const AuthenticationLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <WelcomeCard />
      {children}
    </div>
  )
}

export default AuthenticationLayout