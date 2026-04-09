'use client';
import React from 'react';
import Link from 'next/link';

const AREAS = [
  { name: 'Comprar Empresa', slug: 'comprar-empresa', icon: 'https://finanhub.com.br/media/cache/resolve/small/custom/domain_1/image_files/sitemgr_photo_67.png' },
  { name: 'Vender Empresa', slug: 'vender-empresa', icon: 'https://finanhub.com.br/media/cache/resolve/small/custom/domain_1/image_files/sitemgr_photo_68.png' },
  { name: 'Franquias', slug: 'franquias', icon: 'https://finanhub.com.br/media/cache/resolve/small/custom/domain_1/image_files/sitemgr_photo_69.png' },
  { name: 'Investimentos', slug: 'investimentos', icon: 'https://finanhub.com.br/media/cache/resolve/small/custom/domain_1/image_files/sitemgr_photo_70.png' },
  { name: 'Agrobusiness', slug: 'agrobusiness', icon: 'https://finanhub.com.br/media/cache/resolve/small/custom/domain_1/image_files/sitemgr_photo_71.png' },
  { name: 'Imóveis', slug: 'imoveis', icon: 'https://finanhub.com.br/media/cache/resolve/small/custom/domain_1/image_files/sitemgr_photo_72.png' },
];

export const SiteAreas: React.FC = () => {
  return (
    <section className="categories-base" data-type="2" data-bg="white" has-gap="true">
      <div className="container">
        <div className="categories-header">
          <h2 className="heading">Áreas do site</h2>
        </div>
        <div className="categories-content">
          <div className="categories-list">
            {AREAS.map((area, i) => (
              <Link key={i} href={`/oportunidades/${area.slug}`} className="categories-item">
                <div className="picture">
                  <img src={area.icon} alt={area.name} />
                </div>
                <div className="info">
                  <div className="paragraph title">{area.name}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
