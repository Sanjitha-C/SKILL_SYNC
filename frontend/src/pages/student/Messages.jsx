import { useEffect, useState } from 'react';
import api from '../../api/axios';

const Messages = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get('/student/messages');
      setItems(data);
    };
    load();
  }, []);

  return (
    <div className="card">
      <h3>Messages</h3>
      <div className="list">
        {items.map((item) => (
          <div className="list-item" key={item._id}>
            <strong>{item.title}</strong>
            <span>{item.body}</span>
            <small>By {item.createdBy?.name || 'Admin'}</small>
          </div>
        ))}
        {items.length === 0 ? <p>No notifications yet.</p> : null}
      </div>
    </div>
  );
};

export default Messages;
