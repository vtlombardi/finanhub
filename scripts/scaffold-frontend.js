const fs = require('fs');
const path = require('path');

const baseApp = path.join(__dirname, 'frontend/src/app');

// Domains / Pages
const domains = [
  { path: '(auth)/login', content: 'export default function Login() { return <h1>Login / Cadastro Empresarial</h1>; }' },
  { path: '(dashboard)/dashboard', content: 'export default function Dashboard() { return <h1>Dashboard Privado B2B</h1>; }' },
  { path: '(public)/ads', content: 'export default function AdsMarketplace() { return <h1>Vitrine de Oportunidades</h1>; }' }
];

domains.forEach(d => {
  const fullPath = path.join(baseApp, d.path);
  fs.mkdirSync(fullPath, { recursive: true });
  fs.writeFileSync(path.join(fullPath, 'page.tsx'), d.content);
});

// API / Auth Layers
const servicesDir = path.join(__dirname, 'frontend/src/services');
const featuresDir = path.join(__dirname, 'frontend/src/features/auth');

fs.mkdirSync(servicesDir, { recursive: true });
fs.mkdirSync(featuresDir, { recursive: true });

fs.writeFileSync(path.join(servicesDir, 'auth.service.ts'), 
`export class AuthService {
  static async login(credentials: any) {
    console.log('[AUTH] Payload submetido');
    return { token: 'mock-jwt-token' };
  }
}
`);

fs.writeFileSync(path.join(featuresDir, 'AuthProvider.tsx'), 
`"use client";
import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext({});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
`);

console.log('Frontend Domains Generated');
