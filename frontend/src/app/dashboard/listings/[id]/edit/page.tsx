'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import Link from 'next/link';
import Image from 'next/image';
import AdminLayout from '@/components/admin/AdminLayout';
import { listingsService, ListingData, ListingFeature, BusinessHour, ListingMedia } from '@/services/listings.service';

// Estilos locais
import './edit-page.css';

export default function EditListingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
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

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const data = await listingsService.getById(id as string);
        reset(data);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar anúncio:', error);
        setLoading(false);
      }
    };

    if (id && id !== 'new') fetchListing();
    else setLoading(false);
  }, [id, reset]);

  const onSubmit = async (data: ListingData) => {
    try {
      if (id === 'new') {
        await listingsService.create(data);
        alert('Anúncio criado com sucesso!');
      } else {
        await listingsService.update(id as string, data);
        alert('Anúncio atualizado com sucesso!');
      }
      router.push('/dashboard/listings');
    } catch (error) {
      console.error('Erro ao salvar anúncio:', error);
      alert('Falha ao salvar anúncio. Verifique os campos obrigatórios.');
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
      alert('Erro ao fazer upload da imagem.');
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
      alert('Erro ao fazer upload da capa.');
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
      alert('Erro ao fazer upload do logo.');
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
      alert('Erro ao fazer upload do documento.');
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
                    <div className="form-group" style={{ position: 'relative' }}>
                      <label>Categorias</label>
                      <div className="category-tags-container" style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', border: '1px solid #ddd', padding: '10px', borderRadius: '4px', minHeight: '45px' }}>
                         {/* Mock de tags visual */}
                         <span className="tag-category">Tecnologia <i className="fa fa-times"></i></span>
                         <span className="tag-category">SaaS <i className="fa fa-times"></i></span>
                         <button type="button" className="btn btn-primary btn-xs pull-right" style={{ position: 'absolute', right: '15px', top: '35px' }}>Navegar <i className="fa fa-caret-down"></i></button>
                      </div>
                      <small className="text-muted">Selecione até 20 categorias</small>
                    </div>

                    <div className="row mt-3">
                       <div className="col-sm-6">
                          <label>Status</label>
                          <select {...register('status')} className="form-control">
                            <option value="ACTIVE">Ativo</option>
                            <option value="SUSPENDED">Suspenso</option>
                            <option value="DRAFT">Rascunho</option>
                          </select>
                       </div>
                       <div className="col-sm-6">
                          <label>ID da Empresa</label>
                          <input type="text" {...register('companyId')} className="form-control" />
                       </div>
                    </div>

                    <div className="form-group mt-3">
                      <label>Resumo (Max 250 caracteres)</label>
                      <textarea {...register('description')} className="form-control" rows={3} maxLength={250}></textarea>
                    </div>

                    <div className="form-group mt-3">
                       <label>Palavras-chave para a busca</label>
                       <input type="text" {...register('seoKeywords')} className="form-control" placeholder="Separe por vírgulas ou pressione Tab" />
                    </div>
                  </div>
                </div>

                <div className="panel panel-form">
                   <div className="panel-heading">Informações de Contato</div>
                   <div className="panel-body">
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
