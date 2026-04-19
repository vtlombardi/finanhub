'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import Link from 'next/link';
import Image from 'next/image';
import { listingsService, ListingData, ListingFeature, BusinessHour, ListingMedia } from '@/services/listings.service';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useAuth } from '@/features/auth/AuthProvider';
import { api } from '@/services/api.client';
import Cookies from 'js-cookie';
import { 
  ChevronLeft, Save, Upload, Plus, Trash2, Image as ImageIcon, 
  FileText, Globe, Mail, Phone, MapPin, DollarSign, Users as UsersIcon, 
  Clock, Calendar, Zap, Shield, Loader2, X, Play, Settings
} from 'lucide-react';
import styles from '@/styles/Dashboard.module.css';

// ─── Constants & Attribute Maps ──────────────────────────────────────────────

const FRANCHISE_ATTR_MAP = {
  franchiseName: '9089f494-1cf3-456e-a5ed-804cbe2ab718',
  initialInvestmentTotal: '6fdc6cc1-21de-46bc-9e44-4537a2920b2c',
  franchiseFee: 'e7fed46f-de1b-4888-a050-4b5034e35b02',
  averageEstimatedRevenue: '9d9f19fe-4e02-4042-b833-ad7ee4c81c44',
  estimatedPayback: 'eda486aa-4f0c-42c6-a61d-839d2592e8da',
  operationModel: 'd26f63d9-be9d-4c97-bbdb-787a5e469d13',
  royaltiesFee: 'c21a062f-8431-4651-b8cc-79ae44bf0d69',
  marketingFee: '68472c86-fe57-411b-a8a0-42fa3eff451f',
  supportOffered: '2e36b138-e308-4e0f-917a-9886a675e8b5',
  openedUnitsCount: '7e7d9a12-76a3-4d67-a362-199c7ced0ea9',
};

const STARTUP_ATTR_MAP = {
  startupStage: 'f6b28d7a-74a9-4b68-809d-0b1a0ed923af',
  targetSector: '13a45c6b-927e-4a0b-b9f2-2b9a0fd8a68b',
  businessModelType: '7f1dc759-f625-4a97-a139-101ef33b5fd7',
  fundingAmountRequested: '674e1d7f-c18c-449e-9d2a-3b4c5d6e7f8a',
  mrrCurrent: 'f7e2c0f2-ccfc-4f8f-b0c0-2974f637bc10',
};

const PREMIUM_ATTR_MAP = {
  revenueLtm: 'pr03-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2',
  roi: 'pr04-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2',
  valuationEstimated: 'pr05-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2',
  marginLiquida: 'pr06-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2',
  paybackEstimated: 'pr07-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2',
  growthHistory: 'pr08-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2',
  ebitdaPremium: 'pr09-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2',
  ticketMinimo: 'pr10-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2',
};

// ─── Components ──────────────────────────────────────────────────────────────

