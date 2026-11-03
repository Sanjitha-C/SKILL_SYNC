import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { AUTH_REQUEST_TIMEOUT_MS, getApiErrorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TagInputWithSuggestions from '../components/TagInputWithSuggestions';
import { DOMAIN_OPTIONS, INTEREST_OPTIONS } from '../constants/profileOptions';

const SignupInterestsPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [credentials, setCredentials] = useState(null);
  const [interests, setInterests] = useState([]);
  const [interestedDomains, setInterestedDomains] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('signup_credentials');
    if (!raw) {
      navigate('/signup');
      return;
    }
    setCredentials(JSON.parse(raw));
  }, [navigate]);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!credentials) return;

    setError('');
    setLoading(true);
    try {
      const payload = { ...credentials, interests, interestedDomains };
      const { data } = await api.post('/auth/signup', payload, { timeout: AUTH_REQUEST_TIMEOUT_MS });
      sessionStorage.removeItem('signup_credentials');
      login(data);
      navigate('/student/institution');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Signup failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <h2>Student Signup</h2>
        <p>Step 2: Add interests and domains</p>
        <div className="stack">
          <TagInputWithSuggestions
            label="Interests"
            placeholder="Type an interest and press Enter"
            suggestions={INTEREST_OPTIONS}
            values={interests}
            onChange={setInterests}
            variant="interest"
          />

          <TagInputWithSuggestions
            label="Interested Domains"
            placeholder="Type a domain and press Enter"
            suggestions={DOMAIN_OPTIONS}
            values={interestedDomains}
            onChange={setInterestedDomains}
            variant="domain"
          />
        </div>
        {error ? <span className="error-text">{error}</span> : null}
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Account'}
        </button>
        <small>
          Back to <Link to="/signup">Step 1</Link>
        </small>
      </form>
    </div>
  );
};

export default SignupInterestsPage;
