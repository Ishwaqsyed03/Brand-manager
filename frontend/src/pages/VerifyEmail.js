import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      setLoading(true);
      try {
        const res = await fetch('/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const data = await res.json();
        if (res.ok) {
          setSuccess(true);
          toast.success(data.message);
          setTimeout(() => navigate('/login'), 2000);
        } else {
          toast.error(data.error || 'Verification failed');
        }
      } catch (err) {
        toast.error('Network error');
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h2 className="mt-6 text-3xl font-bold text-gray-900">Email Verification</h2>
        {loading ? (
          <p className="mt-4 text-gray-600">Verifying your email...</p>
        ) : success ? (
          <p className="mt-4 text-green-600">Your email has been verified! Redirecting to login...</p>
        ) : (
          <p className="mt-4 text-red-600">Verification failed. Please try again.</p>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
