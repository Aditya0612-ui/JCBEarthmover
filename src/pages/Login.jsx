import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InputField from '../components/common/InputField';
import Button from '../components/common/Button';
import { Mail, Lock, Phone, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, signInWithPhone } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [usePhoneAuth, setUsePhoneAuth] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    phoneNumber: '',
    otp: ''
  });
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(formData.email, formData.password, formData.displayName);
      } else {
        await signInWithEmail(formData.email, formData.password);
      }
      navigate('/');
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (error) {
      console.error('Google sign-in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!confirmationResult) {
        // Send OTP
        const appVerifier = window.recaptchaVerifier;
        const result = await signInWithPhone(formData.phoneNumber, appVerifier);
        setConfirmationResult(result);
        toast.success('OTP sent to your phone!');
      } else {
        // Verify OTP
        await confirmationResult.confirm(formData.otp);
        navigate('/');
      }
    } catch (error) {
      console.error('Phone auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="bg-primary-100 p-4 rounded-full">
            <Truck className="text-primary-600" size={48} />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="text-center text-gray-600 mb-8">
          JCB & Earthmover Rental Management
        </p>

        {/* Auth method toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setUsePhoneAuth(false)}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              !usePhoneAuth
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Email
          </button>
          <button
            onClick={() => setUsePhoneAuth(true)}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              usePhoneAuth
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Phone
          </button>
        </div>

        {/* Email/Password Form */}
        {!usePhoneAuth ? (
          <form onSubmit={handleEmailAuth}>
            {isSignUp && (
              <InputField
                label="Full Name"
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                icon={Mail}
              />
            )}

            <InputField
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              icon={Mail}
            />

            <InputField
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              icon={Lock}
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
              className="mb-4"
            >
              {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </form>
        ) : (
          /* Phone Auth Form */
          <form onSubmit={handlePhoneAuth}>
            {!confirmationResult ? (
              <InputField
                label="Phone Number"
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+91 1234567890"
                required
                icon={Phone}
              />
            ) : (
              <InputField
                label="OTP"
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                placeholder="Enter 6-digit OTP"
                required
                icon={Lock}
              />
            )}

            <div id="recaptcha-container"></div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
              className="mb-4"
            >
              {loading ? 'Please wait...' : confirmationResult ? 'Verify OTP' : 'Send OTP'}
            </Button>
          </form>
        )}

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        {/* Google Sign In */}
        <Button
          onClick={handleGoogleSignIn}
          variant="outline"
          fullWidth
          disabled={loading}
          className="mb-4"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Sign in with Google
        </Button>

        {/* Toggle Sign Up/Sign In */}
        {!usePhoneAuth && (
          <p className="text-center text-sm text-gray-600">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary-500 font-semibold hover:underline"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
