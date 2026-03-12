import { useEffect, useState } from 'react';
import api from '../../api/axios';

const Reports = () => {
  const assetBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
  const [items, setItems] = useState([]);
  const [eventSummaries, setEventSummaries] = useState([]);
  const [feedback, setFeedback] = useState({});

  const load = async () => {
    const [{ data: reportData }, { data: summaryData }] = await Promise.all([
      api.get('/student/reports'),
      api.get('/student/reports/event-summaries')
    ]);
    setItems(reportData);
    setEventSummaries(summaryData);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (eventId) => {
    const entry = feedback[eventId] || { rating: 5, comment: '' };
    await api.post(`/student/reports/${eventId}/feedback`, entry);
    load();
  };

  return (
    <div className="stack">
      <div className="card">
        <h3>Reports & Feedback</h3>
        <div className="list">
          {items.map((item) => (
            <div className="list-item" key={item.registrationId}>
              <strong>{item.event?.title}</strong>
              <span>{item.feedback ? `Rated ${item.feedback.rating}/5` : 'No feedback submitted'}</span>
              <div className="row-actions">
                <input
                  type="number"
                  min="1"
                  max="5"
                  placeholder="Rating"
                  onChange={(e) =>
                    setFeedback((prev) => ({
                      ...prev,
                      [item.event?._id]: {
                        ...(prev[item.event?._id] || { comment: '' }),
                        rating: Number(e.target.value)
                      }
                    }))
                  }
                />
                <input
                  placeholder="Comment"
                  onChange={(e) =>
                    setFeedback((prev) => ({
                      ...prev,
                      [item.event?._id]: {
                        ...(prev[item.event?._id] || { rating: 5 }),
                        comment: e.target.value
                      }
                    }))
                  }
                />
                <button type="button" onClick={() => submit(item.event?._id)}>
                  Submit
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 ? <p>No event participation records yet.</p> : null}
        </div>
      </div>

      <div className="card">
        <h3>Published Event Summaries</h3>
        <div className="list">
          {eventSummaries.map((item) => (
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
          {eventSummaries.length === 0 ? <p>No published event summaries yet.</p> : null}
        </div>
      </div>
    </div>
  );
};

export default Reports;
