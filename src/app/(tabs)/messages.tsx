import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, onSnapshot, query, where, addDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { Search, MessageSquare, ShieldCheck, Clock, Video } from 'lucide-react-native';
import { Header } from '../../components/Header';
import { ChatWindowModal } from '../../components/ChatWindowModal';
import { db } from '../../lib/firebase';
import { ChatThread, ChatMessage, WebcamSchedule } from '../../types';
import { useAuth } from '../../context/AuthContext';

export default function MessagesScreen() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeThread, setActiveThread] = useState<ChatThread | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user || !db) return;
    let unsubscribe = () => {};
    try {
      const chatsRef = collection(db, 'chats');
      const q = query(chatsRef, where('participantIds', 'array-contains', user.uid));
      unsubscribe = onSnapshot(q, async (snapshot) => {
        const fetchedPromises = snapshot.docs.map(async (docSnap) => {
          const d = docSnap.data();
          const participantIds: string[] = Array.isArray(d.participantIds) ? d.participantIds : [];
          const otherUserId = participantIds.find(id => id !== user.uid) || d.otherUserId || '';
          let otherUserObj = d.otherUser || {};

          if (otherUserId && (!otherUserObj.name || !otherUserObj.avatar)) {
            try {
              const uSnap = await getDoc(doc(db, 'users', otherUserId));
              if (uSnap.exists()) {
                const uData = uSnap.data();
                otherUserObj = {
                  uid: otherUserId,
                  name: uData.name || uData.displayName || 'User',
                  role: uData.role || 'Member',
                  avatar: uData.avatar || uData.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
                  verified: !!uData.verified,
                  timezone: uData.timezone || ''
                };
              }
            } catch(e){}
          }

          const rawTime = d.updatedAt?.toDate ? d.updatedAt.toDate().getTime() : (typeof d.updatedAt === 'number' ? d.updatedAt : (d.updatedAt ? (Date.parse(d.updatedAt) || 0) : 0));

          return {
            id: docSnap.id,
            rawTime,
            participantIds,
            otherUser: {
              uid: otherUserObj.uid || otherUserId,
              name: otherUserObj.name || 'User',
              role: otherUserObj.role || 'Member',
              avatar: otherUserObj.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
              verified: !!otherUserObj.verified,
              timezone: otherUserObj.timezone || ''
            },
            lastMessage: d.lastMessage || d.text || '',
            updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (typeof d.updatedAt === 'string' ? d.updatedAt : 'Recently')
          } as ChatThread;
        });

        const fetched = await Promise.all(fetchedPromises);
        fetched.sort((a, b) => b.rawTime - a.rawTime);
        setThreads(fetched);
      });
    } catch (e) {
      console.warn('Chats listener warning:', e);
    }
    return () => unsubscribe();
  }, [user]);

  const filteredThreads = threads.filter(thread => {
    const name = thread.otherUser?.name || '';
    const role = thread.otherUser?.role || '';
    const lastMsg = thread.lastMessage || '';
    const q = searchQuery.toLowerCase();
    return name.toLowerCase().includes(q) || role.toLowerCase().includes(q) || lastMsg.toLowerCase().includes(q);
  });

  const handleOpenChat = (thread: ChatThread) => {
    setActiveThread(thread);
    setModalVisible(true);
  };

  const handleSendMessage = async (text: string, webcamSchedule?: WebcamSchedule) => {
    if (!activeThread || !user) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      chatId: activeThread.id,
      senderId: user.uid,
      senderName: user.name,
      senderAvatar: user.avatar,
      senderRole: user.role,
      senderVerified: user.verified || false,
      receiverId: activeThread.otherUser?.uid || '',
      text,
      scheduleWebcam: webcamSchedule,
      createdAt: 'Just now'
    };

    setMessagesMap(prev => ({
      ...prev,
      [activeThread.id]: [...(prev[activeThread.id] || []), newMessage]
    }));

    setThreads(prev =>
      prev.map(t =>
        t.id === activeThread.id
          ? { ...t, lastMessage: text, updatedAt: 'Just now' }
          : t
      )
    );

    try {
      if (db) {
        await addDoc(collection(db, 'messages'), newMessage);
        await setDoc(doc(db, 'chats', activeThread.id), {
          lastMessage: text,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch(e){}
  };

  const renderThreadItem = ({ item }: { item: ChatThread }) => (
    <TouchableOpacity
      onPress={() => handleOpenChat(item)}
      activeOpacity={0.7}
      className="flex-row items-center p-4 bg-white border-b border-neutral-100"
    >
      <View className="relative">
        <Image
          source={{ uri: item.otherUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300' }}
          className="w-14 h-14 rounded-full border border-neutral-200"
        />
        {item.otherUser?.verified && (
          <View className="absolute bottom-0 right-0 bg-amber-500 rounded-full p-1 border-2 border-white">
            <ShieldCheck size={10} color="#FFFFFF" />
          </View>
        )}
      </View>

      <View className="flex-1 ml-3.5">
        <View className="flex-row justify-between items-baseline mb-1">
          <View className="flex-row items-center flex-1 pr-2">
            <Text className="font-bold text-base text-neutral-900" numberOfLines={1}>
              {item.otherUser?.name || 'User'}
            </Text>
          </View>
          <Text className="text-xs text-neutral-400 font-medium">{item.updatedAt}</Text>
        </View>

        <View className="flex-row items-center mb-1.5">
          <View className="bg-amber-100 px-2 py-0.5 rounded-full mr-2">
            <Text className="text-[10px] font-bold text-amber-800 uppercase">{item.otherUser?.role || 'Member'}</Text>
          </View>
          {item.otherUser?.timezone ? (
            <View className="flex-row items-center">
              <Clock size={10} color="#9CA3AF" />
              <Text className="text-[11px] text-neutral-400 ml-1">{item.otherUser.timezone}</Text>
            </View>
          ) : null}
        </View>

        <Text className="text-sm text-neutral-600 font-normal" numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['top']}>
      <Header title="Messaging Hub" />

      {/* Timezone Offsets Banner */}
      <View className="bg-amber-50 border-y border-amber-200/60 px-4 py-2.5 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <Video size={16} color="#D97706" />
          <Text className="text-xs font-semibold text-amber-900 ml-2">
            Active Time-Zone Offsets & Webcam Audition Support
          </Text>
        </View>
      </View>

      {/* Search Input */}
      <View className="px-4 py-3 bg-white border-b border-neutral-200">
        <View className="flex-row items-center bg-neutral-100 rounded-xl px-3 py-2">
          <Search size={18} color="#9CA3AF" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search conversations, casting directors..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-2 text-sm text-neutral-900 py-1"
          />
        </View>
      </View>

      {/* Threads List */}
      <FlatList
        data={filteredThreads}
        keyExtractor={item => item.id}
        renderItem={renderThreadItem}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              setTimeout(() => setRefreshing(false), 800);
            }}
            tintColor="#F59E0B"
          />
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center p-8 mt-12">
            <View className="bg-amber-100 p-4 rounded-full mb-3">
              <MessageSquare size={32} color="#D97706" />
            </View>
            <Text className="text-lg font-bold text-neutral-800 mb-1">No Messages Found</Text>
            <Text className="text-sm text-neutral-500 text-center">
              Active conversation threads with Casting Directors or Producers will appear here in real-time.
            </Text>
          </View>
        }
      />

      {/* Chat Window Modal */}
      {activeThread && (
        <ChatWindowModal
          visible={modalVisible}
          thread={activeThread}
          messages={messagesMap[activeThread.id] || []}
          onClose={() => setModalVisible(false)}
          onSendMessage={handleSendMessage}
        />
      )}
    </SafeAreaView>
  );
}