import React, { useState } from 'react';
import { Play, X, ExternalLink } from 'lucide-react';

interface YouTubePreviewProps {
  url: string;
  title?: string;
}

export function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function parseYouTubeUrls(text: string): { text: string; videoIds: string[] } {
  const urlRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11}))/gi;
  const matches = text.match(urlRegex) || [];
  const videoIds: string[] = [];

  matches.forEach((url) => {
    const id = extractYouTubeId(url);
    if (id && !videoIds.includes(id)) {
      videoIds.push(id);
    }
  });

  return { text, videoIds };
}

export const YouTubePreviewCard: React.FC<YouTubePreviewProps> = ({ url, title }) => {
  const videoId = extractYouTubeId(url);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!videoId) return null;

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div className="mt-2.5 rounded-xl border border-[#d9e3f6] bg-white overflow-hidden shadow-xs hover:shadow-md transition-all max-w-sm">
      {!isPlaying ? (
        <div className="relative group cursor-pointer" onClick={() => setIsPlaying(true)}>
          <img
            src={thumbnailUrl}
            alt={title || 'YouTube Video Thumbnail'}
            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-slate-900/30 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[#ea580c] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Play size={22} className="ml-1 fill-white" />
            </div>
          </div>
          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-900/80 text-white text-[10px] font-semibold font-geist">
            YouTube
          </span>
        </div>
      ) : (
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title={title || 'YouTube video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
          <button
            type="button"
            onClick={() => setIsPlaying(false)}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-slate-900 transition-colors z-10"
            title="Close video"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="p-3 bg-[#f8f9ff] flex items-center justify-between gap-2 border-t border-[#eff4ff]">
        <span className="text-xs font-bold text-[#121c2a] truncate font-display">
          {title || 'Watch Video Demo'}
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-[11px] font-semibold text-[#00647c] hover:underline flex items-center gap-1 shrink-0 font-geist"
        >
          <span>Open</span>
          <ExternalLink size={11} />
        </a>
      </div>
    </div>
  );
};
