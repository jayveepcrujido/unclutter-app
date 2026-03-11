'use client';

import { useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../../lib/api';
import { useAuth } from '../../../hooks/useAuth';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current) return;
    
    const handleAuth = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');

      if (code && state) {
        effectRan.current = true;
        try {
          const data = await api.handleCallback(code, state);
          login({ 
            id: data.user_id, 
            email: data.email, 
            name: data.name
          }, data.access_token);
          router.push('/subscriptions');
        } catch (error) {
          console.error('Auth error:', error);
          alert('Authentication failed.');
          router.push('/');
        }
      }
    };

    handleAuth();
  }, [searchParams, router, login]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      <p className="text-text-secondary font-medium">Finishing setup...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-text-secondary font-medium">Loading...</p>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
