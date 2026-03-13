import { useEffect, useState } from 'react';
import api from '../../api/axios';

const EventDropdown = ({ item }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid var(--border, #e5e7eb)' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', padding: '10px 0', background: 'none',
          border: 'none', cursor: 'pointer', fontWeight: 600,
          color: 'inherit', fontSize: '0.95rem'
        }}
      >
        <span>{item.title}</span>
        <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{ padding: '6px 0 12px 12px', display: 'flex', gap: '24px' }}>
          <span style={{ fontSize: '0.9rem' }}>
            <strong>Registered:</strong> {item.registrations}
          </span>
          <span style={{ fontSize: '0.9rem' }}>
            <strong>Present:</strong> {item.attendance}
          </span>
        </div>
      )}
    </div>
  );
};

const AdminReports = () => {
  const assetBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
  const [report, setReport] = useState({ byEvent: [], totals: {}, eventSummaries: [] });
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ eventId: '', title: '', summary: '', images: [] });
  const [info, setInfo] = useState('');

  const load = async () => {
    const [{ data: reportData }, { data: eventsData }] = await Promise.all([api.get('/admin/reports/summary'), api.get('/admin/events')]);
    setReport(reportData);
    setEvents(eventsData);
    if (!form.eventId && eventsData.length > 0) {
      setForm((prev) => ({ ...prev, eventId: eventsData[0]._id }));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const publishSummary = async (event) => {
    event.preventDefault();
    setInfo('');
    try {
      const payload = new FormData();
      payload.append('eventId', form.eventId);
      payload.append('title', form.title);
      payload.append('summary', form.summary);
      form.images.forEach((file) => payload.append('images', file));

      await api.post('/admin/reports/event-summaries', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setForm((prev) => ({ ...prev, title: '', summary: '', images: [] }));
      setInfo('Event summary published successfully.');
      await load();
    } catch (err) {
      setInfo(err.response?.data?.message || 'Failed to publish event summary.');
    }
  };

  return (
    <div className="stack">
      <div className="grid-2">
        <div className="card">
          <h3>Analytics Summary</h3>
          <p>Total Events: {report.totals.totalEvents || 0}</p>
          <p>Total Registrations: {report.totals.totalRegistrations || 0}</p>
          <p>Total Attendance: {report.totals.totalAttendance || 0}</p>
          {report.byEvent.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <p style={{ fontWeight: 600, marginBottom: '6px', fontSize: '0.9rem', opacity: 0.7 }}>
                Events Breakdown
              </p>
              {report.byEvent.map((item) => (
                <EventDropdown key={item.eventId} item={item} />
              ))}
            </div>
          )}
        </div>
        <div className="card">
          <h3>Publish Event Outcome Summary</h3>
          <form className="stack" onSubmit={publishSummary}>
            <select value={form.eventId} onChange={(e) => setForm((prev) => ({ ...prev, eventId: e.target.value }))} required>
              {events.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.title}
                </option>
              ))}
            </select>
            <input
              placeholder="Heading (optional)"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            />
            <textarea
              rows="5"
              placeholder="How did the event go?"
              value={form.summary}
              onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
              required
            />
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setForm((prev) => ({ ...prev, images: Array.from(e.target.files || []) }))}
            />
            <button type="submit" disabled={!form.eventId}>
              Publish Summary
            </button>
            {form.images.length > 0 ? <small>{form.images.length} image(s) selected.</small> : null}
            {info ? <small>{info}</small> : null}
          </form>
        </div>
      </div>

      <div className="card">
        <h3>Published Event Summaries</h3>
        <div className="list">
          {report.eventSummaries.map((item) => (
            <div className="list-item" key={item._id}>
              <strong>{item.title || `How ${item.event?.title || 'the event'} went`}</strong>
              <span>{item.summary}</span>
              <small>
                Event: {item.event?.title || 'Unknown'} | By {item.publishedBy?.name || 'Admin'}
              </small>
              {item.imageUrls?.length ? (
                <div className="image-grid">
                  {item.imageUrls.map((url) => (
                    <img key={url} className="event-summary-image" src={`${assetBaseUrl}${url}`} alt="Event outcome" />
                  ))}
                </div>
              ) : null}
            </div>
          ))}
          {report.eventSummaries.length === 0 ? <p>No published event summaries yet.</p> : null}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
