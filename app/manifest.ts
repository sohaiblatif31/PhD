import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PhD Tracker',
    short_name: 'PhD',
    description: 'Deadlines, documents, supervisors and funding for PhD applications in Canada.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f4f5f1',
    theme_color: '#17213a',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
