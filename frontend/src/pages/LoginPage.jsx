import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data);
      if (data.user.role === 'admin') navigate('/admin/manage-events');
      else navigate('/student/institution');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <div className="auth-header-row">
          <img className="auth-logo" src="/kct-logo.png" alt="Kumaraguru College Logo" />
          <h2>Institutional Login</h2>
        </div>
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        {error ? <span className="error-text">{error}</span> : null}
        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Login'}
        </button>
        <small>
          <Link to="/forgot-password">Forgot Password?</Link>
        </small>
        <small>
          New student? <Link to="/signup">Create account</Link>
        </small>
        <p className="auth-disclaimer">
          By logging in, you agree to the website's Terms of Service, Cookie Policy and Privacy Policy.
        </p>
        <p className="auth-disclaimer">
          This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
