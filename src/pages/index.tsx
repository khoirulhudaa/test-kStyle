import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { FaLaptop } from 'react-icons/fa';
import AppRoutes from '../router';

const queryClient = new QueryClient();

const Main = () => {
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 1000);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1000);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? (
    <section className='w-full h-screen overflow-hidden flex flex-col justify-center items-center text-lg font-semibold'>
      <FaLaptop className='mb-6 text-[120px]' />
      <p>Minimal lebar device 1000px</p>
    </section>
  ) : (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
    </QueryClientProvider>
  );
};

export default Main;