import { useEffect, useState } from 'react';
import api from '../../api/axios';

const Progress = () => {
  const [progress, setProgress] = useState({ attendedCount: 0, registrationCount: 0, completion: 0, badge: 'Explorer' });

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get('/student/progress');
      setProgress(data);
    };
    load();
  }, []);

  return (
    <div className="card">
      <h3>Progress Tracker</h3>
      <p>Badge: {progress.badge}</p>
      <p>
        Attended {progress.attendedCount} of {progress.registrationCount} registered events
      </p>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress.completion}%` }} />
      </div>
      <small>{progress.completion}% completion</small>
    </div>
  );
};

export default Progress;
