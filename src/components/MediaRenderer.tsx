import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import YoutubePlayer from 'react-native-youtube-iframe';
import { WebView } from 'react-native-webview';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as VideoThumbnails from 'expo-video-thumbnails';
import * as WebBrowser from 'expo-web-browser';
import { Play, ExternalLink, Film } from 'lucide-react-native';

interface MediaRendererProps {
  mediaUrl?: string;
  text?: string;
}

// Robust regex patterns for URL parsing
const URL_REGEX = /(https?:\/\/[^\s]+)/gi;
const YOUTUBE_REGEX = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
const VIMEO_REGEX = /(?:vimeo\.com\/)(?:.*\/)?([0-9]+)/i;
const DIRECT_VIDEO_REGEX = /\.(mp4|mov|m3u8|webm)(\?.*)?$/i;
const IMAGE_REGEX = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;

// Native Expo Video Player Component using expo-video
const NativeExpoVideoPlayer: React.FC<{ videoUrl: string }> = ({ videoUrl }) => {
  const player = useVideoPlayer(videoUrl, (playerInstance) => {
    playerInstance.loop = false;
    playerInstance.play();
  });

  return (
    <View className="rounded-2xl overflow-hidden mb-3 border border-slate-800 bg-slate-950 shadow-lg">
      <VideoView
        style={{ width: '100%', height: 220 }}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
        nativeControls
      />
    </View>
  );
};

