import { useEffect, useState } from 'react';
import api from '../../api/axios';

const Opportunities = () => {
  const [events, setEvents] = useState([]);
  const [index, setIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [dragStartX, setDragStartX] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [zoomPosterUrl, setZoomPosterUrl] = useState('');

  const fileBase = import.meta.env.VITE_FILE_BASE_URL || 'http://localhost:5000';

  const fetchOpportunities = async () => {
    const { data } = await api.get('/student/opportunities');
    setEvents(data);
    setIndex(0);
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const current = events[index];
  const swipeDirectionClass = dragX > 20 ? 'swipe-right-hint' : dragX < -20 ? 'swipe-left-hint' : '';

  const swipe = async (action) => {
    if (!current) return;
    try {
      await api.post(`/student/opportunities/${current._id}/${action}`);
      if (action === 'register' && current.registrationLink) {
        window.open(current.registrationLink, '_blank', 'noopener,noreferrer');
      }
      setMessage(action === 'register' ? 'Registered!' : 'Skipped!');
      setIndex((prev) => prev + 1);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Action failed.');
    }
  };

  const onPointerDown = (event) => {
    setIsDragging(true);
    setDragStartX(event.clientX);
  };

  const onPointerMove = (event) => {
    if (!isDragging) return;
    setDragX(event.clientX - dragStartX);
  };

  const onPointerEnd = async () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragX > 120) {
      await swipe('register');
    } else if (dragX < -120) {
      await swipe('skip');
    }

    setDragX(0);
  };

  const openPosterZoom = (event, posterUrl) => {
    event.stopPropagation();
    if (!posterUrl) return;
    setZoomPosterUrl(`${fileBase}${posterUrl}`);
  };

  const closePosterZoom = () => {
    setZoomPosterUrl('');
  };

  if (!current) {
    return (
      <div className="card">
        <h3>Opportunities</h3>
        <p>No more matching events right now.</p>
        <button type="button" onClick={fetchOpportunities}>
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="card swipe-wrap">
      <div className="swipe-instruction-row">
        <div className="swipe-tip swipe-tip-left">👈 Swipe Left — Skip this one</div>
        <div className="swipe-tip swipe-tip-right">🔥 Swipe Right — Grab your spot</div>
      </div>
      <div
        className={`swipe-card ${swipeDirectionClass}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        style={{
          transform: `translateX(${dragX}px) rotate(${dragX / 20}deg)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease'
        }}
      >
        <div className="swipe-card-layout">
          {current.posterUrl ? (
            <img
              className="swipe-poster-side"
              src={`${fileBase}${current.posterUrl}`}
              alt={current.title}
              onClick={(event) => openPosterZoom(event, current.posterUrl)}
            />
          ) : null}
          <div className="swipe-card-details">
            <h4>{current.title}</h4>
            <p>{current.description}</p>
            <span>Registration Fee: ₹{Number(current.registrationFee || 0).toFixed(2)}</span>
            <span>Slots: {Number.isFinite(Number(current.slots)) ? Number(current.slots) : 0}</span>
            <span>Slots Filled: {Number.isFinite(Number(current.slotsFilled)) ? Number(current.slotsFilled) : 0}</span>
            {current.registrationLink ? <span>Registration Link available on right swipe</span> : null}
            <span>Interests: {(current.interests || []).join(', ') || current.category || 'General'}</span>
            <span>Domains: {(current.domains || []).join(', ') || 'General'}</span>
            <span>
              {new Date(current.date).toLocaleDateString()} • {current.venue}
            </span>
          </div>
        </div>
      </div>
      {message ? <small>{message}</small> : null}

      {zoomPosterUrl ? (
        <div className="poster-modal-overlay" onClick={closePosterZoom} role="dialog" aria-modal="true" aria-label="Poster zoom view">
          <div className="poster-modal-card" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="poster-modal-close" onClick={closePosterZoom}>
              ✕
            </button>
            <img className="poster-modal-image" src={zoomPosterUrl} alt="Zoomed event poster" />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Opportunities;
