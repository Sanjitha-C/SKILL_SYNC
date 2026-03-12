import { useState } from 'react';
import api from '../../api/axios';

const AdminMessages = () => {
  const [form, setForm] = useState({ title: '', body: '', targetRole: 'student' });
  const [info, setInfo] = useState('');

  const sendMessage = async (event) => {
    event.preventDefault();
    setInfo('');
    try {
      await api.post('/admin/messages', form);
      setForm({ title: '', body: '', targetRole: 'student' });
      setInfo('Message sent successfully.');
    } catch (err) {
      setInfo(err.response?.data?.message || 'Failed to send message.');
    }
  };

  return (
    <div className="card">
      <h3>Notify Students</h3>
      <form className="stack" onSubmit={sendMessage}>
        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea rows="4" placeholder="Message" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required />
        <select value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })}>
          <option value="student">Students</option>
          <option value="all">All</option>
          <option value="admin">Admins</option>
        </select>
        <button type="submit">Send Notification</button>
        {info ? <small>{info}</small> : null}
      </form>
    </div>
  );
};

export default AdminMessages;