import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  FileText, 
  Calendar, 
  TrendingUp, 
  Users, 
  BarChart3,
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
  ArrowUpRight,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPosts: 0,
    scheduledPosts: 0,
    connectedPlatforms: 0,
    engagementRate: 0
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      // Try to fetch posts and stats from backend
      const [postsResponse] = await Promise.all([
        fetch('/post?limit=5').then(res => {
          if (!res.ok) throw new Error('Backend not available');
          return res.json();
        })
      ]);

      setRecentPosts(postsResponse.posts || []);
      
      // Calculate stats
      const totalPosts = postsResponse.total || 0;
      const scheduledPosts = postsResponse.posts?.filter(post => post.status === 'scheduled').length || 0;
      const connectedPlatforms = Object.values(user?.socialConnections || {}).filter(platform => platform.connected).length;
      
      setStats({
        totalPosts,
        scheduledPosts,
        connectedPlatforms,
        engagementRate: 15.2 // Mock data
      });
    } catch (error) {
      // If backend is not available (e.g., on GitHub Pages), use mock data
      const mockPosts = [
        {
          id: 'demo-1',
          title: 'Welcome to Steward!',
          content: 'This is a demo post to showcase the platform capabilities.',
          status: 'posted',
          platforms: ['twitter', 'linkedin'],
          createdAt: new Date().toISOString(),
          scheduledAt: null
        },
        {
          id: 'demo-2', 
          title: 'Getting Started with Social Media Management',
          content: 'Learn how to effectively manage your social media presence with Steward.',
          status: 'scheduled',
          platforms: ['instagram', 'facebook'],
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          scheduledAt: new Date(Date.now() + 86400000).toISOString() // 1 day from now
        },
        {
          id: 'demo-3',
          title: 'Analytics and Insights',
          content: 'Track your performance with detailed analytics and insights.',
          status: 'posted',
          platforms: ['twitter'],
          createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          scheduledAt: null
        }
      ];

      setRecentPosts(mockPosts);
      
      // Calculate stats from mock data
      const totalPosts = mockPosts.length;
      const scheduledPosts = mockPosts.filter(post => post.status === 'scheduled').length;
      const connectedPlatforms = Object.values(user?.socialConnections || {}).filter(platform => platform.connected).length;
      
      setStats({
        totalPosts,
        scheduledPosts,
        connectedPlatforms,
        engagementRate: 15.2 // Mock data
      });
    } finally {
      setLoading(false);
    }
  }, [user?.socialConnections]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'posted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'posted':
        return 'text-green-600 bg-green-50';
      case 'scheduled':
        return 'text-blue-600 bg-blue-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.profile?.name || user?.username}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">{stats.scheduledPosts}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Connected Platforms</p>
              <p className="text-2xl font-bold text-gray-900">{stats.connectedPlatforms}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.engagementRate}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Create Post Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="space-y-3">
            <Link
              to="/create"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Create New Post</p>
                  <p className="text-sm text-gray-600">Share content across all platforms</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400" />
            </Link>

            <Link
              to="/posts"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">View All Posts</p>
                  <p className="text-sm text-gray-600">Manage your content history</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400" />
            </Link>
          </div>
        </div>

        {/* Platform Connections */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Platform Connections</h3>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Twitter', icon: Twitter, color: 'text-blue-400', connected: user?.socialConnections?.twitter?.connected },
              { name: 'LinkedIn', icon: Linkedin, color: 'text-blue-600', connected: user?.socialConnections?.linkedin?.connected },
              { name: 'Instagram', icon: Instagram, color: 'text-pink-500', connected: user?.socialConnections?.instagram?.connected },
              { name: 'Facebook', icon: Facebook, color: 'text-blue-600', connected: user?.socialConnections?.facebook?.connected }
            ].map((platform) => {
              const Icon = platform.icon;
              return (
                <div key={platform.name} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${platform.color}`} />
                    <span className="font-medium text-gray-900">{platform.name}</span>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    platform.connected 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {platform.connected ? 'Connected' : 'Not Connected'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Posts</h3>
          <Link to="/posts" className="text-primary-600 hover:text-primary-500 font-medium">
            View all
          </Link>
        </div>
        
        {recentPosts.length > 0 ? (
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div key={post._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(post.status)}
                  <div>
                    <p className="font-medium text-gray-900">
                      {post.content.text.length > 50 
                        ? `${post.content.text.substring(0, 50)}...` 
                        : post.content.text
                      }
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                  {post.status}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No posts yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first post.</p>
            <div className="mt-6">
              <Link
                to="/create"
                className="btn-primary inline-flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
