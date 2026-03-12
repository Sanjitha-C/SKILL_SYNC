import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    year: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const raw = sessionStorage.getItem('signup_credentials');
    if (!raw) return;

    try {
      const saved = JSON.parse(raw);
      setForm((prev) => ({ ...prev, ...saved }));
    } catch {
      sessionStorage.removeItem('signup_credentials');
    }
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password || !form.department || !form.year) {
      setError('Please fill all fields.');
      return;
    }

    sessionStorage.setItem('signup_credentials', JSON.stringify(form));
    navigate('/signup/interests');
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <h2>Student Signup</h2>
        <p>Step 1: Enter your details</p>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
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
        <input
          placeholder="Department"
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
          required
        />
        <input placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} required />
        {error ? <span className="error-text">{error}</span> : null}
        <button type="submit">Next</button>
        <small>
          Already have an account? <Link to="/login">Login</Link>
        </small>
      </form>
    </div>
  );
};

export default SignupPage;
