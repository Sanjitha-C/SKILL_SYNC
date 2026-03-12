import { useEffect, useState } from 'react';
import api from '../../api/axios';

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
          <div className="list">
            {report.byEvent.map((item) => (
              <div className="list-item" key={item.eventId}>
                <strong>{item.title}</strong>
                <span>
                  Registered: {item.registrations} | Present: {item.attendance}
                </span>
              </div>
            ))}
          </div>
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
