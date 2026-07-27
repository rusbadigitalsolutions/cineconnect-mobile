import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { X, Video, Calendar, Clock, Globe } from 'lucide-react-native';
import { WebcamSchedule } from '../types';

interface WebcamSchedulerModalProps {
  visible: boolean;
  onClose: () => void;
  onSchedule: (schedule: WebcamSchedule) => void;
  otherUserName: string;
}

export const WebcamSchedulerModal: React.FC<WebcamSchedulerModalProps> = ({
  visible,
  onClose,
  onSchedule,
  otherUserName
}) => {
  const [title, setTitle] = useState(`Casting Callback Interview with ${otherUserName}`);
  const [date, setDate] = useState('2026-07-25');
  const [time, setTime] = useState('15:00 WAT');
  const [tzOffset, setTzOffset] = useState('+1 Hour Offset');

  const handleConfirm = () => {
    onSchedule({
      title,
      date,
      time,
      timezoneOffset: tzOffset,
      meetingUrl: `https://meet.cineconnect.app/room-${Date.now()}`
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-slate-950/85 justify-end">
        <View className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5">
          <View className="flex-row justify-between items-center mb-4 pb-3 border-b border-slate-800">
            <View className="flex-row items-center">
              <Video size={20} color="#F59E0B" className="mr-2" />
              <Text className="text-lg font-bold text-white">Schedule Webcam Audition</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2 bg-slate-800 rounded-full">
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1">Interview Title</Text>
          <TextInput
            className="bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-xs mb-3"
            value={title}
            onChangeText={setTitle}
          />

          <View className="flex-row space-x-3 mb-3">
            <View className="flex-1">
              <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1">Date</Text>
              <TextInput
                className="bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-xs"
                value={date}
                onChangeText={setDate}
              />
            </View>
            <View className="flex-1">
              <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1">Time & Zone</Text>
              <TextInput
                className="bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-xs"
                value={time}
                onChangeText={setTime}
              />
            </View>
          </View>

          <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1">Active Time-Zone Offset</Text>
          <View className="bg-slate-950 border border-slate-800 rounded-xl p-3 mb-5 flex-row items-center">
            <Globe size={16} color="#3B82F6" className="mr-2" />
            <Text className="text-slate-300 text-xs font-semibold">{tzOffset} (Local WAT vs Partner Timezone)</Text>
          </View>

          <TouchableOpacity
            onPress={handleConfirm}
            className="bg-amber-500 active:bg-amber-600 rounded-xl py-3.5 items-center shadow-lg shadow-amber-500/20"
          >
            <Text className="text-slate-950 font-bold text-xs uppercase tracking-wider">Send Webcam Invitation</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
