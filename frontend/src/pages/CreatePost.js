import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Twitter, 
  Linkedin, 
  Instagram, 
  Facebook, 
  Image, 
  Calendar,
  Send,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const CreatePost = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    text: '',
    platforms: [],
    scheduledFor: '',
    tags: []
  });
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiTone, setAiTone] = useState('neutral');
  const [aiPlatform, setAiPlatform] = useState('generic');
  const [aiLoadingText, setAiLoadingText] = useState(false);
  const [aiLoadingImage, setAiLoadingImage] = useState(false);
  const [aiMedia, setAiMedia] = useState([]); // { url }

  const platforms = [
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'text-blue-400' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-600' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600' }
  ];

  const handlePlatformToggle = (platformId) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(id => id !== platformId)
        : [...prev.platforms, platformId]
    }));
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
      return validTypes.includes(file.type);
    });

    if (validFiles.length !== files.length) {
      toast.error('Some files were skipped. Only images and videos are supported.');
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleFileRemove = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.text.trim()) {
      toast.error('Please enter some content');
      return;
    }

    if (formData.platforms.length === 0) {
      toast.error('Please select at least one platform');
      return;
    }

    setLoading(true);

    try {
      const postData = {
        text: formData.text,
        platforms: formData.platforms,
        scheduledFor: formData.scheduledFor || null,
        tags: formData.tags
      };

      // Handle file uploads if any
      if (selectedFiles.length > 0) {
        const formDataFiles = new FormData();
        selectedFiles.forEach((file, index) => {
          formDataFiles.append(`media`, file);
        });

        // Upload files first
        const uploadResponse = await axios.post('/upload', formDataFiles, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        postData.media = uploadResponse.data.media;
      }

      // Merge AI-generated media URLs if any
      if (aiMedia.length > 0) {
        postData.media = [ ...(postData.media || []), ...aiMedia.map((m) => ({ url: m.url })) ];
      }

      await axios.post('/post', postData);
      toast.success('Post created successfully!');
      navigate('/posts');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateText = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Enter a prompt for AI generation');
      return;
    }
    setAiLoadingText(true);
    try {
      const platformCharLimits = {
        twitter: 280,
        x: 280,
        linkedin: 3000,
        instagram: 2200,
        facebook: 63206,
        generic: 500
      };
      const maxLength = platformCharLimits[aiPlatform] || 500;

      const { data } = await axios.post('/ai/generate-text', {
        prompt: aiPrompt,
        tone: aiTone,
        platform: aiPlatform,
        maxLength
      });
      const generated = (data.text || '').slice(0, maxLength);
      setFormData((prev) => ({ ...prev, text: generated }));
      toast.success('Text generated');
    } catch (err) {
      toast.error('Failed to generate text');
    } finally {
      setAiLoadingText(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Enter a prompt for image generation');
      return;
    }
    setAiLoadingImage(true);
    try {
      const { data } = await axios.post('/ai/generate-image', { prompt: aiPrompt });
      if (data.url) {
        setAiMedia((prev) => [...prev, { url: data.url }]);
        toast.success('Image generated');
      } else {
        toast.error('No image URL returned');
      }
    } catch (err) {
      toast.error('Failed to generate image');
    } finally {
      setAiLoadingImage(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Post</h1>
        <p className="text-gray-600">Share your content across multiple platforms</p>
      </div>

      {/* AI Assistant */}
      <div className="card mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Assistant</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="form-label">Prompt</label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="input-field min-h-[80px] resize-none"
                placeholder="Describe what you want to create..."
              />
            </div>
            <div>
              <label className="form-label">Tone</label>
              <select
                value={aiTone}
                onChange={(e) => setAiTone(e.target.value)}
                className="input-field"
              >
                <option value="neutral">Neutral</option>
                <option value="friendly">Friendly</option>
                <option value="professional">Professional</option>
                <option value="witty">Witty</option>
              </select>
              <label className="form-label mt-4 block">Platform</label>
              <select
                value={aiPlatform}
                onChange={(e) => setAiPlatform(e.target.value)}
                className="input-field"
              >
                <option value="generic">Generic</option>
                <option value="twitter">Twitter/X</option>
                <option value="linkedin">LinkedIn</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
              </select>
              <div className="flex space-x-2 mt-4">
                <button
                  type="button"
                  onClick={handleGenerateText}
                  disabled={aiLoadingText}
                  className="btn-secondary"
                >
                  {aiLoadingText ? 'Generating...' : 'Generate Text'}
                </button>
                <button
                  type="button"
                  onClick={handleGenerateImage}
                  disabled={aiLoadingImage}
                  className="btn-secondary"
                >
                  {aiLoadingImage ? 'Generating...' : 'Generate Image'}
                </button>
              </div>
            </div>
          </div>

          {aiMedia.length > 0 && (
            <div>
              <label className="form-label">Generated Images</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {aiMedia.map((m, idx) => (
                  <div key={idx} className="relative">
                    <img src={m.url} alt="AI" className="w-full h-32 object-cover rounded-lg border" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Content Section */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Content</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="content" className="form-label">
                What's on your mind?
              </label>
              <textarea
                id="content"
                value={formData.text}
                onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                className="input-field min-h-[120px] resize-none"
                placeholder="Write your post content here..."
                maxLength={280}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">
                  {formData.text.length}/280 characters
                </span>
                {formData.text.length > 250 && (
                  <span className="text-sm text-red-500">
                    {280 - formData.text.length} characters remaining
                  </span>
                )}
              </div>
            </div>

            {/* Media Upload */}
            <div>
              <label className="form-label">Media (Optional)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Image className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="file-upload" className="btn-primary cursor-pointer">
                    Choose files
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileSelect}
                    />
                  </label>
                  <p className="mt-2 text-xs text-gray-500">
                    PNG, JPG, GIF, MP4 up to 10MB
                  </p>
                </div>
              </div>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleFileRemove(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Platform Selection */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Platforms</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {platforms.map((platform) => {
              const Icon = platform.icon;
              const isSelected = formData.platforms.includes(platform.id);
              
              return (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => handlePlatformToggle(platform.id)}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${platform.color}`} />
                  <p className="font-medium text-gray-900">{platform.name}</p>
                  {isSelected && (
                    <div className="mt-2 w-4 h-4 bg-primary-500 rounded-full mx-auto"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scheduling */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule (Optional)</h3>
          <div className="flex items-center space-x-4">
            <Calendar className="w-5 h-5 text-gray-400" />
            <input
              type="datetime-local"
              value={formData.scheduledFor}
              onChange={(e) => setFormData(prev => ({ ...prev, scheduledFor: e.target.value }))}
              className="input-field flex-1"
            />
          </div>
        </div>

        {/* Tags */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
                placeholder="Add a tag..."
                className="input-field flex-1"
              />
              <button
                type="button"
                onClick={handleTagAdd}
                className="btn-secondary"
              >
                Add
              </button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-700"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleTagRemove(tag)}
                      className="ml-2 text-primary-500 hover:text-primary-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {formData.scheduledFor ? 'Schedule Post' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
