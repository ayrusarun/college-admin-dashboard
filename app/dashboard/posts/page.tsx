'use client';

import { useState, useEffect } from 'react';
import { 
  MessageSquare, Heart, Zap, Plus, Filter, TrendingUp, 
  Users, Calendar, Send, ImageIcon, Sparkles, X, Search,
  Edit2, Trash2, MoreVertical, Eye, ThumbsUp, Wand2, RefreshCw, CheckCircle2
} from 'lucide-react';
import { postApi } from '@/lib/api/posts';
import { groupApi } from '@/lib/api/client';
import { aiApi } from '@/lib/api/ai';
import type { PostEngagementResponse, PostType, PostCreate } from '@/lib/types/posts';
import { POST_TYPE_OPTIONS } from '@/lib/types/posts';
import type { Group } from '@/lib/types';
import { REWRITE_STYLES, REWRITE_TONES } from '@/lib/types/ai';

export default function PostsPage() {
  // State management
  const [posts, setPosts] = useState<PostEngagementResponse[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Filters
  const [selectedType, setSelectedType] = useState<PostType | ''>('');
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<PostCreate>({
    title: '',
    content: '',
    image_url: null,
    post_type: 'GENERAL',
    target_group_id: null,
    post_context: null,
  });
  
  // Image upload
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // AI Rewrite
  const [showAIRewrite, setShowAIRewrite] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [rewriteStyle, setRewriteStyle] = useState('professional');
  const [rewriteTone, setRewriteTone] = useState('friendly');
  const [rewriteResult, setRewriteResult] = useState<{
    original: string;
    rewritten: string;
    improvements: string[];
    wordCountBefore: number;
    wordCountAfter: number;
    rewrittenTitle?: string;
    rewrittenContent?: string;
  } | null>(null);

  // Detail modal
  const [selectedPost, setSelectedPost] = useState<PostEngagementResponse | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Pagination
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  // Fetch posts
  useEffect(() => {
    fetchPosts();
  }, [selectedType]);

  // Fetch groups for targeting
  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await postApi.list({ skip: 0, limit: LIMIT });
      setPosts(data);
      setSkip(LIMIT);
      setHasMore(data.length === LIMIT);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await groupApi.list({ limit: 1000 });
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      const data = await postApi.list({ skip, limit: LIMIT });
      setPosts([...posts, ...data]);
      setSkip(skip + LIMIT);
      setHasMore(data.length === LIMIT);
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      const result = await postApi.uploadImage(file, '/posts');
      const imageUrl = postApi.getImageUrl(result.filename);
      
      setFormData({ ...formData, image_url: imageUrl });
      setImagePreview(imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAIRewrite = async () => {
    if (!formData.content.trim()) {
      alert('Please enter some content to rewrite');
      return;
    }

    try {
      setRewriting(true);
      
      // Combine title and content for AI rewrite
      const combinedContent = formData.title.trim() 
        ? `Title: ${formData.title}\n\nContent:\n${formData.content}`
        : formData.content;

      const result = await aiApi.rewriteContent({
        content: combinedContent,
        style: rewriteStyle,
        tone: rewriteTone,
      });

      // Parse the rewritten content to extract title and content
      const rewrittenText = result.rewritten_content;
      let rewrittenTitle = formData.title; // Keep original if can't parse
      let rewrittenContent = rewrittenText;

      // Try to extract title if present in format "Title: ..."
      const titleMatch = rewrittenText.match(/^Title:\s*(.+?)(?:\n|$)/i);
      if (titleMatch) {
        rewrittenTitle = titleMatch[1].trim();
        // Remove the title part from content
        rewrittenContent = rewrittenText.replace(/^Title:\s*.+?(?:\n\n?|\r\n\r?\n?)/i, '').trim();
        // Also remove "Content:" prefix if present
        rewrittenContent = rewrittenContent.replace(/^Content:\s*\n?/i, '').trim();
      }

      setRewriteResult({
        original: result.original_content,
        rewritten: result.rewritten_content,
        improvements: result.improvements,
        wordCountBefore: result.word_count_before,
        wordCountAfter: result.word_count_after,
        rewrittenTitle,
        rewrittenContent,
      });
      setShowAIRewrite(true);
    } catch (error) {
      console.error('Error rewriting content:', error);
      alert('Failed to rewrite content. Please try again.');
    } finally {
      setRewriting(false);
    }
  };

  const handleApplyRewrite = () => {
    if (rewriteResult) {
      setFormData({
        ...formData,
        title: rewriteResult.rewrittenTitle || formData.title,
        content: rewriteResult.rewrittenContent || rewriteResult.rewritten,
      });
      setShowAIRewrite(false);
      setRewriteResult(null);
    }
  };

  const handleCreatePost = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Title and content are required');
      return;
    }

    try {
      setCreating(true);
      const newPost = await postApi.create(formData);
      setPosts([newPost as PostEngagementResponse, ...posts]);
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    } finally {
      setCreating(false);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      const result = await postApi.toggleLike(postId);
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, like_count: result.like_count, user_has_liked: result.action === 'liked' }
          : post
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleIgnite = async (postId: number) => {
    try {
      const result = await postApi.toggleIgnite(postId);
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, ignite_count: result.ignite_count, user_has_ignited: result.action === 'ignited' }
          : post
      ));
    } catch (error) {
      console.error('Error toggling ignite:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      image_url: null,
      post_type: 'GENERAL',
      target_group_id: null,
      post_context: null,
    });
    setImagePreview(null);
  };

  const filteredPosts = posts.filter(post => {
    const matchesType = !selectedType || post.post_type === selectedType;
    const matchesGroup = !selectedGroupId || post.target_group_id === selectedGroupId;
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesGroup && matchesSearch;
  });

  const getTypeIcon = (type: PostType) => {
    const typeOption = POST_TYPE_OPTIONS.find(opt => opt.value === type);
    return typeOption?.icon || '💬';
  };

  const getTypeBadgeClass = (type: PostType) => {
    const colors = {
      ANNOUNCEMENT: 'bg-blue-50 text-blue-700 border-blue-200',
      INFO: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      IMPORTANT: 'bg-red-50 text-red-700 border-red-200',
      EVENTS: 'bg-purple-50 text-purple-700 border-purple-200',
      GENERAL: 'bg-gray-50 text-gray-700 border-gray-200',
    };
    return colors[type] || colors.GENERAL;
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Community Posts</h1>
              <p className="text-sm font-normal text-gray-600 mt-1">Share updates, announcements, and engage with your community</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              Create Post
            </button>
          </div>

          {/* Filters */}
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Type filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as PostType | '')}
              className="px-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Types</option>
              {POST_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.icon} {opt.label}
                </option>
              ))}
            </select>

            {/* Group filter */}
            <select
              value={selectedGroupId || ''}
              onChange={(e) => setSelectedGroupId(e.target.value ? Number(e.target.value) : null)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Groups</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>

            {/* Clear filters */}
            {(selectedType || selectedGroupId || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedType('');
                  setSelectedGroupId(null);
                  setSearchQuery('');
                }}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
              <p className="text-sm text-gray-600 mb-4">Be the first to share something with the community!</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4" />
                Create First Post
              </button>
            </div>
          ) : (
            <>
              {filteredPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Author Avatar */}
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {post.author_name?.charAt(0) || 'U'}
                      </div>
                      
                      {/* Author Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-semibold text-gray-900">{post.author_name || 'Unknown'}</h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium border rounded-full ${getTypeBadgeClass(post.post_type)}`}>
                            <span>{getTypeIcon(post.post_type)}</span>
                            {post.post_type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                          <span>{post.author_department || 'Department'}</span>
                          <span>•</span>
                          <span>{post.time_ago || 'Just now'}</span>
                          {post.target_group_name && (
                            <>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {post.target_group_name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions Menu */}
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Post Content */}
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h2>
                    <p className="text-base text-gray-700 whitespace-pre-wrap line-clamp-4">{post.content}</p>
                  </div>

                  {/* Post Image */}
                  {post.image_url && (
                    <div className="mb-4 rounded-xl overflow-hidden">
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-auto max-h-96 object-cover"
                      />
                    </div>
                  )}

                  {/* Engagement Stats */}
                  <div className="flex items-center gap-4 py-3 border-t border-gray-100">
                    <span className="text-sm text-gray-600">
                      {post.like_count} {post.like_count === 1 ? 'like' : 'likes'}
                    </span>
                    <span className="text-sm text-gray-600">
                      {post.ignite_count} {post.ignite_count === 1 ? 'ignite' : 'ignites'}
                    </span>
                    <span className="text-sm text-gray-600">
                      {post.comment_count} {post.comment_count === 1 ? 'comment' : 'comments'}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                        post.user_has_liked
                          ? 'bg-pink-50 text-pink-700 border border-pink-200'
                          : 'text-gray-700 hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.user_has_liked ? 'fill-current' : ''}`} />
                      {post.user_has_liked ? 'Liked' : 'Like'}
                    </button>

                    <button
                      onClick={() => handleIgnite(post.id)}
                      className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                        post.user_has_ignited
                          ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                          : 'text-gray-700 hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <Zap className={`w-4 h-4 ${post.user_has_ignited ? 'fill-current' : ''}`} />
                      {post.user_has_ignited ? 'Ignited' : 'Ignite'}
                    </button>

                    <button
                      onClick={() => {
                        setSelectedPost(post);
                        setShowDetailModal(true);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Comment
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Load More Button */}
          {hasMore && filteredPosts.length > 0 && (
            <div className="text-center py-4">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-3 bg-white text-indigo-600 text-sm font-semibold border border-indigo-200 rounded-xl hover:bg-indigo-50 disabled:opacity-50"
              >
                {loadingMore ? 'Loading...' : 'Load More Posts'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-semibold tracking-tight">Create New Post</h2>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold tracking-tight text-gray-900 mb-2">
                  Post Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter a catchy title..."
                  className="w-full px-4 py-3 text-base font-normal border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold tracking-tight text-gray-900">
                    Content
                  </label>
                  <button
                    onClick={handleAIRewrite}
                    disabled={rewriting || !formData.content.trim()}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    {rewriting ? 'Rewriting...' : 'AI Rewrite'}
                  </button>
                </div>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Share your thoughts..."
                  rows={6}
                  className="w-full px-4 py-3 text-base font-normal leading-relaxed border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                />
                <div className="mt-2 flex items-center gap-3">
                  <select
                    value={rewriteStyle}
                    onChange={(e) => setRewriteStyle(e.target.value)}
                    className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {REWRITE_STYLES.map(style => (
                      <option key={style.value} value={style.value}>
                        Style: {style.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={rewriteTone}
                    onChange={(e) => setRewriteTone(e.target.value)}
                    className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {REWRITE_TONES.map(tone => (
                      <option key={tone.value} value={tone.value}>
                        Tone: {tone.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Type & Group - Two Column */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Post Type */}
                <div>
                  <label className="block text-sm font-semibold tracking-tight text-gray-900 mb-2">
                    <span className="inline-flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Post Type
                    </span>
                  </label>
                  <select
                    value={formData.post_type}
                    onChange={(e) => setFormData({ ...formData, post_type: e.target.value as PostType })}
                    className="w-full px-4 py-3 text-base font-normal border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {POST_TYPE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.icon} {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target Group */}
                <div>
                  <label className="block text-sm font-semibold tracking-tight text-gray-900 mb-2">
                    <span className="inline-flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Target Group (Optional)
                    </span>
                  </label>
                  <select
                    value={formData.target_group_id || ''}
                    onChange={(e) => setFormData({ ...formData, target_group_id: e.target.value ? Number(e.target.value) : null })}
                    className="w-full px-4 py-3 text-base font-normal border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Public (Everyone)</option>
                    {groups.map(group => (
                      <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold tracking-tight text-gray-900 mb-2">
                  <span className="inline-flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Image (Optional)
                  </span>
                </label>
                
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                    <button
                      onClick={() => {
                        setImagePreview(null);
                        setFormData({ ...formData, image_url: null });
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-xs text-gray-600">
                        {uploadingImage ? 'Uploading...' : 'Click to upload image'}
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                  </label>
                )}
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs font-normal text-blue-900">
                    <p className="font-semibold mb-1">💡 Tips for great posts:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Use a clear, descriptive title</li>
                      <li>Keep content concise and engaging</li>
                      <li>Add images to increase engagement</li>
                      <li>Target specific groups for relevant content</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3 rounded-b-2xl border-t border-gray-200">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="px-5 py-2.5 text-sm font-semibold tracking-tight text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePost}
                disabled={creating || !formData.title.trim() || !formData.content.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold tracking-tight rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {creating ? 'Creating...' : 'Publish Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal Placeholder */}
      {showDetailModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">Post Details</h2>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedPost(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600">Comments and detailed view coming soon...</p>
            </div>
          </div>
        </div>
      )}

      {/* AI Rewrite Result Modal */}
      {showAIRewrite && rewriteResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Wand2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">AI Rewrite Result</h2>
                  <p className="text-sm text-purple-100 mt-0.5">Enhanced with AI for better engagement</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAIRewrite(false);
                  setRewriteResult(null);
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-700">{rewriteResult.wordCountBefore}</div>
                  <div className="text-xs text-purple-600 mt-1">Words Before</div>
                </div>
                <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-pink-700">{rewriteResult.wordCountAfter}</div>
                  <div className="text-xs text-pink-600 mt-1">Words After</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-700">
                    {rewriteResult.improvements.length}
                  </div>
                  <div className="text-xs text-green-600 mt-1">Improvements</div>
                </div>
              </div>

              {/* Title Comparison - Only show if title was rewritten */}
              {rewriteResult.rewrittenTitle && formData.title && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="text-sm font-semibold tracking-tight text-gray-900">Title Enhancement</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Original Title */}
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-2">Original Title</div>
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                        <p className="text-sm font-medium text-gray-800 leading-relaxed">
                          {formData.title}
                        </p>
                      </div>
                    </div>
                    {/* AI Enhanced Title */}
                    <div>
                      <div className="text-xs font-medium text-purple-600 mb-2">AI Enhanced Title</div>
                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                        <p className="text-sm font-semibold text-purple-900 leading-relaxed">
                          {rewriteResult.rewrittenTitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Content Comparison */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-purple-100 rounded-lg">
                    <Edit2 className="w-4 h-4 text-purple-600" />
                  </div>
                  <h3 className="text-sm font-semibold tracking-tight text-gray-900">Content Enhancement</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Original */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-gray-100 rounded-lg">
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </div>
                      <h4 className="text-xs font-semibold tracking-tight text-gray-700">Original Content</h4>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 max-h-64 overflow-y-auto">
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {rewriteResult.original}
                      </p>
                    </div>
                  </div>

                  {/* Rewritten */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-purple-100 rounded-lg">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                      </div>
                      <h4 className="text-xs font-semibold tracking-tight text-purple-700">AI Enhanced Content</h4>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 max-h-64 overflow-y-auto">
                      <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                        {rewriteResult.rewrittenContent || rewriteResult.rewritten}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Improvements */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-green-100 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="text-sm font-semibold tracking-tight text-gray-900">Key Improvements</h3>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <ul className="space-y-2">
                    {rewriteResult.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-green-900">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs font-normal text-blue-900">
                    <p className="font-semibold mb-1">💡 About AI Rewrite:</p>
                    <p>
                      The AI has enhanced your content while preserving your original message. 
                      You can apply these changes or keep your original text. The rewrite considers 
                      the selected style and tone to match your communication goals.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3 rounded-b-2xl border-t border-gray-200">
              <button
                onClick={() => {
                  setShowAIRewrite(false);
                  setRewriteResult(null);
                }}
                className="px-5 py-2.5 text-sm font-semibold tracking-tight text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-xl transition-colors"
              >
                Keep Original
              </button>
              <button
                onClick={handleApplyRewrite}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold tracking-tight rounded-xl hover:shadow-lg transition-all duration-200"
              >
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Apply AI Rewrite
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
