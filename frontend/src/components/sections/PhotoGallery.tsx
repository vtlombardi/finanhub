'use client';
import React from 'react';

const PARTNERS = [
  { name: 'Partner 1', logo: 'https://placehold.co/200x120/f5f5f5/aaa?text=Parceiro' },
  { name: 'Partner 2', logo: 'https://placehold.co/200x120/f5f5f5/aaa?text=Parceiro' },
  { name: 'Partner 3', logo: 'https://placehold.co/200x120/f5f5f5/aaa?text=Parceiro' },
  { name: 'Partner 4', logo: 'https://placehold.co/200x120/f5f5f5/aaa?text=Parceiro' },
];

export const PhotoGallery: React.FC = () => {
  return (
    <div className="photo-gallery" {...{ type: "carousel", "amount-images": "4" } as any} data-bg="base" has-gap="">
      <div className="container">
        <div className="photo-gallery-header">
          <h2 className="heading h-4">Parceiros Verificados</h2>
        </div>
        <div className="photo-gallery-list">
          <a href="https://finanhub.com.br/custom/domain_1/image_files/sitemgr_photo_76.jpeg" className="photo-item">
            <img src="https://finanhub.com.br/custom/domain_1/image_files/sitemgr_photo_76.jpeg" alt="" />
          </a>
          <a href="https://finanhub.com.br/custom/domain_1/image_files/sitemgr_photo_77.png" className="photo-item">
            <img src="https://finanhub.com.br/custom/domain_1/image_files/sitemgr_photo_77.png" alt="" />
          </a>
          <a href="https://finanhub.com.br/custom/domain_1/image_files/sitemgr_photo_78.jpeg" className="photo-item">
            <img src="https://finanhub.com.br/custom/domain_1/image_files/sitemgr_photo_78.jpeg" alt="" />
          </a>
          <a href="https://finanhub.com.br/custom/domain_1/image_files/sitemgr_photo_79.png" className="photo-item">
            <img src="https://finanhub.com.br/custom/domain_1/image_files/sitemgr_photo_79.png" alt="" />
          </a>
        </div>
      </div>
    </div>
  );
};
