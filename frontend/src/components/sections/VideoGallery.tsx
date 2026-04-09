'use client';
import React from 'react';

const VIDEOS = [
  { id: '1', title: 'Como funciona o Finanhub', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  { id: '2', title: 'Case de Sucesso: Empresa A', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  { id: '3', title: 'Dicas para Investidores', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
];

export const VideoGallery: React.FC = () => {
  return (
    <div className="video-gallery" data-columns="4" data-bg="base" has-gap="">
      <div className="container">
        <div className="video-header">
          <h2 className="heading h-4">Vídeos</h2>
        </div>
        <div className="video-list">
          <div className="video-item">
            <a href="https://youtu.be/mkggXE5e2yk?si=h1ZieSK2tsnvhr3W"
               target="_blank"
               className="video-picture"
               style={{ backgroundImage: 'url(https://img.youtube.com/vi/mkggXE5e2yk/0.jpg)' }}>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
