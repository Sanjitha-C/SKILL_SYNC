import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import TagInputWithSuggestions from '../../components/TagInputWithSuggestions';
import { DOMAIN_OPTIONS, INTEREST_OPTIONS } from '../../constants/profileOptions';

const StudentProfile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState('');
  const [form, setForm] = useState({
    interests: [],
    interestedDomains: []
  });

  useEffect(() => {
    setForm({
      interests: user?.interests || [],
      interestedDomains: user?.interestedDomains || []
    });
  }, [user]);

  const onSave = async () => {
    setSaving(true);
    setInfo('');
    try {
      const payload = {
        interests: form.interests,
        interestedDomains: form.interestedDomains
      };

      const { data } = await api.patch('/student/profile', payload);
      updateUser(data.user);
      setEditing(false);
      setInfo('Profile updated successfully.');
    } catch (err) {
      setInfo(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <div className="profile-header-row">
        <h3>My Profile</h3>
        {!editing ? (
          <button type="button" onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        ) : (
          <div className="row-actions">
            <button type="button" className="success" onClick={onSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={() => setEditing(false)} disabled={saving}>
              Cancel
            </button>
          </div>
        )}
      </div>

      {info ? <small>{info}</small> : null}

      <div className="profile-grid">
        <div className="profile-row">
          <strong>Name</strong>
          <span>{user?.name || '-'}</span>
        </div>
        <div className="profile-row">
          <strong>Email</strong>
          <span>{user?.email || '-'}</span>
        </div>
        <div className="profile-row">
          <strong>Department</strong>
          <span>{user?.department || '-'}</span>
        </div>
        <div className="profile-row">
          <strong>Year</strong>
          <span>{user?.year || '-'}</span>
        </div>
        <div className="profile-row">
          <strong>Interests</strong>
          {editing ? (
            <TagInputWithSuggestions
              label=""
              placeholder="Type an interest and press Enter"
              suggestions={INTEREST_OPTIONS}
              values={form.interests}
              onChange={(next) => setForm({ ...form, interests: next })}
              variant="interest"
            />
          ) : (
            <span>{(user?.interests || []).join(', ') || '-'}</span>
          )}
        </div>
        <div className="profile-row">
          <strong>Interested Domains</strong>
          {editing ? (
            <TagInputWithSuggestions
              label=""
              placeholder="Type a domain and press Enter"
              suggestions={DOMAIN_OPTIONS}
              values={form.interestedDomains}
              onChange={(next) => setForm({ ...form, interestedDomains: next })}
              variant="domain"
            />
          ) : (
            <span>{(user?.interestedDomains || []).join(', ') || '-'}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
