import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex">
      {/* Sidebar fixada de 64 widths */}
      <Sidebar />
      
      {/* Flex row absorvendo o offset do sidebar (ml-64 se acopla ao w-64 max width) */}
      <div className="flex-1 ml-64 flex flex-col">
        <Header />
        
        {/* Main Workspace content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#0b1121]/50 p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
