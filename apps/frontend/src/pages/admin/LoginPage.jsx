import React from 'react';
import { useLogin } from '../../hooks';
import { Input, Button, ErrorMessage } from '../../components/ui';

const LoginPage = () => {
  const {
    formData,
    errors,
    apiError,
    loading,
    handleChange,
    handleSubmit,
    navigateToMenu,
  } = useLogin();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">OrderEase Admin</h1>
          <p className="text-gray-600">Sign in to manage your restaurant</p>
        </div>

        {apiError && (
          <div className="mb-6">
            <ErrorMessage message={apiError} />
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="admin@example.com"
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Enter your password"
              required
            />
          </div>

          <Button
            type="submit"
            fullWidth
            loading={loading}
            className="mt-6"
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={navigateToMenu}
            className="text-orange-600 hover:text-orange-700 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 rounded px-2 py-1"
            aria-label="Back to menu"
          >
            ← Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
