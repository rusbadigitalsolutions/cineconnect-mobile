import React, { useState, memo } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Heart, MessageSquare, Repeat, Flag, Send } from 'lucide-react-native';
import { Post, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { MediaRenderer } from './MediaRenderer';

interface PostCardProps {
  post: Post;
  onLikeToggle: (postId: string) => void;
  onReactionAdd: (postId: string, emoji: string) => void;
  onRepost: (postId: string, quoteText: string) => void;
  onFlag: (postId: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
}

const EMOJIS = ['🔥', '👏', '🎬', '❤️'];
const URL_REGEX = /(https?:\/\/[^\s]+)/gi;

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

  const reactionCounts: Record<string, number> = {};
  if (post.reactions && typeof post.reactions === 'object') {
    Object.entries(post.reactions).forEach(([key, val]) => {
      if (typeof val === 'string' && EMOJIS.includes(val)) {
        reactionCounts[val] = (reactionCounts[val] || 0) + 1;
      } else if (typeof val === 'number' && EMOJIS.includes(key)) {
        reactionCounts[key] = (reactionCounts[key] || 0) + val;
      } else if (Array.isArray(val) && EMOJIS.includes(key)) {
        reactionCounts[key] = (reactionCounts[key] || 0) + val.length;
      }
    });
  }

  // Hide raw media URLs from displayed text body
  const rawText = post.text || '';
  const cleanedText = rawText.replace(URL_REGEX, '').trim();

  // For reposted content, clean raw text as well
  const origRawText = post.originalPost?.text || '';
  const origCleanedText = origRawText.replace(URL_REGEX, '').trim();

  return (
    <View className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4 shadow-md">
      {/* Header Info */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <Image
            source={{ uri: post.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300' }}
            className="w-10 h-10 rounded-full mr-3 border border-amber-500/30"
            contentFit="cover"
            transition={200}
            recyclingKey={post.authorId}
          />
          <View className="flex-1">
            <View className="flex-row items-center flex-wrap">
              <Text className="text-white font-bold text-sm mr-1.5">{post.authorName}</Text>
              <View className="bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                <Text className="text-amber-400 font-semibold text-[10px]">{post.authorRole}</Text>
              </View>
            </View>
            <Text className="text-slate-400 text-xs mt-0.5">{post.createdAt}</Text>
          </View>
        </View>

        {/* Flag Post */}
        <TouchableOpacity onPress={handleFlagClick} className="p-1.5 rounded-lg bg-slate-950/40 border border-slate-800">
          <Flag size={14} color={flagged ? '#EF4444' : '#64748B'} fill={flagged ? '#EF4444' : 'none'} />
        </TouchableOpacity>
      </View>

      {/* Post Text Content (Link text hidden when media is present) */}
      {cleanedText.length > 0 ? (
        <Text className="text-slate-100 text-sm leading-6 mb-3">{cleanedText}</Text>
      ) : null}

      {/* Quoted / Reposted Original Content */}
      {post.originalPost && (
        <View className="bg-slate-950 border border-slate-800 rounded-xl p-3 mb-3">
          <View className="flex-row items-center mb-2">
            <Repeat size={12} color="#F59E0B" style={{ marginRight: 6 }} />
            <Text className="text-amber-400 font-bold text-[11px] uppercase tracking-wider">Reposted Gist</Text>
          </View>

          <View className="flex-row items-center mb-2">
            <Image
              source={{ uri: post.originalPost.authorAvatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300' }}
              className="w-7 h-7 rounded-full mr-2 border border-slate-700"
              contentFit="cover"
              transition={150}
            />
            <View className="flex-1 flex-row items-center flex-wrap">
              <Text className="text-white font-bold text-xs mr-1.5">{post.originalPost.authorName}</Text>
              {post.originalPost.authorRole ? (
                <View className="bg-slate-800 px-1.5 py-0.5 rounded-full border border-slate-700">
                  <Text className="text-slate-300 text-[9px] font-medium">{post.originalPost.authorRole}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {origCleanedText.length > 0 ? (
            <Text className="text-slate-200 text-xs mb-2 leading-5">{origCleanedText}</Text>
          ) : null}

          {/* Media for quoted post */}
          <MediaRenderer mediaUrl={post.originalPost.mediaUrl} text={post.originalPost.text} />
        </View>
      )}

      {/* Universal Media & Video Renderer (YouTube, Vimeo, MP4, Web Links, Images) */}
      <MediaRenderer mediaUrl={post.mediaUrl} text={post.text} />

      {/* Reactions Bar */}
      <View className="flex-row items-center bg-slate-950/60 rounded-xl p-2 mb-3 border border-slate-800/50 justify-between">
        <Text className="text-slate-400 text-xs font-semibold mr-2">Reactions:</Text>
        <View className="flex-row space-x-1.5">
          {EMOJIS.map(emoji => {
            const count = reactionCounts[emoji] || 0;
            const isSelected = userReaction === emoji;
            return (
              <TouchableOpacity
                key={emoji}
                onPress={() => handleReaction(emoji)}
                className={`px-2 py-1 rounded-lg flex-row items-center ${
                  isSelected ? 'bg-amber-500/20 border border-amber-500/50' : 'bg-slate-800 border border-transparent'
                }`}
              >
                <Text className="text-sm">{emoji}</Text>
                {count > 0 && (
                  <Text className={`text-[11px] font-extrabold ml-1 ${isSelected ? 'text-amber-400' : 'text-slate-300'}`}>
                    {count}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
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
          <Text className="text-slate-300 font-bold text-xs mb-2">Comments ({post.comments?.length || 0})</Text>
          
          {post.comments && post.comments.length > 0 ? (
            post.comments.map(c => (
              <View key={c.id} className="bg-slate-950 rounded-xl p-2.5 mb-2 border border-slate-800/80 flex-row items-start">
                <Image
                  source={{ uri: c.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' }}
                  className="w-7 h-7 rounded-full mr-2.5 mt-0.5"
                  contentFit="cover"
                />
                <View className="flex-1">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-amber-400 font-bold text-xs">{c.authorName || 'Film Creative'}</Text>
                    {c.createdAt ? <Text className="text-slate-500 text-[10px]">{c.createdAt}</Text> : null}
                  </View>
                  <Text className="text-slate-200 text-xs mt-0.5 leading-4">{c.text}</Text>
                </View>
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
    (prevProps.post.comments?.length || 0) === (nextProps.post.comments?.length || 0) &&
    prevProps.post.repostCount === nextProps.post.repostCount &&
    prevProps.post.moderationStatus === nextProps.post.moderationStatus &&
    prevProps.post.text === nextProps.post.text &&
    JSON.stringify(prevProps.post.reactions) === JSON.stringify(nextProps.post.reactions)
  );
});
