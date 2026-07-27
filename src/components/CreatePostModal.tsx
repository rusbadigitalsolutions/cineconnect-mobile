import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { X, Image as ImageIcon, Video as VideoIcon } from 'lucide-react-native';
import { pickMediaAsync, uploadMediaToStorage } from '../lib/mediaPicker';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (postData: { text: string; category: 'Trending' | 'All Gists' | 'Casting Updates'; mediaUrl?: string }) => Promise<void>;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ visible, onClose, onSubmit }) => {
  const [text, setText] = useState('');
  const [category, setCategory] = useState<'Trending' | 'All Gists' | 'Casting Updates'>('All Gists');
  const [mediaAsset, setMediaAsset] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const handlePickMedia = async (type: 'image' | 'video') => {
    const asset = await pickMediaAsync(type);
    if (asset) {
      setMediaAsset(asset);
    }
  };

  const handlePost = async () => {
    if (!text.trim()) return;
    setUploading(true);
    try {
      let mediaUrl: string | undefined = undefined;
      if (mediaAsset?.uri) {
        mediaUrl = await uploadMediaToStorage(mediaAsset.uri, 'posts', mediaAsset.base64);
      }
      await onSubmit({
        text: text.trim(),
        category,
        mediaUrl
      });
      setText('');
      setMediaAsset(null);
      onClose();
    } catch (e) {
      console.error('Error posting gist:', e);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-slate-950/80 justify-end">
        <View className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4 pb-3 border-b border-slate-800">
            <Text className="text-xl font-bold text-white">Create Film Gist</Text>
            <TouchableOpacity onPress={onClose} className="p-2 bg-slate-800 rounded-full">
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Category Tabs */}
          <View className="flex-row space-x-2 mb-4">
            {(['All Gists', 'Casting Updates', 'Trending'] as const).map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full border ${
                  category === cat 
                    ? 'bg-amber-500 border-amber-500' 
                    : 'bg-slate-800 border-slate-700'
                }`}
              >
                <Text className={`text-xs font-bold ${category === cat ? 'text-slate-950' : 'text-slate-300'}`}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Text Input with prompt placeholder */}
          <TextInput
            className="bg-slate-950 border border-slate-800 text-white rounded-2xl p-4 min-h-[120] text-sm mb-4"
            placeholder="Share casting updates, film gist, monologues or dynamic showreels..."
            placeholderTextColor="#64748B"
            multiline
            textAlignVertical="top"
            value={text}
            onChangeText={setText}
          />

          {/* Media Preview */}
          {mediaAsset && (
            <View className="relative mb-4 rounded-xl overflow-hidden border border-slate-700">
              <Image source={{ uri: mediaAsset.uri }} className="w-full h-40" resizeMode="cover" />
              <TouchableOpacity
                onPress={() => setMediaAsset(null)}
                className="absolute top-2 right-2 bg-slate-950/80 p-1.5 rounded-full"
              >
                <X size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          {/* Attachment Controls & Submit */}
          <View className="flex-row items-center justify-between pt-2">
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => handlePickMedia('image')}
                className="flex-row items-center bg-slate-800 px-3 py-2 rounded-xl"
              >
                <ImageIcon size={18} color="#F59E0B" />
                <Text className="text-slate-300 text-xs font-medium ml-1.5">Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handlePickMedia('video')}
                className="flex-row items-center bg-slate-800 px-3 py-2 rounded-xl"
              >
                <VideoIcon size={18} color="#0D9488" />
                <Text className="text-slate-300 text-xs font-medium ml-1.5">Video Reel</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handlePost}
              disabled={uploading || !text.trim()}
              className={`px-5 py-2.5 rounded-xl flex-row items-center ${
                text.trim() ? 'bg-amber-500' : 'bg-slate-800'
              }`}
            >
              {uploading ? (
                <ActivityIndicator color="#0F172A" size="small" />
              ) : (
                <Text className={`font-bold text-sm ${text.trim() ? 'text-slate-950' : 'text-slate-500'}`}>
                  Post Gist
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
