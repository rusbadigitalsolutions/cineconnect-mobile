import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { collection, onSnapshot, query, orderBy, limit, addDoc, updateDoc, doc } from 'firebase/firestore';
import { Plus, Flame, Sparkles, Megaphone } from 'lucide-react-native';
import { Header } from '../../components/Header';
import { PostCard } from '../../components/PostCard';
import { CreatePostModal } from '../../components/CreatePostModal';
import { db } from '../../lib/firebase';
import { Post } from '../../types';
import { useAuth } from '../../context/AuthContext';

export default function GistFeedScreen() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeCategory, setActiveCategory] = useState<'Trending' | 'All Gists' | 'Casting Updates'>('All Gists');
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      if (db) {
        const postsRef = collection(db, 'posts');
        // Fetch posts without rigid orderBy to avoid missing index errors on custom schemas
        const q = query(postsRef, limit(50));
        unsubscribe = onSnapshot(q, async (snapshot) => {
          const userCache: Record<string, { name: string; avatar: string; role: any }> = {};

          const rawPosts: Post[] = snapshot.docs.map(docSnap => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              authorId: data.authorId || data.userId || data.creatorId || '',
              authorName: data.authorName || data.userName || data.displayName || data.name || '',
              authorRole: data.authorRole || data.userRole || data.role || 'Actor/Actress',
              authorAvatar: data.authorAvatar || data.userAvatar || data.avatar || data.photoURL || '',
              text: data.text || data.content || data.body || '',
              mediaUrl: data.mediaUrl || data.imageUrl || data.image || data.photo || undefined,
              mediaType: data.mediaType || (data.mediaUrl || data.imageUrl || data.image ? 'image' : undefined),
              category: data.category || 'All Gists',
              likes: Array.isArray(data.likes) ? data.likes : (data.likes && typeof data.likes === 'object' ? Object.keys(data.likes) : []),
              reactions: data.reactions && typeof data.reactions === 'object' ? data.reactions : {},
              commentsCount: typeof data.commentsCount === 'number' ? data.commentsCount : (Array.isArray(data.comments) ? data.comments.length : 0),
              comments: Array.isArray(data.comments) ? data.comments.map((c: any, i: number) => ({
                id: c.id || `c-${i}`,
                authorId: c.authorId || c.userId || '',
                authorName: c.authorName || c.userName || c.displayName || c.name || 'User',
                authorAvatar: c.authorAvatar || c.userAvatar || c.avatar || c.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
                text: c.text || c.content || c.comment || '',
                createdAt: c.createdAt?.toDate ? c.createdAt.toDate().toLocaleDateString() : (typeof c.createdAt === 'string' ? c.createdAt : 'Just now')
              })) : [],
              repostCount: typeof data.repostCount === 'number' ? data.repostCount : 0,
              originalPost: data.originalPost ? {
                id: data.originalPost.id || '',
                authorName: data.originalPost.authorName || data.originalPost.userName || 'Original Creator',
                authorRole: data.originalPost.authorRole || data.originalPost.role || 'Creative',
                authorAvatar: data.originalPost.authorAvatar || data.originalPost.avatar || '',
                text: data.originalPost.text || data.originalPost.content || '',
                mediaUrl: data.originalPost.mediaUrl || data.originalPost.imageUrl
              } : undefined,
              moderationStatus: data.moderationStatus || 'approved',
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (typeof data.createdAt === 'string' ? data.createdAt : 'Just now')
            } as Post;
          });

          // Fetch user details from /users/{authorId} if missing on the post document
          const uidsToFetch = Array.from(new Set(rawPosts.map(p => p.authorId).filter(Boolean)));
          await Promise.all(uidsToFetch.map(async (uid) => {
            try {
              const uSnap = await getDoc(doc(db, 'users', uid));
              if (uSnap.exists()) {
                const uData = uSnap.data();
                userCache[uid] = {
                  name: uData.name || uData.displayName || 'Film Creative',
                  avatar: uData.avatar || uData.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
                  role: uData.role || 'Actor/Actress'
                };
              }
            } catch(e){}
          }));

          const enriched = rawPosts.map(p => {
            const cachedUser = userCache[p.authorId];
            return {
              ...p,
              authorName: p.authorName || cachedUser?.name || 'Film Creative',
              authorAvatar: p.authorAvatar || cachedUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
              authorRole: p.authorRole || cachedUser?.role || 'Actor/Actress'
            };
          });

          setPosts(enriched);
        }, (err) => {
          console.warn('Firestore posts snapshot listener warning:', err);
        });
      }
    } catch (e) {
      console.warn('Firestore sync warning:', e);
    }
    return () => unsubscribe();
  }, []);

  const filteredPosts = posts.filter(p => {
    if (activeCategory === 'All Gists') return true;
    return p.category === activeCategory;
  });

  const handleLikeToggle = useCallback((postId: string) => {
    if (!user) return;
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const likes = p.likes || [];
        const hasLiked = likes.includes(user.uid);
        const newLikes = hasLiked ? likes.filter(id => id !== user.uid) : [...likes, user.uid];
        
        try {
          if (db) {
            updateDoc(doc(db, 'posts', postId), { likes: newLikes });
          }
        } catch(e){}

        return { ...p, likes: newLikes };
      }
      return p;
    }));
  }, [user]);

  const handleReactionAdd = useCallback((postId: string, emoji: string) => {
    if (!user) return;
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const newReactions = { ...(p.reactions || {}), [user.uid]: emoji };
        try {
          if (db) {
            updateDoc(doc(db, 'posts', postId), { reactions: newReactions });
          }
        } catch(e){}
        return { ...p, reactions: newReactions };
      }
      return p;
    }));
  }, [user]);

  const handleRepost = useCallback((postId: string, quoteText: string) => {
    if (!user) return;
    setPosts(prev => {
      const target = prev.find(p => p.id === postId);
      if (!target) return prev;

      const newRepost: Post = {
        id: `repost-${Date.now()}`,
        authorId: user.uid,
        authorName: user.name,
        authorRole: user.role,
        authorAvatar: user.avatar,
        text: quoteText || `Reposted from ${target.authorName}`,
        category: 'All Gists',
        likes: [],
        reactions: {},
        commentsCount: 0,
        repostCount: 0,
        originalPost: {
          id: target.id,
          authorName: target.authorName,
          authorRole: target.authorRole,
          authorAvatar: target.authorAvatar,
          text: target.text,
          mediaUrl: target.mediaUrl
        },
        moderationStatus: 'approved',
        createdAt: 'Just now'
      };

      try {
        if (db) {
          addDoc(collection(db, 'posts'), newRepost);
        }
      } catch(e){}

      return [newRepost, ...prev];
    });
  }, [user]);

  const handleFlag = useCallback((postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        try {
          if (db) {
            updateDoc(doc(db, 'posts', postId), { moderationStatus: 'flagged' });
          }
        } catch(e){}
        return { ...p, moderationStatus: 'flagged' };
      }
      return p;
    }));
  }, []);

  const handleAddComment = useCallback((postId: string, commentText: string) => {
    if (!user) return;
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const newCommentObj = {
          id: `c-${Date.now()}`,
          authorId: user.uid,
          authorName: user.name,
          authorAvatar: user.avatar,
          text: commentText,
          createdAt: 'Just now'
        };
        const updatedComments = [...(p.comments || []), newCommentObj];
        return {
          ...p,
          commentsCount: updatedComments.length,
          comments: updatedComments
        };
      }
      return p;
    }));
  }, [user]);

  const handleCreatePostSubmit = async (data: { text: string; category: 'Trending' | 'All Gists' | 'Casting Updates'; mediaUrl?: string }) => {
    if (!user) return;
    const newPost: Post = {
      id: `post-${Date.now()}`,
      authorId: user.uid,
      authorName: user.name,
      authorRole: user.role,
      authorAvatar: user.avatar,
      text: data.text,
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaUrl ? 'image' : undefined,
      category: data.category,
      likes: [],
      reactions: {},
      commentsCount: 0,
      moderationStatus: 'approved',
      createdAt: 'Just now'
    };

    setPosts(prev => [newPost, ...prev]);
    try {
      if (db) {
        await addDoc(collection(db, 'posts'), newPost);
      }
    } catch(e){}
  };

  const renderPostItem = useCallback(({ item }: { item: Post }) => (
    <PostCard
      post={item}
      onLikeToggle={handleLikeToggle}
      onReactionAdd={handleReactionAdd}
      onRepost={handleRepost}
      onFlag={handleFlag}
      onAddComment={handleAddComment}
    />
  ), [handleLikeToggle, handleReactionAdd, handleRepost, handleFlag, handleAddComment]);

  const keyExtractor = useCallback((item: Post) => item.id, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <Header title="Gist Feed" subtitle="Social Community & Industry Buzz" />

      {/* Top Filter Tabs & Create Bar */}
      <View className="bg-slate-900 border-b border-slate-800 p-4">
        {/* Input Bar linking to modal */}
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex-row items-center justify-between mb-3 shadow-inner"
        >
          <View className="flex-row items-center flex-1 mr-2">
            <Image
              source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300' }}
              className="w-8 h-8 rounded-full mr-2.5"
              contentFit="cover"
            />
            <Text className="text-slate-400 text-xs flex-1" numberOfLines={1}>
              Share casting updates, film gist, monologues...
            </Text>
          </View>
          <View className="bg-amber-500 p-2 rounded-xl">
            <Plus size={16} color="#0F172A" />
          </View>
        </TouchableOpacity>

        {/* Categories */}
        <View className="flex-row justify-around">
          {(['All Gists', 'Trending', 'Casting Updates'] as const).map((cat) => {
            const isSelected = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl flex-row items-center border ${
                  isSelected 
                    ? 'bg-amber-500/15 border-amber-500' 
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                {cat === 'Trending' && <Flame size={14} color={isSelected ? "#F59E0B" : "#64748B"} className="mr-1.5" />}
                {cat === 'Casting Updates' && <Megaphone size={14} color={isSelected ? "#F59E0B" : "#64748B"} className="mr-1.5" />}
                {cat === 'All Gists' && <Sparkles size={14} color={isSelected ? "#F59E0B" : "#64748B"} className="mr-1.5" />}
                <Text className={`text-xs font-bold ${isSelected ? 'text-amber-400' : 'text-slate-400'}`}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Feed List - Powered by Shopify FlashList for Ultra-fast View Recycling */}
      <View className="flex-1 px-4 pt-3">
        <FlashList
          data={filteredPosts}
          keyExtractor={keyExtractor}
          extraData={user?.uid}
          renderItem={renderPostItem}
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
              <Text className="text-lg font-bold text-white mb-2">No Gist Posts Yet</Text>
              <Text className="text-slate-400 text-xs text-center mb-4">
                Be the first to share casting updates, film monologues, or showreels with the community!
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                className="bg-amber-500 px-4 py-2.5 rounded-xl flex-row items-center"
              >
                <Plus size={16} color="#0F172A" className="mr-1" />
                <Text className="text-slate-950 font-bold text-xs uppercase">Create First Post</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>

      <CreatePostModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleCreatePostSubmit}
      />
    </SafeAreaView>
  );
}
