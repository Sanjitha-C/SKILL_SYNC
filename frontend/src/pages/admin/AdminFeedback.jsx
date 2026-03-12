import { useEffect, useState } from 'react';
import api from '../../api/axios';

const AdminFeedback = () => {
  const [events, setEvents] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');

  useEffect(() => {
    const load = async () => {
      const [{ data: eventsData }, { data: feedbackData }] = await Promise.all([
        api.get('/admin/events'),
        api.get('/admin/reports/feedbacks')
      ]);

      setEvents(eventsData);
      setFeedbacks(feedbackData);

      if (eventsData.length > 0) {
        setSelectedEventId(eventsData[0]._id);
      }
    };

    load();
  }, []);

  const filteredFeedbacks = selectedEventId
    ? feedbacks.filter((item) => String(item.event?._id) === String(selectedEventId))
    : [];

  const formatEventDate = (dateValue) => {
    if (!dateValue) return '';
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toLocaleDateString();
  };

  return (
    <div className="card">
      <h3>Student Feedback (Attended Events)</h3>
      <div className="stack" style={{ marginTop: 10 }}>
        <label htmlFor="event-feedback-select">Select Event</label>
        <select id="event-feedback-select" value={selectedEventId} onChange={(event) => setSelectedEventId(event.target.value)}>
          {events.map((item) => (
            <option key={item._id} value={item._id}>
              {item.title}
              {item.date ? ` (${formatEventDate(item.date)})` : ''}
            </option>
          ))}
        </select>
      </div>
      <div className="list">
        {filteredFeedbacks.map((item) => (
          <div className="list-item" key={item._id}>
            <strong>{item.event?.title || 'Unknown Event'}</strong>
            <span>Rating: {item.rating}/5</span>
            <span>{item.comment || 'No comment provided.'}</span>
            <small>
              Student: {item.student?.name || 'Unknown'} ({item.student?.email || 'No email'})
            </small>
          </div>
        ))}
        {events.length === 0 ? <p>No events available yet.</p> : null}
        {events.length > 0 && filteredFeedbacks.length === 0 ? <p>No student feedback submitted for this event yet.</p> : null}
      </div>
    </div>
  );
};

export default AdminFeedback;