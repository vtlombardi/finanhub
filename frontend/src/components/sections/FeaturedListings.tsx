'use client';
import React, { useEffect, useState } from 'react';

interface Listing {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: string | null;
  city: string | null;
  state: string | null;
  category: { name: string; slug?: string };
  categories?: { name: string; slug: string }[];
  media?: { url: string; isCover: boolean }[];
}

const FALLBACK_LISTINGS: Listing[] = [
  {
    id: '1',
    slug: 'anuncio-exemplo',
    title: 'Anúncio Exemplo',
    description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus',
    price: null,
    city: null,
    state: null,
    category: { name: 'Compra e Venda de Empresas', slug: 'compra-e-venda-de-empresas' },
    categories: [
      { name: 'Compra e Venda de Empresas', slug: 'compra-e-venda-de-empresas' },
      { name: 'Investimentos', slug: 'investimentos' },
      { name: 'Franquias e Licenciamento', slug: 'franquias-e-licenciamento' },
    ],
    media: [{ url: 'https://finanhub.com.br/media/cache/small/custom/domain_1/image_files/sitemgr_photo_10.jpg', isCover: true }],
  },
  {
    id: '2',
    slug: 'anuncio-exemplo-4',
    title: 'Anúncio Exemplo 4',
    description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus b',
    price: null,
    city: null,
    state: null,
    category: { name: '' },
    media: [{ url: 'https://finanhub.com.br/media/cache/small/custom/domain_1/image_files/sitemgr_photo_28.jpg', isCover: true }],
  },
  {
    id: '3',
    slug: 'anuncio-exemplo-2',
    title: 'Anúncio Exemplo 2',
    description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus',
    price: null,
    city: null,
    state: null,
    category: { name: '' },
    media: [{ url: 'https://finanhub.com.br/media/cache/small/custom/domain_1/image_files/sitemgr_photo_16.jpg', isCover: true }],
  },
  {
    id: '4',
    slug: 'anuncio-exemplo-3',
    title: 'Anúncio Exemplo 3',
    description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus b',
    price: null,
    city: null,
    state: null,
    category: { name: '' },
    media: [{ url: 'https://finanhub.com.br/media/cache/small/custom/domain_1/image_files/sitemgr_photo_22.jpg', isCover: true }],
  },
];

export const FeaturedListings: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>(FALLBACK_LISTINGS);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/listings?limit=4&sort=newest`)
      .then(res => res.json())
      .then(data => {
        const items = data.data || [];
        if (items.length > 0) setListings(items);
      })
      .catch(() => {/* keep fallback */});
  }, []);

  return (
    <div
      className="cards-default"
      {...{ 'card-type': 'vertical-cards', 'card-module': 'listing', scrollable: 'false', 'mobile-columns': 'false' } as React.HTMLAttributes<HTMLDivElement>}
      data-type="business"
      data-bg="brand"
      {...{ 'has-gap': '' } as React.HTMLAttributes<HTMLDivElement>}
    >
      <div className="container">
        <div className="cards-header">
          <h2 className="heading h-4">Oportunidades em Destaque</h2>
        </div>
        <div className="cards-wrapper">
          <div className="cards-list">
            {listings.map((item) => (
              <div key={item.id} className="card" data-columns="4">
                <div className="picture">
                  <a href={`/oportunidades/${item.slug}`} className="picture-link">
                    <img
                      src={item.media?.find(m => m.isCover)?.url || `https://placehold.co/400x180/3e455e/fff?text=${encodeURIComponent(item.title)}`}
                      alt={item.title}
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/400x180/3e455e/fff?text=Anúncio`; }}
                    />
                  </a>
                </div>
                <div className="content">
                  <a href={`/oportunidades/${item.slug}`} className="title heading h-4">{item.title}</a>
                  {item.categories && item.categories.length > 0 && (
                    <div className="categories">
                      em{' '}
                      {item.categories.map((cat, i) => (
                        <React.Fragment key={cat.slug}>
                          <a href={`/oportunidades/${cat.slug}`} className="link">{cat.name}</a>
                          {i < item.categories!.length - 1 && ', '}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                  <div className="description">
                    <p className="paragraph">{item.description}</p>
                  </div>
                  <div className="reviews">
                    <div className="reviews-stars">
                      <i className="fa fa-star-o"></i>
                      <i className="fa fa-star-o"></i>
                      <i className="fa fa-star-o"></i>
                      <i className="fa fa-star-o"></i>
                      <i className="fa fa-star-o"></i>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
