'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, Building, FileText, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { ListingsService } from '@/features/listings/listings.service';

// Tipagem Estrita atrelada a engine nativa (Hook Form c/ Zod)
const listingSchema = z.object({
  title: z.string().min(5, 'O título precisa ter pelo menos 5 caracteres').max(100),
  description: z.string().min(20, 'Forneça uma descrição detalhada de no mínimo 20 letras.'),
  price: z.preprocess((v) => Number(v), z.number().positive('O valor deve ser positivo.').min(1000, 'Margem mínima imposta pelo banco é R$1.000')),
  categoryId: z.string().optional(),
});

interface ListingFormValues {
  title: string;
  description: string;
  price: number;
  categoryId?: string;
}

export default function NewListingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, formState: { errors } } = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema) as any,
    defaultValues: {
      price: 0
    }
  });

  const onSubmit = async (data: ListingFormValues) => {
    setIsSubmitting(true);
    try {
      // POST Híbrido: A API validará o JWT dinamicamente ao disparar.
      await ListingsService.createListing(data);
      setSuccess(true);
      
      // Simula UX premium transacional segurando a view e redirecionando
      setTimeout(() => {
        router.push('/dashboard/listings');
      }, 2000);
      
    } catch (error) {
      console.error('Falha de Transação M&A', error);
      // Futuro: Toast Erro
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <Link href="/dashboard/listings" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">
        <ArrowLeft size={16} className="mr-1" />
        Voltar para Painel
      </Link>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-slate-100 flex items-center gap-2">
            Lançar Novo Anúncio <span className="bg-indigo-500/20 text-indigo-400 text-xs px-2 py-0.5 rounded ml-2 uppercase font-bold tracking-wider hidden sm:inline-block">Draft Mode</span>
        </h1>
        <p className="text-slate-400 text-sm">O modelo criado será rebatido para as filas de Inteligência Artificial para aprovação prévia.</p>
      </div>

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-start gap-3">
            <div className="h-2 w-2 mt-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <div>
               <h3 className="font-medium text-emerald-300">Tese Registrada com Sucesso!</h3>
               <p className="text-emerald-500/80 text-sm mt-0.5">O registro foi enviado via Pipeline. Aguarde enquanto redirecionamos para seu painel de controle.</p>
            </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="glass-panel rounded-xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Camada Invisível bloqueando cliques se Loading */}
        {isSubmitting && <div className="absolute inset-0 z-10 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
            <span className="text-blue-400 font-semibold flex items-center gap-2"><div className="h-4 w-4 bg-blue-500 rounded-full animate-ping"></div>Processando...</span>
        </div>}

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300 flex items-center gap-2 block">
            <Building size={16} className="text-slate-500"/>  
            Título Público do Ativo
          </label>
          <input 
            {...register('title')} 
            className={`input-premium ${errors.title ? 'border-red-500/50 focus:ring-red-500' : ''}`}
            placeholder="Ex: SaaS B2B com ARR de R$2M..."
          />
          {errors.title && <p className="text-red-400 text-xs font-medium mt-1">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
           <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2 block">
                <DollarSign size={16} className="text-slate-500"/> Valuation Alvo (Mínimo BRL)
              </label>
              <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium tracking-wide">R$</span>
                <input 
                  type="number"
                  {...register('price')} 
                  className={`input-premium pl-12 font-mono ${errors.price ? 'border-red-500/50 focus:ring-red-500' : ''}`}
                  placeholder="0.00"
                />
              </div>
              {errors.price && <p className="text-red-400 text-xs font-medium mt-1">{errors.price.message}</p>}
           </div>

           <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2 block">
                Setorização (Optional)
              </label>
              <select {...register('categoryId')} className="input-premium appearance-none text-slate-300">
                  <option value="">Selecione um Setor Primário...</option>
                  <option value="tech">Tecnologia (Software/SaaS)</option>
                  <option value="industry">Indústria e Maquinário</option>
                  <option value="retail">Varejo e Franquias</option>
              </select>
           </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300 flex items-center gap-2 block">
             <FileText size={16} className="text-slate-500"/>
             Tese / Descrição Completa
          </label>
          <textarea 
            {...register('description')} 
            className={`input-premium min-h-[160px] resize-y ${errors.description ? 'border-red-500/50 focus:ring-red-500' : ''}`}
            placeholder="Descreva as fortalezas do negócio, balanço inicial, equipe, carteira de clientes..."
          />
          {errors.description && <p className="text-red-400 text-xs font-medium mt-1">{errors.description.message}</p>}
        </div>

        <div className="pt-4 border-t border-[#1e293b] flex justify-end">
            <button 
              type="submit" 
              disabled={isSubmitting || success}
              className={`btn-primary flex items-center gap-2 ${isSubmitting || success ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Save size={18} />
              Salvar Anúncio
            </button>
        </div>

      </form>
    </div>
  );
}
