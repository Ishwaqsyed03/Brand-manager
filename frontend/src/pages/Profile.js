import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Mail, 
  Settings, 
  Save, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Facebook,
  Link as LinkIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.profile?.name || '',
    bio: user?.profile?.bio || '',
    avatar: user?.profile?.avatar || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialConnect = (platform) => {
    // This would typically redirect to OAuth flow
    toast.info(`${platform} connection not implemented yet`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600">Manage your account and social media connections</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center mb-6">
              <User className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="form-label">Full Name</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="bio" className="form-label">Bio</label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  className="input-field min-h-[100px] resize-none"
                  placeholder="Tell us about yourself..."
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500">
                    {formData.bio.length}/500 characters
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="avatar" className="form-label">Avatar URL</label>
                <input
                  type="url"
                  id="avatar"
                  value={formData.avatar}
                  onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
                  className="input-field"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Social Media Connections */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="flex items-center mb-6">
              <LinkIcon className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Social Connections</h3>
            </div>

            <div className="space-y-4">
              {[
                { 
                  name: 'Twitter', 
                  icon: Twitter, 
                  color: 'text-blue-400', 
                  connected: user?.socialConnections?.twitter?.connected,
                  username: user?.socialConnections?.twitter?.username
                },
                { 
                  name: 'LinkedIn', 
                  icon: Linkedin, 
                  color: 'text-blue-600', 
                  connected: user?.socialConnections?.linkedin?.connected,
                  username: user?.socialConnections?.linkedin?.username
                },
                { 
                  name: 'Instagram', 
                  icon: Instagram, 
                  color: 'text-pink-500', 
                  connected: user?.socialConnections?.instagram?.connected,
                  username: user?.socialConnections?.instagram?.username
                },
                { 
                  name: 'Facebook', 
                  icon: Facebook, 
                  color: 'text-blue-600', 
                  connected: user?.socialConnections?.facebook?.connected,
                  username: user?.socialConnections?.facebook?.username
                }
              ].map((platform) => {
                const Icon = platform.icon;
                return (
                  <div key={platform.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-5 h-5 ${platform.color}`} />
                      <div>
                        <p className="font-medium text-gray-900">{platform.name}</p>
                        {platform.connected && platform.username && (
                          <p className="text-sm text-gray-500">@{platform.username}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleSocialConnect(platform.name)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        platform.connected 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {platform.connected ? 'Connected' : 'Connect'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Account Information */}
          <div className="card mt-6">
            <div className="flex items-center mb-6">
              <Mail className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="input-field bg-gray-50"
                />
              </div>

              <div>
                <label className="form-label">Username</label>
                <input
                  type="text"
                  value={user?.username || ''}
                  disabled
                  className="input-field bg-gray-50"
                />
              </div>

              <div>
                <label className="form-label">Member Since</label>
                <input
                  type="text"
                  value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''}
                  disabled
                  className="input-field bg-gray-50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
