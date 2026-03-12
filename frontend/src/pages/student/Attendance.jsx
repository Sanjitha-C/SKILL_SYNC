import { useEffect, useState } from 'react';
import api from '../../api/axios';

const Attendance = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get('/student/attendance');
      setItems(data);
    };
    load();
  }, []);

  return (
    <div className="card">
      <h3>Attendance</h3>
      <div className="list">
        {items.map((item) => (
          <div className="list-item" key={item._id}>
            <strong>{item.event?.title}</strong>
            <span>
              {item.event?.category} • {new Date(item.event?.date).toLocaleDateString()}
            </span>
          </div>
        ))}
        {items.length === 0 ? <p>No attended events yet.</p> : null}
      </div>
    </div>
  );
};

export default Attendance;
