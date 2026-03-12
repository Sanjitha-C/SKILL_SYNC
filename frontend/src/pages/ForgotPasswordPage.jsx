import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        <p>Please contact your institution administrator to reset your password.</p>
        <small>
          Return to <Link to="/login">Login</Link>
        </small>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
