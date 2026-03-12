import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import TagInputWithSuggestions from '../../components/TagInputWithSuggestions';
import { DOMAIN_OPTIONS, INTEREST_OPTIONS } from '../../constants/profileOptions';

const AdminManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    venue: '',
    registrationFee: '',
    slots: '',
    registrationLink: '',
    interests: [],
    domains: []
  });
  const [poster, setPoster] = useState(null);
  const [message, setMessage] = useState('');

  const fetchEvents = async () => {
    const { data } = await api.get('/admin/events');
    setEvents(data);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const onCreate = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const payload = new FormData();
      payload.append('title', form.title);
      payload.append('description', form.description);
      payload.append('date', form.date);
      payload.append('venue', form.venue);
      payload.append('registrationFee', form.registrationFee || 0);
      payload.append('slots', form.slots || 0);
      payload.append('registrationLink', form.registrationLink || '');
      payload.append('interests', JSON.stringify(form.interests));
      payload.append('domains', JSON.stringify(form.domains));
      if (poster) payload.append('poster', poster);
      await api.post('/admin/events', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm({
        title: '',
        description: '',
        date: '',
        venue: '',
        registrationFee: '',
        slots: '',
        registrationLink: '',
        interests: [],
        domains: []
      });
      setPoster(null);
      setMessage('Event published successfully.');
      fetchEvents();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to publish event.');
    } finally {
      setLoading(false);
    }
  };

  const sortedEvents = useMemo(() => [...events].sort((a, b) => new Date(a.date) - new Date(b.date)), [events]);

  return (
    <div className="grid-2">
      <div className="card">
        <h3>Create New Event</h3>
        <form className="stack" onSubmit={onCreate}>
          <input placeholder="Event Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea
            rows="4"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />

          <TagInputWithSuggestions
            label="Event Interests"
            placeholder="Type/select interests"
            suggestions={INTEREST_OPTIONS}
            values={form.interests}
            onChange={(nextValues) => setForm({ ...form, interests: nextValues })}
            variant="interest"
          />

          <TagInputWithSuggestions
            label="Event Domains"
            placeholder="Type/select domains"
            suggestions={DOMAIN_OPTIONS}
            values={form.domains}
            onChange={(nextValues) => setForm({ ...form, domains: nextValues })}
            variant="domain"
          />

          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          <input placeholder="Venue" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} required />
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Registration Fee"
            value={form.registrationFee}
            onChange={(e) => setForm({ ...form, registrationFee: e.target.value })}
            required
          />
          <input
            type="number"
            min="1"
            step="1"
            placeholder="No. of Slots"
            value={form.slots}
            onChange={(e) => setForm({ ...form, slots: e.target.value })}
            required
          />
          <input
            type="url"
            placeholder="Registration Link (optional)"
            value={form.registrationLink}
            onChange={(e) => setForm({ ...form, registrationLink: e.target.value })}
          />
          <input type="file" accept="image/*" onChange={(e) => setPoster(e.target.files?.[0] || null)} />
          <button type="submit" disabled={loading}>
            {loading ? 'Publishing...' : 'Publish Event'}
          </button>
          {message ? <small>{message}</small> : null}
        </form>
      </div>
      <div className="card">
        <h3>Published Events</h3>
        <div className="list">
          {sortedEvents.map((event) => (
            <div key={event._id} className="list-item">
              <strong>{event.title}</strong>
              <span>
                {new Date(event.date).toLocaleDateString()} • {event.venue}
              </span>
              <small>Registration Fee: ₹{Number(event.registrationFee || 0).toFixed(2)}</small>
              <small>Slots: {Number.isFinite(Number(event.slots)) ? Number(event.slots) : 0}</small>
              {event.registrationLink ? <small>Registration Link: {event.registrationLink}</small> : null}
              <small>Interests: {(event.interests || []).join(', ') || event.category || 'General'}</small>
              <small>Domains: {(event.domains || []).join(', ') || 'General'}</small>
            </div>
          ))}
          {sortedEvents.length === 0 ? <p>No events yet.</p> : null}
        </div>
      </div>
    </div>
  );
};

export default AdminManageEvents;
