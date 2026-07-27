import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { X, Video, UploadCloud, CheckCircle } from 'lucide-react-native';
import { pickMediaAsync, uploadMediaToStorage } from '../lib/mediaPicker';

interface SubmitMonologueModalProps {
  contestId: string | null;
  visible: boolean;
  onClose: () => void;
  onSubmit: (contestId: string, videoUrl: string, caption: string) => Promise<void>;
}

export const SubmitMonologueModal: React.FC<SubmitMonologueModalProps> = ({
  contestId,
  visible,
  onClose,
  onSubmit
}) => {
  const [caption, setCaption] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!contestId) return null;

  const handlePickVideo = async () => {
    const asset = await pickMediaAsync('video');
    if (asset) {
      setSelectedAsset(asset);
    }
  };

  const handleSubmit = async () => {
    if (!caption.trim()) return;
    setSubmitting(true);
    try {
      let finalVideoUrl = videoUrlInput.trim() || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4';
      if (selectedAsset?.uri) {
        finalVideoUrl = await uploadMediaToStorage(selectedAsset.uri, 'contests', selectedAsset.base64);
      }

      await onSubmit(contestId, finalVideoUrl, caption.trim());
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setCaption('');
        setSelectedAsset(null);
        setVideoUrlInput('');
        onClose();
      }, 1200);
    } catch (e) {
      console.error('Submission error:', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-slate-950/85 justify-end">
        <View className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5">
          <View className="flex-row justify-between items-center mb-4 pb-3 border-b border-slate-800">
            <Text className="text-xl font-bold text-white">Submit Monologue Video</Text>
            <TouchableOpacity onPress={onClose} className="p-2 bg-slate-800 rounded-full">
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {success ? (
            <View className="py-8 items-center justify-center">
              <CheckCircle size={48} color="#10B981" />
              <Text className="text-white font-bold text-lg mt-3">Monologue Submitted!</Text>
              <Text className="text-slate-400 text-xs mt-1">Your video is now live on the challenge feed.</Text>
            </View>
          ) : (
            <>
              {/* Media Picker */}
              <TouchableOpacity
                onPress={handlePickVideo}
                className="bg-slate-950 border-2 border-dashed border-amber-500/40 rounded-2xl p-6 items-center mb-4"
              >
                <UploadCloud size={32} color="#F59E0B" className="mb-2" />
                <Text className="text-white font-bold text-xs mb-1">
                  {selectedAsset ? 'Video Selected ✓' : 'Upload Monologue Video File'}
                </Text>
                <Text className="text-slate-400 text-[10px]">
                  {selectedAsset ? selectedAsset.uri.split('/').pop() : 'Tap to select MP4/MOV from device roll'}
                </Text>
              </TouchableOpacity>

              {/* Video URL Fallback */}
              <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1">Or Provide Video URL</Text>
              <TextInput
                className="bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-xs mb-4"
                placeholder="https://commondatastorage.googleapis.com/..."
                placeholderTextColor="#64748B"
                value={videoUrlInput}
                onChangeText={setVideoUrlInput}
              />

              {/* Caption */}
              <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1">Caption / Character Intro</Text>
              <TextInput
                className="bg-slate-950 border border-slate-800 text-white rounded-xl p-3 min-h-[70] text-xs mb-5"
                placeholder="Describe your scene or monologue excerpt..."
                placeholderTextColor="#64748B"
                multiline
                value={caption}
                onChangeText={setCaption}
              />

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={submitting || !caption.trim()}
                className={`rounded-xl py-3.5 items-center shadow-lg ${
                  caption.trim() ? 'bg-amber-500 shadow-amber-500/20' : 'bg-slate-800'
                }`}
              >
                {submitting ? (
                  <ActivityIndicator color="#0F172A" />
                ) : (
                  <Text className={`font-bold text-xs uppercase tracking-wider ${caption.trim() ? 'text-slate-950' : 'text-slate-500'}`}>
                    Submit Contest Entry
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};
