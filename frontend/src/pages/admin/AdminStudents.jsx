import { useEffect, useState } from 'react';
import api from '../../api/axios';

const AdminStudents = () => {
  const [summary, setSummary] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [students, setStudents] = useState([]);
  const [info, setInfo] = useState('');

  const loadSummary = async () => {
    const { data } = await api.get('/admin/students/events-summary');
    setSummary(data);
  };

  const loadStudents = async (eventId) => {
    if (!eventId) return;
    const { data } = await api.get(`/admin/students/event/${eventId}`);
    setStudents(data);
  };

  useEffect(() => {
    loadSummary();
  }, []);

  useEffect(() => {
    loadStudents(selectedEventId);
  }, [selectedEventId]);

  const setAttendance = async (studentId, present) => {
    if (!selectedEventId) return;
    setInfo('');
    try {
      await api.patch(`/admin/students/event/${selectedEventId}/attendance`, { studentId, present });
      setInfo('Attendance marked and finalized.');
      loadStudents(selectedEventId);
    } catch (err) {
      setInfo(err.response?.data?.message || 'Failed to mark attendance.');
    }
  };

  return (
    <div className="grid-2">
      <div className="card">
        <h3>Event Registrations</h3>
        <select value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)}>
          <option value="">Select event</option>
          {summary.map((event) => (
            <option key={event.eventId} value={event.eventId}>
              {event.title} ({event.registrations})
            </option>
          ))}
        </select>
        <div className="list">
          {summary.map((event) => (
            <div className="list-item" key={event.eventId}>
              <strong>{event.title}</strong>
              <span>{event.registrations} students</span>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <h3>Students per Event</h3>
        {info ? <small>{info}</small> : null}
        <div className="list">
          {students.map((item) => (
            <div className="list-item" key={item._id}>
              <strong>{item.student?.name}</strong>
              <span>{item.student?.email}</span>
              <span>
                Status:{' '}
                {item.attendanceStatus === null
                  ? 'Not marked'
                  : item.attendanceStatus
                    ? 'Present (Finalized)'
                    : 'Absent (Finalized)'}
              </span>
              <div className="row-actions">
                <button
                  type="button"
                  className="success"
                  onClick={() => setAttendance(item.student?._id, true)}
                  disabled={item.attendanceStatus !== null}
                >
                  Mark Present
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => setAttendance(item.student?._id, false)}
                  disabled={item.attendanceStatus !== null}
                >
                  Mark Absent
                </button>
              </div>
            </div>
          ))}
          {selectedEventId && students.length === 0 ? <p>No registrations.</p> : null}
        </div>
      </div>
    </div>
  );
};

export default AdminStudents;
