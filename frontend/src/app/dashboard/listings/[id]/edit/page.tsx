'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import Link from 'next/link';
import Image from 'next/image';
import AdminLayout from '@/components/admin/AdminLayout';
import { listingsService, ListingData, ListingFeature, BusinessHour, ListingMedia } from '@/services/listings.service';
import { useNotificationStore } from '@/store/useNotificationStore';

// Estilos locais
import './edit-page.css';

export default function EditListingPage() {
  const { id } = useParams();
  const router = useRouter();
  const { show } = useNotificationStore();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  
  const { register, handleSubmit, reset, watch, control, setValue } = useForm<ListingData>({
    defaultValues: {
      features: [],
      media: [],
      companyId: 'default-company-id',
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

  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
    control,
    name: "features"
  });

  const { fields: hourFields } = useFieldArray({
    control,
    name: "businessHours"
  });

  const { fields: mediaFields, append: appendMedia, remove: removeMedia } = useFieldArray({
    control,
    name: "media"
  });

  // Mapeamento de Atributos de Franquia (IDs do Banco)
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
    trainingIncluded: '83381938-ac52-45c5-91f9-530778ceaa69',
    openedUnitsCount: '7e7d9a12-76a3-4d67-a362-199c7ced0ea9',
    idealFranchiseeProfile: '104c74ad-1959-44ec-a78b-d1b1f05fcf29',
    territorialExclusivity: 'de79f03c-4879-48ad-b907-271271dc4308',
    expansionRegion: 'd7b3229f-75b5-445e-bbd9-da4c339af624'
  };

  // Mapeamento de Atributos de Startups
  const STARTUP_ATTR_MAP = {
    startupStage: 'f6b28d7a-74a9-4b68-809d-0b1a0ed923af',
    targetSector: '13a45c6b-927e-4a0b-b9f2-2b9a0fd8a68b',
    fundingRound: 'a2b3c4d5-e6f7-4a8b-9c0d-1e2f3a4b5c6d',
    fundingAmountRequested: '674e1d7f-c18c-449e-9d2a-3b4c5d6e7f8a',
    equityOffered: '72b5c0e1-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    businessModelType: '7f1dc759-f625-4a97-a139-101ef33b5fd7',
    mrrCurrent: 'f7e2c0f2-ccfc-4f8f-b0c0-2974f637bc10',
    tamMarketSize: '1ee9080c-356b-4397-903a-b231a4a036cc',
    foundingTeamBrief: '468b3f3d-64b5-41bf-9659-77733c797e49',
    techStackBrief: '97668a61-a7cc-46fa-9cf9-f491697f3d53',
    validationPOCBrief: '6aac6bf0-8bfd-477e-b52a-1fb231f1dca1',
    startupProblem: 'c4d5a1f2-d627-4a08-b9d2-0b9a0ed9b149',
    startupSolution: '97df855b-ac35-4d73-a9a0-87cc6636d5e4',
    competitiveEdge: '524664ad-6900-4a7c-96b5-156e5446dab6',
    useOfCapital: 'cdad545d-2b67-49fc-9274-855bbc6bf7a0',
    growthPotentialBrief: 'f7efcf30-6a41-485b-b66d-dc5a59a40e68'
  };

  // Mapeamento de Atributos de Ativos e Estruturas
  const ASSET_ATTR_MAP = {
    assetType: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    conservationState: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    availability: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
    fabricationYear: 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a',
    productiveCapacity: 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b',
    usageHistory: 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c',
    financingPossibility: 'a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d',
    documentationStatus: 'b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e',
    includedItems: 'c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f',
    assetLocation: 'd0e1f2a3-b4c5-5d6e-7f8a-9b0c1d2e3f4a',
    technicalInspection: 'e1f2a3b4-c5d6-6e7f-8a9b-0c1d2e3f4a5b',
    warranty: 'a2b3c4d5-e6f7-4a8b-9c0d-1e2f3a4b5c6e',
    logisticsNote: 'b3c4d5e6-f7a8-4c9d-0e1f-2a3b4c5d6e7f',
    lastMaintenance: 'c4d5e6f7-a8b9-4d0e-1f2a-3b4c5d6e7f8a',
  };

  // Mapeamento de Atributos de Serviços e Consultoria
  const SERVICE_ATTR_MAP = {
    serviceType: 's1a2b3c4-d5e6-4f7g-8h9i-0j1k2l3m4n5o',
    expertiseArea: 's2a2b3c4-d5e6-4f7g-8h9i-0j1k2l3m4n5o',
    targetAudience: 's3a2b3c4-d5e6-4f7g-8h9i-0j1k2l3m4n5o',
    hiringModel: 's4a2b3c4-d5e6-4f7g-8h9i-0j1k2l3m4n5o',
    methodology: 's5a2b3c4-d5e6-4f7g-8h9i-0j1k2l3m4n5o',
    experienceTime: 's6a2b3c4-d5e6-4f7g-8h9i-0j1k2l3m4n5o',
    deliveryFormat: 's7a2b3c4-d5e6-4f7g-8h9i-0j1k2l3m4n5o',
    pricingModel: 's8a2b3c4-d5e6-4f7g-8h9i-0j1k2l3m4n5o',
    casesSuccess: 's9a2b3c4-d5e6-4f7g-8h9i-0j1k2l3m4n5o',
    certifications: 's10a2b3c4-d5e6-4f7g-8h9i-0j1k2l3m4n5o',
    expectedResults: 's11a2b3c4-d5e6-4f7g-8h9i-0j1k2l3m4n5o',
    differential: 's12a2b3c4-d5e6-4f7g-8h9i-0j1k2l3m4n5o',
    serviceScope: 's13a2b3c4-d5e6-4f7g-8h9i-0j1k2l3m4n5o',
    clientPortfolio: 's14a2b3c4-d5e6-4f7g-8h9i-0j1k2l3m4n5o',
  };

  // Mapeamento de Atributos de Imóveis para Negócios
  const REAL_ESTATE_ATTR_MAP = {
    propertyType: 're01-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2',
    zoning: 're02-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2',
    totalArea: 're03-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2',
    builtArea: 're04-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2',
    parkingSpaces: 're05-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2',
    infrastructureLevel: 're06-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2',
    strategicValue: 're07-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2',
    physicalStructure: 're08-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2',
    logisticsNote: 're09-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2',
    adaptationPossible: 're10-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2',
    negotiationTerms: 're11-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2',
    availability: 're12-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2',
    idealPurpose: 're13-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2',
  };

  // Mapeamento de Atributos de Oportunidades Premium
  const PREMIUM_ATTR_MAP = {
    premiumType: 'pr01-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2',
    executiveSummary: 'pr02-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2',
    revenueLtm: 'pr03-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2',
    roi: 'pr04-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2',
    valuationEstimated: 'pr05-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2',
    marginLiquida: 'pr06-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2',
    paybackEstimated: 'pr07-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2',
    growthHistory: 'pr08-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2',
    ebitdaPremium: 'pr09-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2',
    ticketMinimo: 'pr10-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2',
    dataRoomStatus: 'pr11-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2',
    confidentialityLevel: 'pr12-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2',
    operationStructure: 'pr13-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2',
    financialHistory: 'pr14-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2',
    growthStrategy: 'pr15-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2',
    idealInvestorProfile: 'pr16-b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2',
  };




  useEffect(() => {
    const fetchListing = async () => {
      try {
        const data = await listingsService.getById(id as string);
        
        // Mapeia attrValues de volta para os campos do formulário
        const mappedData = { ...data };
        if (data.attrValues) {
          data.attrValues.forEach((av: any) => {
            // Tenta mapear Franquias
            let attrKey = Object.entries(FRANCHISE_ATTR_MAP).find(([k, id]) => id === av.attributeId)?.[0];
            
            // Tenta mapear Startups
            if (!attrKey) {
              attrKey = Object.entries(STARTUP_ATTR_MAP).find(([k, id]) => id === av.attributeId)?.[0];
            }

            // Tenta mapear Ativos
            if (!attrKey) {
              attrKey = Object.entries(ASSET_ATTR_MAP).find(([k, id]) => id === av.attributeId)?.[0];
            }

            // Tenta mapear Serviços
            if (!attrKey) {
              attrKey = Object.entries(SERVICE_ATTR_MAP).find(([k, id]) => id === av.attributeId)?.[0];
            }

            // Tenta mapear Imóveis
            if (!attrKey) {
              attrKey = Object.entries(REAL_ESTATE_ATTR_MAP).find(([k, id]) => id === av.attributeId)?.[0];
            }

            // Tenta mapear Premium
            if (!attrKey) {
              attrKey = Object.entries(PREMIUM_ATTR_MAP).find(([k, id]) => id === av.attributeId)?.[0];
            }



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
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar anúncio:', error);
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const cats = await listingsService.listCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Erro ao buscar categorias:', err);
      }
    };

    fetchCategories();

    if (id && id !== 'new') fetchListing();
    else setLoading(false);
  }, [id, reset]);

  const onSubmit = async (formData: ListingData) => {
    try {
      // 1. Coleta atributos dinâmicos do formulário
      const dynamicAttrs: any[] = [];
      
      // Mapeia campos de franquia para attrValues se a categoria for compatível
      const isFranchiseCat = [
        '803c2459-36d3-48d6-9ab0-ee82612a444d', // Franquias e Licenciamento
        '0a824561-3252-47e9-92ca-c12aa047ec54', // Comprar Franquias
        'c34d9b4e-8d9c-4f0c-b5e7-2643b55c5dc3', // Vender Franquias
        '77831699-f2de-4696-ac7f-5d7c48142738', // Licenciamento de Produtos
        'aaf04626-e6bb-426b-9b9d-a0219a0462d6'  // Licenciamento de Marcas
      ].includes(formData.categoryId || '');

      if (isFranchiseCat) {
        Object.entries(FRANCHISE_ATTR_MAP).forEach(([key, attrId]) => {
          const val = (formData as any)[key];
          if (val !== undefined && val !== '') {
            const isNumeric = ['initialInvestmentTotal', 'franchiseFee', 'averageEstimatedRevenue', 'openedUnitsCount'].includes(key);
            dynamicAttrs.push({
              attributeId: attrId,
              valueStr: isNumeric ? String(val) : val,
              valueNum: isNumeric ? Number(val) : null
            });
          }
        });
      }

      // Mapeia campos de startup
      const isStartupCat = formData.categoryId === 'e788eb9e-42fc-498d-9cd8-c3dcb4037bf9';
      if (isStartupCat) {
        Object.entries(STARTUP_ATTR_MAP).forEach(([key, attrId]) => {
          const val = (formData as any)[key];
          if (val !== undefined && val !== '') {
            const isNumeric = ['fundingAmountRequested', 'mrrCurrent'].includes(key);
            dynamicAttrs.push({
              attributeId: attrId,
              valueStr: isNumeric ? String(val) : val,
              valueNum: isNumeric ? Number(val) : null
            });
          }
        });
      }

      // Mapeia campos de ativos
      const isAssetCat = formData.categoryId === '7c9b3a2e-5f1d-48c2-a9e0-81f9b3c4d5e6';
      if (isAssetCat) {
        Object.entries(ASSET_ATTR_MAP).forEach(([key, attrId]) => {
          const val = (formData as any)[key];
          if (val !== undefined && val !== '') {
            dynamicAttrs.push({
              attributeId: attrId,
              valueStr: String(val),
              valueNum: null
            });
          }
        });
      }

      // Mapeia campos de serviços
      const isServiceCat = [
        'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', // Principal
        'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b',
        'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c',
        'a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d',
        'b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e'
      ].includes(formData.categoryId);

      if (isServiceCat) {
        Object.entries(SERVICE_ATTR_MAP).forEach(([key, attrId]) => {
          const val = (formData as any)[key];
          if (val !== undefined && val !== '') {
            dynamicAttrs.push({
              attributeId: attrId,
              valueStr: String(val),
              valueNum: null
            });
          }
        });
      }

      // Mapeia campos de imóveis
      const isRealEstateCat = formData.categoryId === 'e8a9b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2';
      if (isRealEstateCat) {
        Object.entries(REAL_ESTATE_ATTR_MAP).forEach(([key, attrId]) => {
          const val = (formData as any)[key];
          if (val !== undefined && val !== '') {
            dynamicAttrs.push({
              attributeId: attrId,
              valueStr: String(val),
              valueNum: null
            });
          }
        });
      }

      // Mapeia campos de Premium
      const isPremiumCat = formData.categoryId === 'p7e8f9a0-b1c2-4d3e-8f9a-0b1c2d3e4f5a';
      if (isPremiumCat) {
        Object.entries(PREMIUM_ATTR_MAP).forEach(([key, attrId]) => {
          const val = (formData as any)[key];
          if (val !== undefined && val !== '') {
            const isNumeric = [
              'revenueLtm', 'roi', 'valuationEstimated', 'marginLiquida', 'paybackEstimated', 'growthHistory', 'ebitdaPremium', 'ticketMinimo'
            ].includes(key);
            dynamicAttrs.push({
              attributeId: attrId,
              valueStr: isNumeric ? String(val) : val,
              valueNum: isNumeric ? Number(val) : null
            });
          }
        });
      }



      const finalData = { ...formData, attrValues: dynamicAttrs };

      if (id === 'new') {
        const res = await listingsService.create(finalData);
        show('Anúncio criado com sucesso!', 'success');
        router.push(`/dashboard/listings/${res.id}/edit`);
      } else {
        await listingsService.update(id as string, finalData);
        show('Anúncio atualizado com sucesso!', 'success');
      }
    } catch (error) {
      console.error('Erro ao salvar anúncio:', error);
      show('Falha ao salvar anúncio. Verifique os campos obrigatórios.', 'error');
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await listingsService.uploadMedia(file);
      appendMedia({ url, mediaType: 'IMAGE', isCover: false });
    } catch {
      show('Erro ao fazer upload da imagem.', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await listingsService.uploadMedia(file);
      // Remove qualquer capa anterior e adiciona a nova
      const coverIdx = mediaFields.findIndex(m => m.isCover);
      if (coverIdx !== -1) removeMedia(coverIdx);
      appendMedia({ url, mediaType: 'IMAGE', isCover: true });
    } catch {
      show('Erro ao fazer upload da capa.', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await listingsService.uploadMedia(file);
      setValue('logoUrl', url);
    } catch {
      show('Erro ao fazer upload do logo.', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await listingsService.uploadMedia(file);
      appendMedia({ url, mediaType: 'DOCUMENT', isCover: false });
    } catch {
      show('Erro ao fazer upload do documento.', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  // Helpers para separar mídias por tipo
  const galleryImages = mediaFields.filter(m => m.mediaType === 'IMAGE' && !m.isCover);
  const coverImage = mediaFields.find(m => m.isCover);
  const attachments = mediaFields.filter(m => m.mediaType === 'DOCUMENT');

  if (loading) return <div className="p-10 text-center">Carregando formulário profissional...</div>;

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit(onSubmit)} className="form-content-blocked">
        
        {/* CABEÇALHO */}
        <section className="section-heading">
          <div className="section-heading-content">
            <Link href="/dashboard/listings" className="heading-back-button">
              <i className="fa fa-angle-left"></i> Anúncios
            </Link>
            <h1 className="section-heading-title">
              {id === 'new' ? 'Novo Anúncio' : `Editar ${watch('title') || 'Anúncio'}`}
            </h1>
          </div>
          <div className="section-heading-actions">
            <button type="submit" className="btn btn-primary action-save">
              Salvar alterações
            </button>
          </div>
        </section>

        <section className="row tab-options new-structure-form-block">
          <div className="container-fluid" style={{ padding: '20px' }}>
            <div className="row">
              
              {/* COLUNA ESQUERDA: DADOS */}
              <div className="col-md-7">
                
                <div className="form-group">
                  <label className="label-lg">Nome do Anúncio</label>
                  <input 
                    type="text" 
                    className="form-control input-lg" 
                    {...register('title')} 
                    placeholder="Ex: Minha Empresa de Tecnologia" 
                    required 
                  />
                </div>

                <div className="panel panel-form">
                  <div className="panel-heading">Informações Básicas</div>
                  <div className="panel-body">
                    <div className="row">
                       <div className="col-sm-12">
                          <label>Subtítulo (Complemento do Título)</label>
                          <input type="text" {...register('subtitle')} className="form-control" placeholder="Ex: Operação consolidada com 15 anos no mercado" />
                       </div>
                    </div>

                    <div className="form-group mt-3">
                      <label>Categoria Principal</label>
                      <select 
                        {...register('categoryId')} 
                        className="form-control"
                        required
                      >
                        <option value="">Selecione uma categoria...</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      <small className="text-muted">A categoria define quais indicadores serão exibidos no anúncio</small>
                    </div>

                    <div className="row mt-3">
                       <div className="col-sm-6">
                          <label>Status</label>
                          <select {...register('status')} className="form-control">
                            <option value="ACTIVE">Ativo</option>
                            <option value="PENDING_AI_REVIEW">Em Revisão</option>
                            <option value="FLAGGED">Necessita Ajustes</option>
                            <option value="SUSPENDED">Suspenso</option>
                            <option value="DRAFT">Rascunho</option>
                          </select>
                       </div>
                       <div className="col-sm-6">
                          <label>Valor do Negócio (Preço Publicado)</label>
                          <input type="number" step="0.01" {...register('price', { valueAsNumber: true })} className="form-control" placeholder="0.00" />
                       </div>
                    </div>

                    <div className="form-group mt-3">
                      <label>Resumo (Max 250 caracteres)</label>
                      <textarea {...register('description')} className="form-control" rows={3} maxLength={250}></textarea>
                    </div>

                    <div className="row mt-3">
                       <div className="col-sm-6">
                          <label>Slug (URL Amigável)</label>
                          <input type="text" {...register('slug')} className="form-control" placeholder="id-do-anuncio-titulo" />
                       </div>
                       <div className="col-sm-6">
                          <label>Palavras-chave SEO</label>
                          <input type="text" {...register('seoKeywords')} className="form-control" placeholder="venda, ti, curitiba" />
                       </div>
                    </div>
                  </div>
                </div>

                <div className="panel panel-form">
                   <div className="panel-heading">Informações de Contato</div>
                   <div className="panel-body">
                      {/* ... existing contact fields ... */}
                      <div className="row">
                        <div className="col-sm-6">
                           <label>E-mail Corporativo</label>
                           <input type="email" {...register('email')} className="form-control" />
                        </div>
                        <div className="col-sm-6">
                           <label>Website URL</label>
                           <input type="url" {...register('websiteUrl')} className="form-control" />
                        </div>
                      </div>
                      <div className="row mt-3">
                        <div className="col-sm-6">
                           <label>Telefone Principal</label>
                           <input type="tel" {...register('phonePrimary')} className="form-control" />
                        </div>
                        <div className="col-sm-6">
                           <label>Telefone Alternativo</label>
                           <input type="tel" {...register('phoneSecondary')} className="form-control" />
                        </div>
                      </div>
                      <div className="form-group mt-3">
                         <label>Logradouro / Endereço</label>
                         <input type="text" {...register('addressLine1')} className="form-control" />
                      </div>
                      <div className="row mt-3">
                         <div className="col-sm-4">
                            <label>Bairro</label>
                            <input type="text" {...register('neighborhood')} className="form-control" />
                         </div>
                         <div className="col-sm-4">
                            <label>Cidade</label>
                            <input type="text" {...register('city')} className="form-control" />
                         </div>
                         <div className="col-sm-4">
                            <label>Estado</label>
                            <input type="text" {...register('state')} className="form-control" />
                         </div>
                      </div>
                   </div>
                </div>

                 <div className="panel panel-form">
                    <div className="panel-heading">Indicadores de Negócio e Aquisição</div>
                    <div className="panel-body">
                       <div className="row">
                         <div className="col-sm-4">
                            <label>Faturamento Anual (R$)</label>
                            <input type="number" step="0.01" {...register('annualRevenue', { valueAsNumber: true })} className="form-control" />
                         </div>
                         <div className="col-sm-4">
                            <label>EBITDA (R$)</label>
                            <input type="number" step="0.01" {...register('ebitda', { valueAsNumber: true })} className="form-control" />
                         </div>
                         <div className="col-sm-4">
                            <label>Margem EBITDA (%)</label>
                            <input type="number" step="0.01" {...register('ebitdaMargin', { valueAsNumber: true })} className="form-control" />
                         </div>
                       </div>

                       <div className="row mt-3">
                         <div className="col-sm-4">
                            <label>Ticket Médio (R$)</label>
                            <input type="number" step="0.01" {...register('avgTicket', { valueAsNumber: true })} className="form-control" />
                         </div>
                         <div className="col-sm-4">
                            <label>Nº de Funcionários</label>
                            <input type="number" {...register('employeesCount', { valueAsNumber: true })} className="form-control" />
                         </div>
                         <div className="col-sm-4">
                            <label>Tempo de Mercado (Anos)</label>
                            <input type="number" {...register('marketTime', { valueAsNumber: true })} className="form-control" />
                         </div>
                       </div>

                       {/* SEÇÃO ESPECÍFICA: FRANQUIAS */}
                       {[
                         '803c2459-36d3-48d6-9ab0-ee82612a444d',
                         '0a824561-3252-47e9-92ca-c12aa047ec54',
                         'c34d9b4e-8d9c-4f0c-b5e7-2643b55c5dc3',
                         '77831699-f2de-4696-ac7f-5d7c48142738',
                         'aaf04626-e6bb-426b-9b9d-a0219a0462d6'
                       ].includes(watch('categoryId') || '') && (
                         <div className="franchise-special-fields mt-4 p-3" style={{ background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                           <h4 className="mb-3" style={{ fontSize: '14px', fontWeight: 'bold', color: '#00b8b2' }}>Dados da Franquia (Obrigatórios)</h4>
                           <div className="row">
                             <div className="col-sm-6">
                               <label>Nome da Marca/Franquia</label>
                               <input type="text" {...register('franchiseName' as any)} className="form-control" placeholder="Ex: Starbucks" />
                             </div>
                             <div className="col-sm-6">
                               <label>Investimento Inicial Total (R$)</label>
                               <input type="number" step="0.01" {...register('initialInvestmentTotal' as any)} className="form-control" />
                             </div>
                           </div>
                           <div className="row mt-3">
                             <div className="col-sm-4">
                               <label>Taxa de Franquia (R$)</label>
                               <input type="number" step="0.01" {...register('franchiseFee' as any)} className="form-control" />
                             </div>
                             <div className="col-sm-4">
                               <label>Faturamento Médio Mensal (R$)</label>
                               <input type="number" step="0.01" {...register('averageEstimatedRevenue' as any)} className="form-control" />
                             </div>
                             <div className="col-sm-4">
                               <label>Prazo de Retorno (Payback)</label>
                               <input type="text" {...register('estimatedPayback' as any)} className="form-control" placeholder="Ex: 18 a 24 meses" />
                             </div>
                           </div>
                           <div className="row mt-3">
                             <div className="col-sm-6">
                               <label>Modelo de Operação</label>
                               <input type="text" {...register('operationModel' as any)} className="form-control" placeholder="Ex: Quiosque, Loja de Rua" />
                             </div>
                             <div className="col-sm-3">
                               <label>Royalties (%)</label>
                               <input type="text" {...register('royaltiesFee' as any)} className="form-control" placeholder="Ex: 5% FB" />
                             </div>
                             <div className="col-sm-3">
                               <label>Fundo Marketing (%)</label>
                               <input type="text" {...register('marketingFee' as any)} className="form-control" placeholder="Ex: 2% FB" />
                             </div>
                           </div>
                           <div className="row mt-3">
                             <div className="col-sm-6">
                               <label>Suporte Oferecido</label>
                               <input type="text" {...register('supportOffered' as any)} className="form-control" placeholder="Ex: Consultoria de campo, SAF" />
                             </div>
                             <div className="col-sm-6">
                               <label>Treinamento Incluído?</label>
                               <input type="text" {...register('trainingIncluded' as any)} className="form-control" placeholder="Ex: Sim (Operacional e Gestão)" />
                             </div>
                           </div>
                           <div className="row mt-3">
                             <div className="col-sm-4">
                               <label>Nº de Unidades Ativas</label>
                               <input type="number" {...register('openedUnitsCount' as any)} className="form-control" />
                             </div>
                             <div className="col-sm-8">
                               <label>Exclusividade Territorial</label>
                               <input type="text" {...register('territorialExclusivity' as any)} className="form-control" placeholder="Ex: Raio de 5km de distância" />
                             </div>
                           </div>
                           <div className="form-group mt-3">
                             <label>Perfil Ideal do Franqueado</label>
                             <input type="text" {...register('idealFranchiseeProfile' as any)} className="form-control" />
                           </div>
                           <div className="form-group mt-3">
                             <label>Região de Expansão</label>
                             <input type="text" {...register('expansionRegion' as any)} className="form-control" placeholder="Ex: Todo o Brasil, Sul e Sudeste" />
                           </div>
                         </div>
                       )}

                       {/* SEÇÃO ESPECÍFICA: STARTUPS */}
                       {watch('categoryId') === 'e788eb9e-42fc-498d-9cd8-c3dcb4037bf9' && (
                         <div className="startup-special-fields mt-4 p-3" style={{ background: '#f5f8ff', borderRadius: '8px', border: '1px solid #d0d7e5' }}>
                           <h4 className="mb-3" style={{ fontSize: '14px', fontWeight: 'bold', color: '#1f6fff' }}>Dados Técnicos e Rodada (Obrigatórios)</h4>
                           
                           <div className="row">
                             <div className="col-sm-4">
                               <label>Estágio Atual</label>
                               <select {...register('startupStage' as any)} className="form-control">
                                 <option value="">Selecione...</option>
                                 <option value="Ideação">Ideação</option>
                                 <option value="MVP">MVP</option>
                                 <option value="Tração">Tração / Early Stage</option>
                                 <option value="Scale-up">Scale-up</option>
                               </select>
                             </div>
                             <div className="col-sm-4">
                               <label>Setor de Atuação</label>
                               <input type="text" {...register('targetSector' as any)} className="form-control" placeholder="Ex: Fintech, Edtech, Agtech" />
                             </div>
                             <div className="col-sm-4">
                               <label>Modelo de Negócio</label>
                               <input type="text" {...register('businessModelType' as any)} className="form-control" placeholder="Ex: SaaS, B2B, Marketplace" />
                             </div>
                           </div>

                           <div className="row mt-3">
                             <div className="col-sm-4">
                               <label>Rodada de Captação</label>
                               <input type="text" {...register('fundingRound' as any)} className="form-control" placeholder="Ex: Pre-seed, Seed, Bridge" />
                             </div>
                             <div className="col-sm-4">
                               <label>Valor Buscado (R$)</label>
                               <input type="number" step="0.01" {...register('fundingAmountRequested' as any)} className="form-control" />
                             </div>
                             <div className="col-sm-4">
                               <label>Equity Ofertado (%)</label>
                               <input type="text" {...register('equityOffered' as any)} className="form-control" placeholder="Ex: 10%, A negociar" />
                             </div>
                           </div>

                           <div className="row mt-3">
                             <div className="col-sm-6">
                               <label>MRR Atual (R$)</label>
                               <input type="number" step="0.01" {...register('mrrCurrent' as any)} className="form-control" />
                             </div>
                             <div className="col-sm-6">
                               <label>TAM (Market Size Total)</label>
                               <input type="text" {...register('tamMarketSize' as any)} className="form-control" placeholder="Ex: R$ 1.5 Bi" />
                             </div>
                           </div>

                           <div className="form-group mt-3">
                             <label>Problema que Resolve (Pain-point)</label>
                             <textarea {...register('startupProblem' as any)} className="form-control" rows={2}></textarea>
                           </div>

                           <div className="form-group mt-3">
                             <label>Sua Solução (Value Prop)</label>
                             <textarea {...register('startupSolution' as any)} className="form-control" rows={2}></textarea>
                           </div>

                           <div className="form-group mt-3">
                             <label>Diferencial Competitivo (Moat)</label>
                             <textarea {...register('competitiveEdge' as any)} className="form-control" rows={2}></textarea>
                           </div>

                           <div className="row mt-3">
                             <div className="col-sm-6">
                               <label>Time / Founders (Briefing)</label>
                               <input type="text" {...register('foundingTeamBrief' as any)} className="form-control" placeholder="Ex: 3 Founders, especialistas em..." />
                             </div>
                             <div className="col-sm-6">
                               <label>Stack Tecnológica</label>
                               <input type="text" {...register('techStackBrief' as any)} className="form-control" placeholder="Ex: AWS, React, Python" />
                             </div>
                           </div>

                           <div className="row mt-3">
                             <div className="col-sm-6">
                               <label>Validação / POC (Status)</label>
                               <input type="text" {...register('validationPOCBrief' as any)} className="form-control" placeholder="Ex: 5 pilotos rodando, MVP validado" />
                             </div>
                             <div className="col-sm-6">
                               <label>Potencial de Crescimento</label>
                               <input type="text" {...register('growthPotentialBrief' as any)} className="form-control" />
                             </div>
                           </div>

                           <div className="form-group mt-3">
                             <label>Destinação do Capital (Use of Funds)</label>
                             <input type="text" {...register('useOfCapital' as any)} className="form-control" placeholder="Ex: 60% tech, 40% marketing" />
                            </div>
                          </div>
                        )}
                                   {/* SEÇÃO ESPECÍFICA: ATIVOS E ESTRUTURAS */}
                        {watch('categoryId') === '7c9b3a2e-5f1d-48c2-a9e0-81f9b3c4d5e6' && (
                          <div className="asset-special-fields mt-4 p-3" style={{ background: '#fdfcf0', borderRadius: '8px', border: '1px solid #e9e5c5' }}>
                            <h4 className="mb-3" style={{ fontSize: '14px', fontWeight: 'bold', color: '#856404' }}>Especificações Técnicas do Ativo</h4>
                            
                            <div className="row">
                              <div className="col-sm-6">
                                <label>Tipo de Ativo / Modelo <span className="text-danger">*</span></label>
                                <input type="text" {...register('assetType' as any)} className="form-control" placeholder="Ex: Mercedes Axor 2544, Torno CNC, Galpão Industrial" />
                              </div>
                              <div className="col-sm-6">
                                <label>Localização (Cidade/UF) <span className="text-danger">*</span></label>
                                <input type="text" {...register('assetLocation' as any)} className="form-control" placeholder="Ex: Curitiba/PR" />
                              </div>
                            </div>

                            <div className="row mt-3">
                              <div className="col-sm-4">
                                <label>Ano de Fabricação <span className="text-danger">*</span></label>
                                <input type="text" {...register('fabricationYear' as any)} className="form-control" placeholder="Ex: 2018/2019" />
                              </div>
                              <div className="col-sm-4">
                                <label>Estado de Conservação <span className="text-danger">*</span></label>
                                <select {...register('conservationState' as any)} className="form-control">
                                  <option value="">Selecione...</option>
                                  <option value="Novo">Novo</option>
                                  <option value="Excelente">Excelente / Pouco Uso</option>
                                  <option value="Bom">Bom / Operacional</option>
                                  <option value="Regular">Regular / Precisa de Revisão</option>
                                </select>
                              </div>
                              <div className="col-sm-4">
                                <label>Disponibilidade <span className="text-danger">*</span></label>
                                <input type="text" {...register('availability' as any)} className="form-control" placeholder="Ex: Pronta entrega" />
                              </div>
                            </div>

                            <div className="row mt-3">
                              <div className="col-sm-6">
                                <label>Capacidade Produtiva / Técnica <span className="text-danger">*</span></label>
                                <input type="text" {...register('productiveCapacity' as any)} className="form-control" placeholder="Ex: 50 toneladas/dia" />
                              </div>
                              <div className="col-sm-6">
                                <label>Histórico de Uso (Horas/KM)</label>
                                <input type="text" {...register('usageHistory' as any)} className="form-control" placeholder="Ex: 5.000 horas" />
                              </div>
                            </div>

                            <div className="row mt-3">
                              <div className="col-sm-6">
                                <label>Laudo Técnico Disponível? <span className="text-danger">*</span></label>
                                <input type="text" {...register('technicalInspection' as any)} className="form-control" placeholder="Ex: Sim, assinado por engenheiro" />
                              </div>
                              <div className="col-sm-6">
                                <label>Status da Documentação / NF <span className="text-danger">*</span></label>
                                <input type="text" {...register('documentationStatus' as any)} className="form-control" placeholder="Ex: Quitado, Com NF" />
                              </div>
                            </div>

                            <div className="row mt-3">
                              <div className="col-sm-6">
                                <label>Última Manutenção / Revisão</label>
                                <input type="text" {...register('lastMaintenance' as any)} className="form-control" placeholder="Ex: Jan/2024" />
                              </div>
                              <div className="col-sm-6">
                                <label>Garantia</label>
                                <input type="text" {...register('warranty' as any)} className="form-control" placeholder="Ex: 6 meses motor e câmbio" />
                              </div>
                            </div>

                            <div className="form-group mt-3">
                              <label>Itens Inclusos no Pacote</label>
                              <textarea {...register('includedItems' as any)} className="form-control" rows={2} placeholder="Ex: Peças sobressalentes, ferramentas de manutenção"></textarea>
                            </div>

                            <div className="row mt-3">
                              <div className="col-sm-6">
                                <label>Possibilidade de Parcelamento?</label>
                                <input type="text" {...register('financingPossibility' as any)} className="form-control" />
                              </div>
                              <div className="col-sm-6">
                                <label>Nota Logística / Retirada</label>
                                <input type="text" {...register('logisticsNote' as any)} className="form-control" placeholder="Ex: Frete por conta do comprador" />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* SEÇÃO ESPECÍFICA: SERVIÇOS E CONSULTORIA */}
                        {[
                          'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', // Principal
                          'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', // Estratégica
                          'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', // Financeira
                          'a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d', // Operacionais
                          'b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e'  // Outsourcing
                        ].includes(watch('categoryId')) && (
                          <div className="service-special-fields mt-4 p-3" style={{ background: '#f0faff', borderRadius: '8px', border: '1px solid #c5e9f9' }}>
                            <h4 className="mb-3" style={{ fontSize: '14px', fontWeight: 'bold', color: '#0056b3' }}>Indicadores de Expertise e Escopo</h4>
                            
                            <div className="row">
                              <div className="col-sm-6">
                                <label>Tipo de Servico Oferecido <span className="text-danger">*</span></label>
                                <input type="text" {...register('serviceType' as any)} className="form-control" placeholder="Ex: Consultoria M&A, Auditoria Fiscal" />
                              </div>
                              <div className="col-sm-6">
                                <label>Area de Atuacao / Especialidade <span className="text-danger">*</span></label>
                                <input type="text" {...register('expertiseArea' as any)} className="form-control" placeholder="Ex: Financeiro, TI, Juridico" />
                              </div>
                            </div>

                            <div className="row mt-3">
                              <div className="col-sm-6">
                                <label>Público-Alvo <span className="text-danger">*</span></label>
                                <input type="text" {...register('targetAudience' as any)} className="form-control" placeholder="Ex: Middle Market, Startups Series A" />
                              </div>
                              <div className="col-sm-6">
                                <label>Modelo de Contratacao <span className="text-danger">*</span></label>
                                <input type="text" {...register('hiringModel' as any)} className="form-control" placeholder="Ex: Retainer, Projeto Fechado, Success Fee" />
                              </div>
                            </div>

                            <div className="row mt-3">
                              <div className="col-sm-6">
                                <label>Metodologia de Trabalho <span className="text-danger">*</span></label>
                                <input type="text" {...register('methodology' as any)} className="form-control" placeholder="Ex: Ágil, Waterfall, Framework Próprio" />
                              </div>
                              <div className="col-sm-6">
                                <label>Tempo de Experiencia / Autoridade <span className="text-danger">*</span></label>
                                <input type="text" {...register('experienceTime' as any)} className="form-control" placeholder="Ex: 15 anos de mercado" />
                              </div>
                            </div>

                            <div className="row mt-3">
                              <div className="col-sm-6">
                                <label>Formato de Entrega <span className="text-danger">*</span></label>
                                <input type="text" {...register('deliveryFormat' as any)} className="form-control" placeholder="Ex: On-site, Remoto, Híbrido" />
                              </div>
                              <div className="col-sm-6">
                                <label>Modelo de Precificacao <span className="text-danger">*</span></label>
                                <input type="text" {...register('pricingModel' as any)} className="form-control" placeholder="Ex: Valor Fixo, Hourly Rate" />
                              </div>
                            </div>

                            <div className="form-group mt-3">
                              <label>Diferenciais Competitivos</label>
                              <textarea {...register('differential' as any)} className="form-control" rows={2} placeholder="O que torna este serviço único no mercado?"></textarea>
                            </div>

                            <div className="form-group mt-3">
                              <label>Principais Clientes / Portfólio</label>
                              <textarea {...register('clientPortfolio' as any)} className="form-control" rows={2} placeholder="Liste alguns clientes ou setores atendidos"></textarea>
                            </div>

                            <div className="row mt-3">
                              <div className="col-sm-6">
                                <label>Resultados Esperados</label>
                                <input type="text" {...register('expectedResults' as any)} className="form-control" placeholder="Ex: Redução de custos em 20%" />
                              </div>
                              <div className="col-sm-6">
                                <label>Certificações / Selos</label>
                                <input type="text" {...register('certifications' as any)} className="form-control" placeholder="Ex: ISO 9001, GPTW" />
                              </div>
                            </div>

                            <div className="form-group mt-3">
                              <label>Escopo Detalhado da Entrega</label>
                              <textarea {...register('serviceScope' as any)} className="form-control" rows={3} placeholder="Descreva lo que está incluso no pacote de serviço"></textarea>
                            </div>
                            
                            <div className="form-group mt-3">
                              <label>Cases de Sucesso (Resumo)</label>
                              <textarea {...register('casesSuccess' as any)} className="form-control" rows={3} placeholder="Breve descrição de um caso real com resultado mensurável"></textarea>
                            </div>
                          </div>
                        )}

                        {watch('categoryId') === 'e8a9b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2' && (
                          <div className="real-estate-special-fields mt-4 p-3" style={{ background: '#f9f0ff', borderRadius: '8px', border: '1px solid #e9c5f9' }}>
                            <h4 className="mb-3" style={{ fontSize: '14px', fontWeight: 'bold', color: '#6b00b3' }}>Localização e Potencial Comercial</h4>
                            
                            <div className="row">
                              <div className="col-sm-6">
                                <label>Tipo de Imóvel <span className="text-danger">*</span></label>
                                <input type="text" {...register('propertyType' as any)} className="form-control" placeholder="Ex: Laje Corporativa, Galpão Industrial" />
                              </div>
                              <div className="col-sm-6">
                                <label>Zoneamento <span className="text-danger">*</span></label>
                                <input type="text" {...register('zoning' as any)} className="form-control" placeholder="Ex: ZERC-1, ZPI" />
                              </div>
                            </div>

                            <div className="row mt-3">
                              <div className="col-sm-4">
                                <label>Área Total (m²) <span className="text-danger">*</span></label>
                                <input type="text" {...register('totalArea' as any)} className="form-control" placeholder="Ex: 1250" />
                              </div>
                              <div className="col-sm-4">
                                <label>Área Construída (m²) <span className="text-danger">*</span></label>
                                <input type="text" {...register('builtArea' as any)} className="form-control" placeholder="Ex: 800" />
                              </div>
                              <div className="col-sm-4">
                                <label>Vagas <span className="text-danger">*</span></label>
                                <input type="text" {...register('parkingSpaces' as any)} className="form-control" placeholder="Ex: 25 Vagas" />
                              </div>
                            </div>

                            <div className="row mt-3">
                              <div className="col-sm-6">
                                <label>Nível de Infraestrutura <span className="text-danger">*</span></label>
                                <input type="text" {...register('infrastructureLevel' as any)} className="form-control" placeholder="Ex: Total (Geradores, Ar Central)" />
                              </div>
                              <div className="col-sm-6">
                                <label>Valor Estratégico <span className="text-danger">*</span></label>
                                <input type="text" {...register('strategicValue' as any)} className="form-control" placeholder="Ex: Eixo Faria Lima" />
                              </div>
                            </div>

                            <div className="form-group mt-3">
                              <label>Estrutura Física <span className="text-danger">*</span></label>
                              <textarea {...register('physicalStructure' as any)} className="form-control" rows={2} placeholder="Descreva pés-direitos, vãos livres, etc."></textarea>
                            </div>

                            <div className="form-group mt-3">
                              <label>Nota Logística <span className="text-danger">*</span></label>
                              <textarea {...register('logisticsNote' as any)} className="form-control" rows={2} placeholder="Acessos e modais de transporte"></textarea>
                            </div>

                            <div className="form-group mt-3">
                              <label>Possibilidade de Adaptação <span className="text-danger">*</span></label>
                              <textarea {...register('adaptationPossible' as any)} className="form-control" rows={2} placeholder="Flexibilidade de layout ou expansão"></textarea>
                            </div>

                            <div className="row mt-3">
                              <div className="col-sm-6">
                                <label>Termos de Negociação <span className="text-danger">*</span></label>
                                <input type="text" {...register('negotiationTerms' as any)} className="form-control" placeholder="Ex: Sale & Leaseback, Venda Direta" />
                              </div>
                              <div className="col-sm-6">
                                <label>Disponibilidade <span className="text-danger">*</span></label>
                                <input type="text" {...register('availability' as any)} className="form-control" placeholder="Ex: Imediata, 60 dias" />
                              </div>
                            </div>

                            <div className="form-group mt-3">
                              <label>Finalidade Ideal <span className="text-danger">*</span></label>
                              <input type="text" {...register('idealPurpose' as any)} className="form-control" placeholder="Ex: Sede Corporativa, Tech Hub" />
                            </div>
                          </div>
                        )}

                        {watch('categoryId') === 'p7e8f9a0-b1c2-4d3e-8f9a-0b1c2d3e4f5a' && (
                          <div className="premium-special-fields mt-4 p-4" style={{ background: 'linear-gradient(135deg, #f0f7ff 0%, #f9f0ff 100%)', borderRadius: '12px', border: '1px solid #d0e0f0' }}>
                            <h4 className="mb-4" style={{ fontSize: '15px', fontWeight: 'bold', color: '#0066cc', display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <i className="fa fa-star"></i> Oportunidade Premium: Dados Estratégicos e Financeiros
                            </h4>
                            
                            <div className="row">
                              <div className="col-sm-6">
                                <label>Tipologia Premium <span className="text-danger">*</span></label>
                                <select {...register('premiumType' as any)} className="form-control">
                                  <option value="">Selecione...</option>
                                  <option value="M&A / Fusões e Aquisições">M&A / Fusões e Aquisições</option>
                                  <option value="Private Equity">Private Equity</option>
                                  <option value="Venture Capital">Venture Capital</option>
                                  <option value="Operação Consolidada">Operação Consolidada</option>
                                  <option value="Ativo de Luxo">Ativo de Luxo</option>
                                </select>
                              </div>
                              <div className="col-sm-6">
                                <label>Valuation Estimado (R$) <span className="text-danger">*</span></label>
                                <input type="number" step="0.01" {...register('valuationEstimated' as any)} className="form-control" placeholder="Ex: 50000000" />
                              </div>
                            </div>

                            <div className="row mt-3">
                              <div className="col-sm-4">
                                <label>Faturamento LTM (R$)</label>
                                <input type="number" step="0.01" {...register('revenueLtm' as any)} className="form-control" />
                              </div>
                              <div className="col-sm-4">
                                <label>EBITDA (R$)</label>
                                <input type="number" step="0.01" {...register('ebitdaPremium' as any)} className="form-control" />
                              </div>
                              <div className="col-sm-4">
                                <label>Margem Líquida (%)</label>
                                <input type="number" step="0.01" {...register('marginLiquida' as any)} className="form-control" />
                              </div>
                            </div>

                            <div className="row mt-3">
                              <div className="col-sm-4">
                                <label>ROI Estimado (%)</label>
                                <input type="number" step="0.01" {...register('roi' as any)} className="form-control" />
                              </div>
                              <div className="col-sm-4">
                                <label>Payback (meses)</label>
                                <input type="number" {...register('paybackEstimated' as any)} className="form-control" />
                              </div>
                              <div className="col-sm-4">
                                <label>Crescimento Histórico (% a.a.)</label>
                                <input type="number" step="0.1" {...register('growthHistory' as any)} className="form-control" />
                              </div>
                            </div>

                            <div className="row mt-3">
                              <div className="col-sm-6">
                                <label>Ticket de Investimento Mínimo (R$)</label>
                                <input type="number" step="0.01" {...register('ticketMinimo' as any)} className="form-control" />
                              </div>
                              <div className="col-sm-6">
                                <label>Estrutura da Operação</label>
                                <input type="text" {...register('operationStructure' as any)} className="form-control" placeholder="Ex: Majoritário, Minoritário, Asset Deal" />
                              </div>
                            </div>

                            <div className="row mt-3">
                              <div className="col-sm-6">
                                <label>Status do Data Room (VDR)</label>
                                <select {...register('dataRoomStatus' as any)} className="form-control">
                                  <option value="Não Iniciado">Não Iniciado</option>
                                  <option value="Em Estruturação">Em Estruturação</option>
                                  <option value="Completo e Auditado">Completo e Auditado</option>
                                  <option value="Disponível sob NDA">Disponível sob NDA</option>
                                </select>
                              </div>
                              <div className="col-sm-6">
                                <label>Nível de Confidencialidade</label>
                                <select {...register('confidentialityLevel' as any)} className="form-control">
                                  <option value="Padrão">Padrão</option>
                                  <option value="Moderado">Moderado</option>
                                  <option value="Rigoroso (Blind Service)">Rigoroso (Blind Service)</option>
                                  <option value="Máximo (Somente presencial)">Máximo (Somente presencial)</option>
                                </select>
                              </div>
                            </div>

                            <div className="form-group mt-3">
                              <label>Sumário Executivo (Tese de Investimento)</label>
                              <textarea {...register('executiveSummary' as any)} className="form-control" rows={3} placeholder="Descreva os highlights do negócio para atrair investidores qualificados"></textarea>
                            </div>

                            <div className="form-group mt-3">
                              <label>Histórico Financeiro e Auditorias</label>
                              <textarea {...register('financialHistory' as any)} className="form-control" rows={2} placeholder="Ex: 5 anos de DRE auditada pela Big Four"></textarea>
                            </div>

                            <div className="form-group mt-3">
                              <label>Estratégia de Crescimento (Uso dos Recursos)</label>
                              <textarea {...register('growthStrategy' as any)} className="form-control" rows={2} placeholder="Onde o capital será alocado para gerar escala?"></textarea>
                            </div>

                            <div className="form-group mt-3">
                              <label>Perfil Ideal de Investidor</label>
                              <input type="text" {...register('idealInvestorProfile' as any)} className="form-control" placeholder="Ex: Fundo de Private Equity, Player Estratégico do Setor" />
                            </div>
                          </div>
                        )}

                        {watch('categoryId') === 'b1c2d3e4-f5a6-4b7c-8d9e-0f1a2b3c4d5e' && (
                          <div className="partnership-special-fields mt-4 p-4" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #f0fdfa 100%)', borderRadius: '12px', border: '1px solid #d1fae5' }}>
                            <h4 className="mb-4" style={{ fontSize: '15px', fontWeight: 'bold', color: '#047857', display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <i className="fa fa-handshake-o"></i> Divulgação e Parcerias: Indicadores Estratégicos
                            </h4>
                            
                            <div className="row">
                              <div className="col-sm-6">
                                <label>Tipo de Parceria <span className="text-danger">*</span></label>
                                <input type="text" {...register('partnershipType' as any)} className="form-control" placeholder="Ex: Co-Branding, Canal de Vendas" />
                              </div>
                              <div className="col-sm-6">
                                <label>Objetivo Principal <span className="text-danger">*</span></label>
                                <input type="text" {...register('partnershipObjective' as any)} className="form-control" placeholder="Ex: Expansão de Base, Autoridade" />
                              </div>
                            </div>

                            <div className="row mt-3">
                              <div className="col-sm-6">
                                <label>O que Oferece (Oferta) <span className="text-danger">*</span></label>
                                <input type="text" {...register('offeringDescription' as any)} className="form-control" placeholder="Ex: Base 50k Leads, Blog corporativo" />
                              </div>
                              <div className="col-sm-6">
                                <label>O que Busca <span className="text-danger">*</span></label>
                                <input type="text" {...register('seekingDescription' as any)} className="form-control" placeholder="Ex: Tecnologia SaaS ou Marca Complementar" />
                              </div>
                            </div>

                            <div className="row mt-3">
                              <div className="col-sm-6">
                                <label>Segmento de Atuação <span className="text-danger">*</span></label>
                                <input type="text" {...register('partnershipSegment' as any)} className="form-control" placeholder="Ex: Fintech, Martech" />
                              </div>
                              <div className="col-sm-6">
                                <label>Alcance Estimado / Audience <span className="text-danger">*</span></label>
                                <input type="text" {...register('audienceReach' as any)} className="form-control" placeholder="Ex: 100k views/mês, Decisores B2B" />
                              </div>
                            </div>

                            <div className="form-group mt-3">
                              <label>Canais Disponíveis</label>
                              <input type="text" {...register('channelsAvailable' as any)} className="form-control" placeholder="Ex: Email, Redes Sociais, Eventos Presenciais" />
                            </div>

                            <div className="form-group mt-3">
                              <label>Formato de Colaboração / Modelo <span className="text-danger">*</span></label>
                              <textarea {...register('partnershipFormat' as any)} className="form-control" rows={2} placeholder="Descreva como a parceria funciona operacionalmente"></textarea>
                            </div>

                            <div className="form-group mt-3">
                              <label>Diferencial Competitivo da Aliança</label>
                              <textarea {...register('companyDifferentials' as any)} className="form-control" rows={2} placeholder="Por que ser parceiro desta marca?"></textarea>
                            </div>

                            <div className="form-group mt-3">
                              <label>Resultados Esperados (KPIs da Aliança)</label>
                              <textarea {...register('expectedResults' as any)} className="form-control" rows={2} placeholder="Quais metas pretendem alcançar juntos?"></textarea>
                            </div>
                          </div>
                        )}



                       <hr className="mt-4 mb-4" />

                      <div className="row">
                        <div className="col-sm-6">
                           <label>Modelo de Receita</label>
                           <input type="text" {...register('revenueModel')} className="form-control" placeholder="Ex: Recorrente (SaaS), Venda Direta" />
                        </div>
                        <div className="col-sm-6">
                           <label>Base de Clientes (Qtd)</label>
                           <input type="number" {...register('clientBaseCount', { valueAsNumber: true })} className="form-control" />
                        </div>
                      </div>

                      <div className="form-group mt-3">
                         <label>Método de Valuation</label>
                         <input type="text" {...register('valuationMethod')} className="form-control" placeholder="Ex: Múltiplo de EBITDA, Fluxo de Caixa Descontado" />
                      </div>

                      <div className="form-group mt-3">
                         <label>Motivo da Venda</label>
                         <textarea {...register('reasonForSale')} className="form-control" rows={2} placeholder="Descreva brevemente o motivo da saída ou busca por sócio"></textarea>
                      </div>

                      <div className="form-group mt-3">
                         <label>Estrutura da Operação</label>
                         <textarea {...register('operationStructure')} className="form-control" rows={2} placeholder="Ex: Venda de 100% das cotas, Busca de sócio investidor para 30%"></textarea>
                      </div>

                      <div className="form-group mt-3">
                         <label>Perfil do Comprador Ideal</label>
                         <input type="text" {...register('buyerProfile')} className="form-control" placeholder="Ex: Investidor Estratégico, Fundo de Venture Capital" />
                      </div>

                      <div className="form-group mt-3">
                         <label>Próximos Passos</label>
                         <textarea {...register('nextSteps')} className="form-control" rows={2} placeholder="Ex: Assinatura de NDA, Envio de Teaser Detalhado"></textarea>
                      </div>

                      <div className="form-group mt-3">
                         <label>Nota de Confidencialidade</label>
                         <input type="text" {...register('confidentialityNote')} className="form-control" placeholder="Ex: Informações sujeitas a acordo de confidencialidade" />
                      </div>
                   </div>
                </div>

                <div className="panel panel-form">
                   <div className="panel-heading">Diferenciais e Comodidades</div>
                   <div className="panel-body">
                      {featureFields.map((field, index) => (
                        <div key={field.id} className="row mb-3 align-items-end">
                          <div className="col-sm-4">
                            <label>Ícone (FontAwesome)</label>
                            <input {...register(`features.${index}.iconClass` as const)} className="form-control" placeholder="fa-wifi" />
                          </div>
                          <div className="col-sm-6">
                            <label>Descrição</label>
                            <input {...register(`features.${index}.name` as const)} className="form-control" placeholder="Wi-Fi Gratuito" />
                          </div>
                          <div className="col-sm-2">
                             <button type="button" onClick={() => removeFeature(index)} className="btn btn-danger btn-sm"><i className="fa fa-trash"></i></button>
                          </div>
                        </div>
                      ))}
                      <button type="button" onClick={() => appendFeature({ name: '', iconClass: 'fa-check' })} className="btn btn-primary btn-sm">
                        + Adicionar Diferencial
                      </button>
                   </div>
                </div>

                <div className="panel panel-form">
                   <div className="panel-heading">Horário de Funcionamento</div>
                   <div className="panel-body">
                      {hourFields.map((field, index) => (
                        <div key={field.id} className="row mb-2 border-bottom pb-2">
                          <div className="col-sm-4 font-weight-bold">{dayNames[field.dayOfWeek]}</div>
                          <div className="col-sm-4"><input type="time" {...register(`businessHours.${index}.openTime` as const)} className="form-control" /></div>
                          <div className="col-sm-4"><input type="time" {...register(`businessHours.${index}.closeTime` as const)} className="form-control" /></div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>

              {/* COLUNA DIREITA: MÍDIAS (OTIMIZADAS COM NEXT/IMAGE) */}
              <div className="col-md-5">
                
                {/* Galeria de Fotos */}
                <div className="panel panel-form">
                   <div className="panel-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      Galeria de Fotos
                      <label className="btn btn-primary btn-sm" style={{ marginBottom: 0, cursor: 'pointer' }}>
                        {uploading ? 'Enviando...' : 'Adicionar arquivo'}
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleGalleryUpload} disabled={uploading} />
                      </label>
                   </div>
                   <div className="panel-body">
                      <p className="text-center text-muted small">Clique e arraste uma imagem para reordená-la.</p>
                      
                      <div className="gallery-list" style={{ marginTop: '20px' }}>
                        {galleryImages.map((photo, idx) => (
                          <div key={photo.id} className="gallery-item" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px', border: '1px solid #eee', marginBottom: '10px', borderRadius: '4px', backgroundColor: '#fff' }}>
                            <i className="fa fa-bars" style={{ color: '#ccc' }}></i>
                            <Image 
                              src={photo.url} 
                              alt="Thumbnail" 
                              width={60} 
                              height={45} 
                              style={{ objectFit: 'cover', borderRadius: '2px' }} 
                            />
                            <div style={{ flex: 1, fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis' }}>imagem_{idx+1}.jpg</div>
                            <div className="actions" style={{ display: 'flex', gap: '8px' }}>
                              <i className="fa fa-star-o" style={{ color: '#ccc' }}></i>
                              <i className="fa fa-pencil" style={{ color: '#337ab7' }}></i>
                              <i className="fa fa-trash-o" style={{ color: '#d9534f', cursor: 'pointer' }} onClick={() => removeMedia(mediaFields.indexOf(photo))}></i>
                            </div>
                          </div>
                        ))}
                      </div>

                      {galleryImages.length === 0 && (
                        <div className="gallery-dropzone" style={{ border: '2px dashed #ddd', padding: '40px', textAlign: 'center', color: '#aaa' }}>
                           <i className="fa fa-picture-o fa-3x" style={{ marginBottom: '10px' }}></i>
                           <p>Arraste arquivos aqui para enviar</p>
                        </div>
                      )}
                   </div>
                </div>

                {/* Imagem de Capa */}
                <div className="panel panel-form">
                   <div className="panel-heading">Imagem de Capa</div>
                   <div className="panel-body">
                      <div className="media-actions" style={{ display: 'flex', gap: '5px', marginBottom: '15px', justifyContent: 'flex-end' }}>
                         <label className="btn btn-primary btn-xs" style={{ marginBottom: 0, cursor: 'pointer' }}>
                           {uploading ? '...' : 'Adicionar arquivo'}
                           <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverUpload} disabled={uploading} />
                         </label>
                         <button type="button" className="btn btn-danger btn-xs" onClick={() => { const idx = mediaFields.findIndex(m => m.isCover); if (idx !== -1) removeMedia(idx); }}><i className="fa fa-trash"></i></button>
                      </div>
                      <div className="preview-cover" style={{ width: '100%', height: '100px', backgroundColor: '#f5f5f5', borderRadius: '4px', border: '1px solid #ddd', overflow: 'hidden', position: 'relative' }}>
                         {coverImage ? (
                           <Image 
                              src={coverImage.url} 
                              alt="Capa" 
                              fill 
                              style={{ objectFit: 'cover' }} 
                            />
                         ) : (
                           <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>Sem imagem de capa</div>
                         )}
                      </div>
                   </div>
                </div>

                {/* Imagem de Logo */}
                <div className="panel panel-form">
                   <div className="panel-heading">Imagem de Logo</div>
                   <div className="panel-body">
                      <div className="media-actions" style={{ display: 'flex', gap: '5px', marginBottom: '15px', justifyContent: 'flex-end' }}>
                         <label className="btn btn-primary btn-xs" style={{ marginBottom: 0, cursor: 'pointer' }}>
                           {uploading ? '...' : 'Adicionar arquivo'}
                           <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} disabled={uploading} />
                         </label>
                         <button type="button" className="btn btn-danger btn-xs" onClick={() => setValue('logoUrl', '')}><i className="fa fa-trash"></i></button>
                      </div>
                      <div className="preview-logo" style={{ display: 'flex', justifyContent: 'center' }}>
                         <Image 
                            src={watch('logoUrl') || 'https://finanhub.com.br/sitemgr/assets/img/handshake-icon.png'} 
                            alt="Logo" 
                            width={120} 
                            height={120} 
                            style={{ objectFit: 'contain', border: '1px solid #eee', padding: '10px' }} 
                          />
                      </div>
                      <input type="hidden" {...register('logoUrl')} />
                   </div>
                </div>

                {/* Vídeo */}
                <div className="panel panel-form">
                   <div className="panel-heading">Vídeo</div>
                   <div className="panel-body">
                      <div className="video-preview" style={{ marginBottom: '15px', backgroundColor: '#000', height: '180px', borderRadius: '4px', overflow: 'hidden' }}>
                         {watch('videoUrl') ? (
                           <iframe width="100%" height="100%" src={watch('videoUrl')?.replace('watch?v=', 'embed/')} frameBorder="0" allowFullScreen></iframe>
                         ) : (
                            <div style={{ color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>URL do vídeo não configurada</div>
                         )}
                      </div>
                      <div className="form-group">
                         <label>URL do Vídeo (YouTube/Vimeo)</label>
                         <input type="text" {...register('videoUrl')} className="form-control" />
                      </div>
                   </div>
                </div>

                {/* Anexar um Arquivo */}
                <div className="panel panel-form">
                   <div className="panel-heading">Anexar um Arquivo</div>
                   <div className="panel-body">
                      {attachments.map((file, idx) => (
                        <div key={file.id} className="file-item" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px', border: '1px solid #eee', marginBottom: '10px', borderRadius: '4px' }}>
                           <i className="fa fa-file-text-o fa-2x" style={{ color: '#999' }}></i>
                           <div style={{ flex: 1 }}>
                              <div className="font-weight-bold" style={{ fontSize: '12px' }}>Anexo {idx+1}</div>
                              <small className="text-primary text-truncate d-block" style={{ maxWidth: '150px' }}>arquivo_anexo.pdf</small>
                           </div>
                           <i className="fa fa-trash-o" style={{ color: '#d9534f', cursor: 'pointer' }} onClick={() => removeMedia(mediaFields.indexOf(file))}></i>
                        </div>
                      ))}
                      <label className="btn btn-primary btn-block" style={{ cursor: 'pointer' }}>
                        {uploading ? 'Enviando...' : '+ Adicionar arquivo'}
                        <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleDocumentUpload} disabled={uploading} />
                      </label>
                   </div>
                </div>

              </div>
            </div>
          </div>
        </section>
      </form>
    </AdminLayout>
  );
}
