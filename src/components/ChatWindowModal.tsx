import React, { useState, useRef } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ScrollView, Image, Linking } from 'react-native';
import { X, Send, Video, ExternalLink, ShieldCheck } from 'lucide-react-native';
import { ChatThread, ChatMessage, WebcamSchedule } from '../types';
import { WebcamSchedulerModal } from './WebcamSchedulerModal';
import { useAuth } from '../context/AuthContext';

interface ChatWindowModalProps {
  thread: ChatThread | null;
  messages: ChatMessage[];
  visible: boolean;
  onClose: () => void;
  onSendMessage: (text: string, webcamSchedule?: WebcamSchedule) => void;
}

export const ChatWindowModal: React.FC<ChatWindowModalProps> = ({
  thread,
  messages,
  visible,
  onClose,
  onSendMessage
}) => {
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [schedulerVisible, setSchedulerVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  if (!thread) return null;

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleScheduleWebcamSubmit = (schedule: WebcamSchedule) => {
    onSendMessage(`Scheduled a webcam audition: ${schedule.title}`, schedule);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View className="flex-1 bg-slate-950">
        {/* Header */}
        <View className="bg-slate-900 border-b border-slate-800 p-4 pt-12 flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 mr-2">
            <Image
              source={{ uri: thread.otherUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' }}
              className="w-10 h-10 rounded-full border border-slate-700 mr-3"
            />
            <View>
              <View className="flex-row items-center">
                <Text className="text-white font-bold text-base mr-1.5">{thread.otherUser.name}</Text>
                {thread.otherUser.verified && (
                  <ShieldCheck size={14} color="#F59E0B" className="mr-1" />
                )}
                <View className="bg-amber-500/20 border border-amber-500/30 px-2 py-0.2 rounded-full">
                  <Text className="text-amber-400 text-[9px] font-bold">{thread.otherUser.role}</Text>
                </View>
              </View>
              <Text className="text-slate-400 text-[10px]">TZ: {thread.otherUser.timezone || 'WAT'}</Text>
            </View>
          </View>

          <View className="flex-row items-center space-x-2">
            <TouchableOpacity
              onPress={() => setSchedulerVisible(true)}
              className="bg-amber-500/20 border border-amber-500/40 p-2 rounded-xl flex-row items-center mr-2"
            >
              <Video size={16} color="#F59E0B" />
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} className="p-2 bg-slate-800 rounded-full">
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages Body */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ padding: 16 }}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((m) => {
            const isMe = m.senderId === user?.uid;
            return (
              <View
                key={m.id}
                className={`mb-4 max-w-[82%] ${isMe ? 'self-end' : 'self-start'}`}
              >
                <View
                  className={`p-3.5 rounded-2xl ${
                    isMe
                      ? 'bg-amber-500 text-slate-950 rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-white rounded-tl-none'
                  }`}
                >
                  <Text className={`text-xs leading-5 ${isMe ? 'text-slate-950 font-medium' : 'text-slate-100'}`}>
                    {m.text}
                  </Text>

                  {/* Webcam Schedule Card attachment */}
                  {m.scheduleWebcam && (
                    <View className="mt-3 bg-slate-950/90 border border-amber-500/40 rounded-xl p-3">
                      <View className="flex-row items-center mb-1">
                        <Video size={14} color="#F59E0B" className="mr-1.5" />
                        <Text className="text-amber-400 font-bold text-xs">{m.scheduleWebcam.title}</Text>
                      </View>
                      <Text className="text-slate-300 text-[10px] mb-0.5">📅 {m.scheduleWebcam.date} • ⏰ {m.scheduleWebcam.time}</Text>
                      <Text className="text-slate-400 text-[10px] mb-2">🌐 {m.scheduleWebcam.timezoneOffset}</Text>

                      <TouchableOpacity
                        onPress={() => Linking.openURL(m.scheduleWebcam!.meetingUrl)}
                        className="bg-amber-500 py-1.5 px-3 rounded-lg flex-row items-center justify-center"
                      >
                        <ExternalLink size={12} color="#0F172A" className="mr-1" />
                        <Text className="text-slate-950 font-bold text-[10px]">Join Webcam Room</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                <Text className={`text-[9px] mt-1 ${isMe ? 'text-right text-slate-500' : 'text-slate-500'}`}>
                  {m.createdAt}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Input Bar */}
        <View className="p-3 bg-slate-900 border-t border-slate-800 flex-row items-center">
          <TextInput
            className="flex-1 bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-xs mr-2"
            placeholder="Type a message..."
            placeholderTextColor="#64748B"
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity onPress={handleSend} className="bg-amber-500 p-3 rounded-xl">
            <Send size={16} color="#0F172A" />
          </TouchableOpacity>
        </View>

        <WebcamSchedulerModal
          visible={schedulerVisible}
          onClose={() => setSchedulerVisible(false)}
          onSchedule={handleScheduleWebcamSubmit}
          otherUserName={thread.otherUser.name}
        />
      </View>
    </Modal>
  );
};
