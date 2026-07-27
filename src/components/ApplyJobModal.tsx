import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { X, FileText, Video, Link as LinkIcon, CheckCircle } from 'lucide-react-native';
import { Job } from '../types';
import { useAuth } from '../context/AuthContext';

interface ApplyJobModalProps {
  job: Job | null;
  visible: boolean;
  onClose: () => void;
  onSubmit: (jobId: string, monologueUrl: string, coverLetter: string) => Promise<void>;
}

export const ApplyJobModal: React.FC<ApplyJobModalProps> = ({ job, visible, onClose, onSubmit }) => {
  const { user } = useAuth();
  const [monologueUrl, setMonologueUrl] = useState(user?.reelsUrl || 'https://vimeo.com/demo-monologue');
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  if (!job) return null;

  const handleApplySubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(job.id, monologueUrl, coverLetter);
      setAppliedSuccess(true);
      setTimeout(() => {
        setAppliedSuccess(false);
        onClose();
      }, 1200);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-slate-950/85 justify-end">
        <View className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5">
          <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-slate-800">
            <View>
              <Text className="text-xl font-bold text-white">Audition Application</Text>
              <Text className="text-amber-400 font-medium text-xs mt-0.5">{job.title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2 bg-slate-800 rounded-full">
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {appliedSuccess ? (
            <View className="py-8 items-center justify-center">
              <CheckCircle size={48} color="#10B981" />
              <Text className="text-white font-bold text-lg mt-3">Application Submitted!</Text>
              <Text className="text-slate-400 text-xs mt-1">Written to /jobs/{job.id}/applications/{user?.uid}</Text>
            </View>
          ) : (
            <>
              {/* Profile Resume Attached */}
              <View className="bg-slate-950 border border-slate-800 rounded-xl p-3 mb-4 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <FileText size={18} color="#F59E0B" className="mr-2" />
                  <View>
                    <Text className="text-slate-200 text-xs font-bold">Attached Acting Resume</Text>
                    <Text className="text-slate-500 text-[10px]">{user?.name}'s Standard Portfolio Resume.pdf</Text>
                  </View>
                </View>
                <Text className="text-emerald-400 text-[10px] font-bold">✓ Attached</Text>
              </View>

              {/* Monologue Video Reel Link */}
              <Text className="text-slate-300 font-semibold text-xs mb-1 uppercase tracking-wider">Monologue / Video Reel URL</Text>
              <View className="flex-row items-center bg-slate-950 border border-slate-800 rounded-xl p-3 mb-4">
                <Video size={16} color="#64748B" className="mr-2" />
                <TextInput
                  className="flex-1 text-white text-xs"
                  placeholder="https://youtube.com/watch?v=..."
                  placeholderTextColor="#64748B"
                  value={monologueUrl}
                  onChangeText={setMonologueUrl}
                />
              </View>

              {/* Cover Note */}
              <Text className="text-slate-300 font-semibold text-xs mb-1 uppercase tracking-wider">Note to Casting Director</Text>
              <TextInput
                className="bg-slate-950 border border-slate-800 text-white rounded-xl p-3 min-h-[70] text-xs mb-5"
                placeholder="Briefly state why you fit this role..."
                placeholderTextColor="#64748B"
                multiline
                textAlignVertical="top"
                value={coverLetter}
                onChangeText={setCoverLetter}
              />

              <TouchableOpacity
                onPress={handleApplySubmit}
                disabled={submitting}
                className="bg-amber-500 active:bg-amber-600 rounded-xl py-3.5 items-center shadow-lg shadow-amber-500/20"
              >
                {submitting ? (
                  <ActivityIndicator color="#0F172A" />
                ) : (
                  <Text className="text-slate-950 font-bold text-sm uppercase tracking-wider">Submit Application</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};
