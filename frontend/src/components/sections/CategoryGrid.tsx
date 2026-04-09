'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  imagePath?: string;
  iconClass?: string;
}

const DEFAULT_CATEGORIES = [
  { id: '1', name: 'Ativos e Estruturas', slug: 'ativos-e-estruturas', imagePath: 'https://finanhub.com.br/media/cache/resolve/small/custom/domain_1/image_files/sitemgr_photo_67.png' },
  { id: '2', name: 'Compra e Venda de Empresas', slug: 'compra-e-venda-de-empresas', imagePath: 'https://finanhub.com.br/media/cache/resolve/small/custom/domain_1/image_files/sitemgr_photo_68.png' },
  { id: '3', name: 'Divulgação e Parcerias', slug: 'divulgacao-e-parcerias', imagePath: 'https://finanhub.com.br/media/cache/resolve/small/custom/domain_1/image_files/sitemgr_photo_69.png' },
  { id: '4', name: 'Franquias e Licenciamento', slug: 'franquias-e-licenciamento', imagePath: 'https://finanhub.com.br/media/cache/resolve/small/custom/domain_1/image_files/sitemgr_photo_70.png' },
  { id: '5', name: 'Imoveis para Negócios', slug: 'imoveis-para-negocios', imagePath: 'https://finanhub.com.br/media/cache/resolve/small/custom/domain_1/image_files/sitemgr_photo_71.png' },
  { id: '6', name: 'Investimentos', slug: 'investimentos', imagePath: 'https://finanhub.com.br/media/cache/resolve/small/custom/domain_1/image_files/sitemgr_photo_72.png' },
  { id: '7', name: 'Oportunidades Premium', slug: 'oportunidades-premium', imagePath: 'https://finanhub.com.br/media/cache/resolve/small/custom/domain_1/image_files/sitemgr_photo_73.png' },
  { id: '8', name: 'Projetos e Startups', slug: 'projetos-e-startups', imagePath: 'https://finanhub.com.br/media/cache/resolve/small/custom/domain_1/image_files/sitemgr_photo_74.png' },
  { id: '9', name: 'Serviços e Consultoria', slug: 'servicos-e-consultoria', imagePath: 'https://finanhub.com.br/media/cache/resolve/small/custom/domain_1/image_files/sitemgr_photo_75.png' },
];

export const CategoryGrid: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/categories`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
           setCategories(data);
        } else {
           setCategories(DEFAULT_CATEGORIES);
        }
      })
      .catch(err => {
        console.error('Failed to fetch categories:', err);
        setCategories(DEFAULT_CATEGORIES);
      });
  }, []);

  return (
    <div className="categories-base" data-type="2" {...{ scrollable: "false" } as any} data-bg="base" {...{ "has-gap": "" } as any}>
      <div className="container">
        <div className="categories-header">
          <h2 className="heading h-4">Nossas Categorias</h2>
        </div>
        <div className="categories-content">
          <div className="categories-list categories-icon">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/oportunidades/${cat.slug}`} className="categories-item">
                <div className="picture">
                  {cat.iconClass ? (
                    <i className={cat.iconClass} style={{ fontSize: '24px', color: '#fff' }}></i>
                  ) : (
                    <img
                      src={cat.imagePath || `https://finanhub.com.br/media/cache/resolve/small/custom/domain_1/image_files/sitemgr_photo_74.png`}
                      alt={cat.name}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                </div>
                <div className="info">
                  <div className="paragraph title">{cat.name}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