// Direct Video Cover extracting the actual first frame of the uploaded video using expo-video-thumbnails
const DirectVideoCover: React.FC<{ videoUrl: string; onPlay: () => void }> = ({ videoUrl, onPlay }) => {
  const [thumbUri, setThumbUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    VideoThumbnails.getThumbnailAsync(videoUrl, { time: 100 })
      .then(res => {
        if (isMounted && res?.uri) {
          setThumbUri(res.uri);
        }
      })
      .catch(err => {
        console.warn('Thumbnail extraction notice:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [videoUrl]);

  return (
    <TouchableOpacity
      onPress={onPlay}
      activeOpacity={0.85}
      className="relative rounded-2xl overflow-hidden mb-3 border border-slate-800 bg-slate-950 h-52 shadow-lg"
    >
      {thumbUri ? (
        <Image
          source={{ uri: thumbUri }}
          className="w-full h-full"
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View className="w-full h-full bg-slate-950 items-center justify-center">
          {loading ? (
            <ActivityIndicator size="small" color="#F59E0B" />
          ) : (
            <Film size={32} color="#64748B" />
          )}
        </View>
      )}

      <View className="absolute inset-0 bg-slate-950/40 items-center justify-center">
        <View className="bg-amber-500 p-4 rounded-full shadow-lg shadow-amber-500/50 flex-row items-center justify-center">
          <Play size={24} color="#0F172A" fill="#0F172A" className="ml-1" />
        </View>
        <View className="absolute bottom-3 left-3 bg-slate-950/80 border border-slate-800 px-3 py-1 rounded-full flex-row items-center">
          <Film size={12} color="#F59E0B" className="mr-1.5" />
          <Text className="text-amber-400 font-bold text-[10px] uppercase tracking-wider">Video Reel • Tap to Play</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const MediaRenderer: React.FC<MediaRendererProps> = ({ mediaUrl, text }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Extract all URLs from text or mediaUrl
  let targetUrl: string | undefined = mediaUrl;
  if (!targetUrl && text) {
    const matches = text.match(URL_REGEX);
    if (matches && matches.length > 0) {
      targetUrl = matches[0].replace(/[.,!?;:]+$/, '').trim();
    }
  }

  if (!targetUrl) return null;

  // 1. Check YouTube
  const ytMatch = targetUrl.match(YOUTUBE_REGEX);
  if (ytMatch && ytMatch[1]) {
    const youtubeId = ytMatch[1];
    const posterUrl = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;

    if (!isPlaying) {
      return (
        <TouchableOpacity
          onPress={() => setIsPlaying(true)}
          activeOpacity={0.85}
          className="relative rounded-2xl overflow-hidden mb-3 border border-slate-800 bg-slate-950 shadow-lg"
        >
          <Image
            source={{ uri: posterUrl }}
            className="w-full h-52"
            contentFit="cover"
            transition={200}
          />
          <View className="absolute inset-0 bg-slate-950/40 items-center justify-center">
            <View className="bg-amber-500 p-4 rounded-full shadow-lg shadow-amber-500/50 flex-row items-center justify-center">
              <Play size={24} color="#0F172A" fill="#0F172A" className="ml-1" />
            </View>
            <View className="absolute bottom-3 left-3 bg-slate-950/80 border border-slate-800 px-3 py-1 rounded-full flex-row items-center">
              <Film size={12} color="#F59E0B" className="mr-1.5" />
              <Text className="text-amber-400 font-bold text-[10px] uppercase">YouTube Video • Tap to Play</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <View className="rounded-2xl overflow-hidden mb-3 border border-slate-800 bg-slate-950 shadow-lg">
        <YoutubePlayer
          height={220}
          play={true}
          videoId={youtubeId}
          onChangeState={(state) => {
            if (state === 'ended') setIsPlaying(false);
          }}
        />
      </View>
    );
  }

  // 2. Check Vimeo
  const vimeoMatch = targetUrl.match(VIMEO_REGEX);
  if (vimeoMatch && vimeoMatch[1]) {
    const vimeoId = vimeoMatch[1];
    const embedHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
          <style>
            body { margin: 0; padding: 0; background-color: #0F172A; display: flex; align-items: center; justify-content: center; height: 100vh; }
            iframe { width: 100%; height: 100%; border: none; }
          </style>
        </head>
        <body>
          <iframe src="https://player.vimeo.com/video/${vimeoId}?autoplay=1" allow="autoplay; fullscreen" allowfullscreen></iframe>
        </body>
      </html>
    `;

    if (!isPlaying) {
      return (
        <TouchableOpacity
          onPress={() => setIsPlaying(true)}
          activeOpacity={0.85}
          className="relative rounded-2xl overflow-hidden mb-3 border border-slate-800 bg-slate-950 h-52 items-center justify-center shadow-lg"
        >
          <View className="bg-slate-900 border border-slate-800 p-4 rounded-2xl items-center">
            <View className="bg-amber-500/20 p-3 rounded-full mb-2">
              <Play size={24} color="#F59E0B" fill="#F59E0B" className="ml-0.5" />
            </View>
            <Text className="text-white font-bold text-xs">Vimeo Monologue Showcase</Text>
            <Text className="text-amber-400 text-[10px] font-semibold mt-1">Tap to Watch Video</Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <View className="rounded-2xl overflow-hidden mb-3 border border-slate-800 bg-slate-950 h-56 shadow-lg">
        <WebView
          source={{ html: embedHtml }}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          style={{ backgroundColor: '#0F172A' }}
        />
      </View>
    );
  }

  // 3. Direct Video File (MP4, MOV, WebM or Firebase storage video) using native expo-video and expo-video-thumbnails
  const isDirectVideo = DIRECT_VIDEO_REGEX.test(targetUrl) || targetUrl.includes('/o/videos') || targetUrl.includes('video');
  if (isDirectVideo) {
    if (!isPlaying) {
      return <DirectVideoCover videoUrl={targetUrl} onPlay={() => setIsPlaying(true)} />;
    }

    return <NativeExpoVideoPlayer videoUrl={targetUrl} />;
  }

  // 4. Image URL
  const isImage = IMAGE_REGEX.test(targetUrl) || (mediaUrl && !isDirectVideo && !ytMatch && !vimeoMatch);
  if (isImage) {
    return (
      <View className="rounded-2xl overflow-hidden mb-3 border border-slate-800 bg-slate-950 shadow-lg">
        <Image
          source={{ uri: targetUrl }}
          className="w-full h-52"
          contentFit="cover"
          transition={200}
        />
      </View>
    );
  }

  // 5. Generic External Web Link Card (with Domain Favicon & in-app browser trigger)
  let domain = 'external-link.com';
  try {
    const parsed = new URL(targetUrl);
    domain = parsed.hostname.replace(/^www\./, '');
  } catch(e){}

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

  const handleOpenLink = () => {
    try {
      WebBrowser.openBrowserAsync(targetUrl!);
    } catch(e){}
  };

  return (
    <TouchableOpacity
      onPress={handleOpenLink}
      activeOpacity={0.8}
      className="bg-slate-950 border border-slate-800/90 rounded-2xl p-3.5 mb-3 flex-row items-center justify-between shadow-inner"
    >
      <View className="flex-row items-center flex-1 mr-3">
        <Image
          source={{ uri: faviconUrl }}
          className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 mr-3"
          contentFit="cover"
        />
        <View className="flex-1">
          <Text className="text-amber-400 font-bold text-xs" numberOfLines={1}>
            {domain}
          </Text>
          <Text className="text-slate-400 text-[11px]" numberOfLines={1}>
            {targetUrl}
          </Text>
        </View>
      </View>
      <View className="bg-slate-900 border border-slate-800 p-2 rounded-xl">
        <ExternalLink size={16} color="#F59E0B" />
      </View>
    </TouchableOpacity>
  );
};