function FormSection({ title, children, icon: Icon, badge }: any) {
  return (
    <div className={styles.card} style={{ padding: 0, overflow: 'hidden', marginBottom: '32px' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {Icon && <Icon size={18} style={{ color: '#00b8b2' }} />} {title}
        </h3>
        {badge && <span className={`${styles.badge} ${styles.bGhost}`} style={{ fontSize: '10px' }}>{badge}</span>}
      </div>
      <div style={{ padding: '24px' }}>
        {children}
      </div>
    </div>
  );
}

function InputField({ label, error, ...props }: any) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
        {label}
      </label>
      <input 
        className={styles.bConfig}
        style={{ width: '100%', height: '44px', background: 'rgba(0,0,0,0.3)' }}
        {...props}
      />
      {error && <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'block' }}>{error}</span>}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function EditListingPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { show } = useNotificationStore();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  
  const { register, handleSubmit, reset, watch, control, setValue } = useForm<ListingData>({
    defaultValues: {
      features: [],
      media: [],
      businessHours: [
        { dayOfWeek: 1, openTime: '08:00', closeTime: '18:00' },
        { dayOfWeek: 2, openTime: '08:00', closeTime: '18:00' },
        { dayOfWeek: 3, openTime: '08:00', closeTime: '18:00' },
        { dayOfWeek: 4, openTime: '08:00', closeTime: '18:00' },
        { dayOfWeek: 5, openTime: '08:00', closeTime: '18:00' },
        { dayOfWeek: 6, openTime: '00:00', closeTime: '00:00' },
        { dayOfWeek: 0, openTime: '00:00', closeTime: '00:00' },
      ],
    }
  });

  const { fields: mediaFields, append: appendMedia, remove: removeMedia } = useFieldArray({
    control,
    name: "media"
  });

  useEffect(() => {
    const initializePage = async () => {
      const token = Cookies.get('finanhub.token');
      if (!token) { setLoading(false); return; }

      setLoading(true);
      try {
        const [cats, userCompanies] = await Promise.all([
          listingsService.listCategories(),
          api.get('/companies').then(res => res.data)
        ]);
        
        setCategories(cats);
        setCompanies(userCompanies);

        const isNew = id === 'new' || id === 'novo';

        if (!isNew) {
          const data = await listingsService.getById(id as string);
          const mappedData = { ...data };
          if (data.attrValues) {
            data.attrValues.forEach((av: any) => {
              let attrKey = Object.entries(FRANCHISE_ATTR_MAP).find(([k, id]) => id === av.attributeId)?.[0] ||
                            Object.entries(STARTUP_ATTR_MAP).find(([k, id]) => id === av.attributeId)?.[0] ||
                            Object.entries(PREMIUM_ATTR_MAP).find(([k, id]) => id === av.attributeId)?.[0];

              if (attrKey) {
                const isNumeric = [
                  'initialInvestmentTotal', 'franchiseFee', 'averageEstimatedRevenue', 'openedUnitsCount',
                  'fundingAmountRequested', 'mrrCurrent',
                  'revenueLtm', 'roi', 'valuationEstimated', 'marginLiquida', 'paybackEstimated', 'growthHistory', 'ebitdaPremium', 'ticketMinimo'
                ].includes(attrKey);
                (mappedData as any)[attrKey] = isNumeric ? av.valueNum : av.valueStr;
              }
            });
          }
          reset(mappedData);
        } else if (userCompanies?.length > 0) {
          setValue('companyId', userCompanies[0].id);
        }
      } catch (error) {
        show('Erro ao carregar dados necessários.', 'error');
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [id, reset, setValue, show]);

  const onSubmit = async (formData: ListingData) => {
    if (!formData.description) { show('Resumo é obrigatório.', 'error'); return; }
    if (!formData.companyId) {
      if (companies.length > 0) formData.companyId = companies[0].id;
      else { show('Workspace não selecionado.', 'error'); return; }
    }

    try {
      const dynamicAttrs: any[] = [];
      const catId = formData.categoryId || '';
      
      const maps: any = {
        FRANCHISE: ['803c2459-36d3-48d6-9ab0-ee82612a444d', '0a824561-3252-47e9-92ca-c12aa047ec54', 'c34d9b4e-8d9c-4f0c-b5e7-2643b55c5dc3', '77831699-f2de-4696-ac7f-5d7c48142738', 'aaf04626-e6bb-426b-9b9d-a0219a0462d6'],
        STARTUP: ['e788eb9e-42fc-498d-9cd8-c3dcb4037bf9'],
        PREMIUM: ['p7e8f9a0-b1c2-4d3e-8f9a-0b1c2d3e4f5a']
      };

      const processMap = (mapData: any, numericFields: string[]) => {
        Object.entries(mapData).forEach(([key, attrId]) => {
          const val = (formData as any)[key];
          if (val !== undefined && val !== '') {
            const isNumeric = numericFields.includes(key);
            dynamicAttrs.push({
              attributeId: attrId,
              valueStr: isNumeric ? String(val) : String(val),
              valueNum: isNumeric ? Number(val) : null
            });
          }
        });
      };

      if (maps.FRANCHISE.includes(catId)) processMap(FRANCHISE_ATTR_MAP, ['initialInvestmentTotal', 'franchiseFee', 'averageEstimatedRevenue', 'openedUnitsCount']);
      if (maps.STARTUP.includes(catId)) processMap(STARTUP_ATTR_MAP, ['fundingAmountRequested', 'mrrCurrent']);
      if (maps.PREMIUM.includes(catId)) processMap(PREMIUM_ATTR_MAP, ['revenueLtm', 'roi', 'valuationEstimated', 'marginLiquida', 'paybackEstimated', 'growthHistory', 'ebitdaPremium', 'ticketMinimo']);

      const finalData = { ...formData, attrValues: dynamicAttrs };

      if (id === 'new' || id === 'novo') {
        const res = await listingsService.create(finalData);
        show('Anúncio criado com sucesso!', 'success');
        router.push(`/dashboard/listings/${res.id}/edit`);
      } else {
        await listingsService.update(id as string, finalData);
        show('Sincronizado com sucesso!', 'success');
      }
    } catch (error) {
      show('Erro ao salvar anúncio operacional.', 'error');
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'IMAGE' | 'DOCUMENT', isCover = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await listingsService.uploadMedia(file);
      if (isCover) {
        const coverIdx = mediaFields.findIndex(m => m.isCover);
        if (coverIdx !== -1) removeMedia(coverIdx);
      }
      appendMedia({ url, mediaType: type, isCover });
    } catch {
      show('Erro no upload estratégico.', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  if (loading) return (
    <div style={{ display: 'grid', placeItems: 'center', height: '60vh' }}>
      <Loader2 className="w-10 h-10 text-[#00b8b2] animate-spin" />
    </div>
  );

  const coverImage = mediaFields.find(m => m.isCover);
  const galleryImages = mediaFields.filter(m => m.mediaType === 'IMAGE' && !m.isCover);
  const documents = mediaFields.filter(m => m.mediaType === 'DOCUMENT');

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Header */}
        <div className={styles.pageHeader}>
          <div>
            <Link href="/dashboard/listings" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 800, color: '#00b8b2', textTransform: 'uppercase', marginBottom: '8px' }}>
              <ChevronLeft size={14} /> Voltar para Ativos
            </Link>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {(id === 'new' || id === 'novo') ? 'Novo Ad-Opportunity' : `Editing Strategy: ${watch('title') || 'Listing'}`}
            </h1>
            <p>Refinamento técnico e configuração de inteligência para exposição no marketplace.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" className={styles.btnBrand} style={{ height: '48px', padding: '0 32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Save size={18} /> Sincronizar Alterações
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Context */}
          <div className="lg:col-span-8 space-y-8">
            
            <FormSection title="Configurações Estruturais" icon={Settings} badge="OBRIGATÓRIO">
               <InputField label="Identificador de Ativo / Título" {...register('title')} placeholder="Ex: Operação Têxtil Consolidada - Litoral Sul" required />
               <InputField label="High-Touch Subtitle (Resumo Executivo Curto)" {...register('subtitle')} placeholder="Ex: EBITDA R$ 2.4M, 15 anos de história, sem passivos." />
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Categoria de Alocação</label>
                    <select {...register('categoryId')} className={styles.bConfig} style={{ width: '100%', height: '44px', background: 'rgba(0,0,0,0.3)' }} required>
                      <option value="">Selecione...</option>
                      {categories.map(cat => <option key={cat.id} value={cat.id} style={{ background: '#020617' }}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Valor do Ativo (Valuation/Asking)</label>
                    <input type="number" step="0.01" {...register('price', { valueAsNumber: true })} className={styles.bConfig} style={{ width: '100%', height: '44px', background: 'rgba(0,0,0,0.3)' }} placeholder="R$ 0,00" />
                  </div>
               </div>

               <div style={{ marginTop: '24px' }}>
                 <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Descrição Técnica (Deep Analysis)</label>
                 <textarea 
                   {...register('description')} 
                   className={styles.bConfig} 
                   style={{ width: '100%', height: '120px', padding: '16px', background: 'rgba(0,0,0,0.3)', resize: 'none' }} 
                   placeholder="Descreva detalhadamente a oportunidade, infraestrutura, time e diferenciais competitivos..."
                 />
               </div>
            </FormSection>

            {/* Conditional Intelligence Sections */}
            {[
              '803c2459-36d3-48d6-9ab0-ee82612a444d',
              '0a824561-3252-47e9-92ca-c12aa047ec54',
              'c34d9b4e-8d9c-4f0c-b5e7-2643b55c5dc3'
            ].includes(watch('categoryId') || '') && (
              <FormSection title="HAYIA Intelligence: Franquias" icon={Zap}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="Nome da Marca" {...register('franchiseName' as any)} />
                  <InputField label="Investimento Total" type="number" {...register('initialInvestmentTotal' as any)} />
                  <InputField label="Taxa Franquia" type="number" {...register('franchiseFee' as any)} />
                  <InputField label="Payback Estimado" {...register('estimatedPayback' as any)} />
                </div>
              </FormSection>
            )}

            {/* Media & Data Room */}
            <FormSection title="Repositório de Mídia e Data Room" icon={ImageIcon}>
               <p style={{ fontSize: '12px', color: '#8fa6c3', marginBottom: '20px' }}>Upload de assets visuais e documentação técnica para o Data Room privativo.</p>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Gallery */}
                  <div className="md:col-span-2">
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>Galeria de Inteligência Visual</label>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                      {galleryImages.map((m, idx) => (
                        <div key={idx} style={{ position: 'relative', width: '100%', paddingBottom: '100%', borderRadius: '12px', overflow: 'hidden', background: '#000', border: '1px solid rgba(255,255,255,0.05)' }}>
                           <Image src={m.url} fill alt="Gallery" style={{ objectFit: 'cover' }} />
                           <button onClick={() => removeMedia(mediaFields.indexOf(m))} type="button" style={{ position: 'absolute', top: '4px', right: '4px', width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', display: 'grid', placeItems: 'center' }}>
                             <X size={14} />
                           </button>
                        </div>
                      ))}
                      <label style={{ width: '100%', paddingBottom: '100%', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                        <input type="file" hidden onChange={(e) => handleMediaUpload(e, 'IMAGE')} accept="image/*" />
                        <Plus size={20} style={{ color: '#00b8b2' }} />
                      </label>
                    </div>
                  </div>

                  {/* Cover */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>Capa Estratégica</label>
                    <div style={{ position: 'relative', width: '100%', paddingBottom: '60%', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)', background: coverImage ? '#000' : 'rgba(255,255,255,0.02)', overflow: 'hidden' }}>
                       {coverImage ? (
                         <>
                           <Image src={coverImage.url} fill alt="Cover" style={{ objectFit: 'cover' }} />
                           <label style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.4)', opacity: 0, cursor: 'pointer' }} className="hover:opacity-100 transition-opacity">
                              <input type="file" hidden onChange={(e) => handleMediaUpload(e, 'IMAGE', true)} accept="image/*" />
                              <Upload size={24} style={{ color: '#fff' }} />
                           </label>
                         </>
                       ) : (
                         <label style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                            <input type="file" hidden onChange={(e) => handleMediaUpload(e, 'IMAGE', true)} accept="image/*" />
                            <div style={{ textAlign: 'center' }}>
                               <Upload size={24} style={{ color: '#64748b', margin: '0 auto 8px' }} />
                               <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b' }}>CLICK TO UPLOAD</span>
                            </div>
                         </label>
                       )}
                    </div>
                  </div>
               </div>
            </FormSection>

          </div>

          {/* Side Context */}
          <div className="lg:col-span-4 space-y-8">
            <FormSection title="Status & Workspace" icon={Shield}>
               <div style={{ marginBottom: '20px' }}>
                 <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Visibilidade Operacional</label>
                 <select {...register('status')} className={styles.bConfig} style={{ width: '100%', height: '44px' }}>
                    <option value="ACTIVE" style={{ background: '#020617' }}>Ativo (Live)</option>
                    <option value="DRAFT" style={{ background: '#020617' }}>Rascunho (Privado)</option>
                    <option value="PENDING_AI_REVIEW" style={{ background: '#020617' }}>Em Auditoria HAYIA</option>
                    <option value="SUSPENDED" style={{ background: '#020617' }}>Suspenso</option>
                 </select>
               </div>
               
               <div style={{ marginBottom: '20px' }}>
                 <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Propriedade do Ativo</label>
                 <select {...register('companyId')} className={styles.bConfig} style={{ width: '100%', height: '44px' }}>
                    {companies.map(c => <option key={c.id} value={c.id} style={{ background: '#020617' }}>{c.name}</option>)}
                 </select>
               </div>

               <div className={styles.card} style={{ padding: '16px', background: 'rgba(99,102,241,0.05)', borderColor: 'rgba(99,102,241,0.1)', cursor: 'default' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                     <Info size={16} className="text-[#6366f1]" style={{ flexShrink: 0, marginTop: '2px' }} />
                     <p style={{ margin: 0, fontSize: '11px', lineHeight: 1.5, color: '#8fa6c3' }}>Ativos são auditados continuamente pela nossa IA para garantir a qualidade institucional da plataforma.</p>
                  </div>
               </div>
            </FormSection>

            <FormSection title="Audit Intel" icon={FileText}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {documents.map((doc, idx) => (
                    <div key={idx} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <FileText size={16} style={{ color: '#00b8b2' }} />
                          <span style={{ fontSize: '11px', color: '#eef6ff', fontWeight: 700 }} className="truncate">Técnico/Audit_{idx + 1}.pdf</span>
                       </div>
                       <button onClick={() => removeMedia(mediaFields.indexOf(doc))} type="button" style={{ color: '#ef4444', background: 'none', border: 'none', padding: '4px' }}><Trash2 size={14} /></button>
                    </div>
                  ))}
                  <label className={styles.btnGhost} style={{ width: '100%', borderStyle: 'dashed', height: '44px', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                     <input type="file" hidden onChange={(e) => handleMediaUpload(e, 'DOCUMENT')} accept=".pdf,.doc,.docx" />
                     <span style={{ fontSize: '10px', fontWeight: 800 }}>+ ANEXAR DOCUMENTO PRIVATIVO</span>
                  </label>
               </div>
            </FormSection>
          </div>
        </div>
      </form>

      {uploading && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 3000 }}>
          <div style={{ background: '#020617', border: '1px solid #00b8b2', borderRadius: '12px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
             <Loader2 size={16} className="text-[#00b8b2] animate-spin" />
             <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>Uploading intelligence asset...</span>
          </div>
        </div>
      )}
    </>
  );
}
