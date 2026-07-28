import React, { useState, memo } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Heart, MessageSquare, Repeat, Flag, Send } from 'lucide-react-native';
import { Post, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';

interface PostCardProps {
  post: Post;
  onLikeToggle: (postId: string) => void;
  onReactionAdd: (postId: string, emoji: string) => void;
  onRepost: (postId: string, quoteText: string) => void;
  onFlag: (postId: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
}

const EMOJIS = ['🔥', '👏', '🎬', '❤️'];

const PostCardComponent: React.FC<PostCardProps> = ({
  post,
  onLikeToggle,
  onReactionAdd,
  onRepost,
  onFlag,
  onAddComment
}) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showRepostInput, setShowRepostInput] = useState(false);
  const [repostQuote, setRepostQuote] = useState('');
  const [flagged, setFlagged] = useState(post.moderationStatus === 'flagged');

  const likesList = Array.isArray(post.likes) ? post.likes : [];
  const reactionsMap = (post.reactions && typeof post.reactions === 'object') ? post.reactions : {};
  const isLiked = user ? likesList.includes(user.uid) : false;
  const userReaction = user ? reactionsMap[user.uid] : null;

  const handleLike = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch(e){}
    onLikeToggle(post.id);
  };

  const handleReaction = (emoji: string) => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch(e){}
    onReactionAdd(post.id, emoji);
  };

  const handleFlagClick = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch(e){}
    setFlagged(true);
    onFlag(post.id);
  };

  const handleSendComment = () => {
    if (!newComment.trim()) return;
    onAddComment(post.id, newComment.trim());
    setNewComment('');
  };

  const handleSendRepost = () => {
    onRepost(post.id, repostQuote.trim());
    setRepostQuote('');
    setShowRepostInput(false);
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'Casting Director':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Producer':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Crew member':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <View className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4 shadow-lg">
      {/* Author Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Image
            source={{ uri: post.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300' }}
            className="w-11 h-11 rounded-full border border-slate-700 mr-3"
            contentFit="cover"
            transition={150}
            recyclingKey={post.authorId}
          />
          <View>
            <View className="flex-row items-center">
              <Text className="text-white font-bold text-base mr-2">{post.authorName}</Text>
              <View className={`px-2 py-0.5 rounded-full border ${getRoleBadgeStyle(post.authorRole)}`}>
                <Text className="text-[10px] font-semibold">{post.authorRole}</Text>
              </View>
            </View>
            <Text className="text-slate-400 text-xs mt-0.5">{post.createdAt} • {post.category}</Text>
          </View>
        </View>

        {/* Flag Action */}
        <TouchableOpacity 
          onPress={handleFlagClick} 
          className="p-2 bg-slate-800/80 rounded-lg"
        >
          <Flag size={14} color={flagged ? "#EF4444" : "#64748B"} />
        </TouchableOpacity>
      </View>

      {/* Post Text Content */}
      <Text className="text-slate-100 text-sm leading-6 mb-3">{post.text}</Text>

      {/* Quoted / Reposted Original Content */}
      {post.originalPost && (
        <View className="bg-slate-950 border border-slate-800 rounded-xl p-3 mb-3">
          <View className="flex-row items-center mb-1.5">
            <Image
              source={{ uri: post.originalPost.authorAvatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300' }}
              className="w-6 h-6 rounded-full mr-2"
              contentFit="cover"
              transition={150}
            />
            <Text className="text-amber-400 font-bold text-xs">{post.originalPost.authorName}</Text>
            <Text className="text-slate-500 text-[10px] ml-2">{post.originalPost.authorRole}</Text>
          </View>
          <Text className="text-slate-300 text-xs">{post.originalPost.text}</Text>
        </View>
      )}

      {/* Rich Media Display */}
      {post.mediaUrl && (
        <View className="rounded-xl overflow-hidden mb-3 border border-slate-800 bg-slate-950">
          <Image
            source={{ uri: post.mediaUrl }}
            className="w-full h-52"
            contentFit="cover"
            transition={200}
            recyclingKey={post.id}
          />
        </View>
      )}

      {/* Reactions Bar */}
      <View className="flex-row items-center bg-slate-950/60 rounded-xl p-2 mb-3 border border-slate-800/50 justify-between">
        <Text className="text-slate-400 text-xs font-semibold mr-2">Reactions:</Text>
        <View className="flex-row space-x-2">
          {EMOJIS.map(emoji => (
            <TouchableOpacity
              key={emoji}
              onPress={() => handleReaction(emoji)}
              className={`px-2.5 py-1 rounded-lg ${userReaction === emoji ? 'bg-amber-500/20 border border-amber-500/50' : 'bg-slate-800'}`}
            >
              <Text className="text-sm">{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Social Actions Footer */}
      <View className="flex-row items-center justify-between pt-2 border-t border-slate-800/80">
        {/* Like Button */}
        <TouchableOpacity onPress={handleLike} className="flex-row items-center">
          <Heart size={18} color={isLiked ? '#EF4444' : '#94A3B8'} fill={isLiked ? '#EF4444' : 'none'} />
          <Text className={`ml-1.5 text-xs font-semibold ${isLiked ? 'text-rose-500' : 'text-slate-400'}`}>
            {likesList.length}
          </Text>
        </TouchableOpacity>

        {/* Comment Toggle Button */}
        <TouchableOpacity onPress={() => setShowComments(!showComments)} className="flex-row items-center">
          <MessageSquare size={18} color="#94A3B8" />
          <Text className="ml-1.5 text-xs font-semibold text-slate-400">
            {post.commentsCount || (post.comments?.length ?? 0)}
          </Text>
        </TouchableOpacity>

        {/* Repost Button */}
        <TouchableOpacity onPress={() => setShowRepostInput(!showRepostInput)} className="flex-row items-center">
          <Repeat size={18} color="#94A3B8" />
          <Text className="ml-1.5 text-xs font-semibold text-slate-400">
            {post.repostCount || 0}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Repost Drawer */}
      {showRepostInput && (
        <View className="mt-3 pt-3 border-t border-slate-800 flex-row items-center">
          <TextInput
            className="flex-1 bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 text-xs mr-2"
            placeholder="Add your quote comment..."
            placeholderTextColor="#64748B"
            value={repostQuote}
            onChangeText={setRepostQuote}
          />
          <TouchableOpacity onPress={handleSendRepost} className="bg-amber-500 p-2.5 rounded-xl">
            <Send size={16} color="#0F172A" />
          </TouchableOpacity>
        </View>
      )}

      {/* Comments Section */}
      {showComments && (
        <View className="mt-3 pt-3 border-t border-slate-800">
          <Text className="text-slate-300 font-bold text-xs mb-2">Comments</Text>
          
          {post.comments && post.comments.length > 0 ? (
            post.comments.map(c => (
              <View key={c.id} className="bg-slate-950 rounded-xl p-2.5 mb-2 border border-slate-800/80">
                <Text className="text-amber-400 font-bold text-xs">{c.authorName}</Text>
                <Text className="text-slate-200 text-xs mt-0.5">{c.text}</Text>
              </View>
            ))
          ) : (
            <Text className="text-slate-500 text-xs mb-2">No comments yet. Be the first to join the gist!</Text>
          )}

          {/* Add Comment Input */}
          <View className="flex-row items-center mt-1">
            <TextInput
              className="flex-1 bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 text-xs mr-2"
              placeholder="Write a comment..."
              placeholderTextColor="#64748B"
              value={newComment}
              onChangeText={setNewComment}
            />
            <TouchableOpacity onPress={handleSendComment} className="bg-amber-500 p-2.5 rounded-xl">
              <Send size={16} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

// High-performance custom memoization comparison function
export const PostCard = memo(PostCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.post.id === nextProps.post.id &&
    prevProps.post.likes.length === nextProps.post.likes.length &&
    prevProps.post.commentsCount === nextProps.post.commentsCount &&
    prevProps.post.repostCount === nextProps.post.repostCount &&
    prevProps.post.moderationStatus === nextProps.post.moderationStatus &&
    prevProps.post.text === nextProps.post.text &&
    prevProps.post.reactions === nextProps.post.reactions
  );
});
