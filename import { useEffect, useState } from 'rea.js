import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EmailConfirm = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const response = await fetch(`/api/auth/confirm/${token}`);
        if (response.ok) {
          navigate('/login');
        } else {
          const data = await response.json();
          setError(data.error);
        }
      } catch (err) {
        setError('Something went wrong');
      }
    };
    confirmEmail();
  }, [token, navigate]);

  return (
    <div>
      {error ? <p>Error: {error}</p> : <p>Confirming your email...</p>}
    </div>
  );
};

export default EmailConfirm;