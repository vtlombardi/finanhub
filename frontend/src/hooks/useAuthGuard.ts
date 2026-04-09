import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export function useAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('finanhub.token');

    if (!token) {
      router.push('/login');
    }
  }, [router]);
}
