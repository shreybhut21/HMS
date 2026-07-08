import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Plus, Edit2, Trash2, X, Eye, 
  Activity, Calendar, Phone, Mail, User, Shield, CheckCircle
} from 'lucide-react';

export function TeamTab() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null); // For Profile Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', role: 'Doctor',
    specialization: '', qualification: '', experience: '', consultation_fee: '',
    shift_timing: '', department: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchTeam = async () => {
    try {
      const token = localStorage.getItem('medicare_token');
      const res = await fetch('http://localhost:5000/api/hospital/team', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      }
    } catch (err) {
      console.error('Failed to load team', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const token = localStorage.getItem('medicare_token');
      const res = await fetch('http://localhost:5000/api/hospital/team', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add member');
      }
      await fetchTeam();
      setShowAddModal(false);
      setFormData({
        name: '', email: '', password: '', phone: '', role: 'Doctor',
        specialization: '', qualification: '', experience: '', consultation_fee: '',
        shift_timing: '', department: ''
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    try {
      const token = localStorage.getItem('medicare_token');
      await fetch(`http://localhost:5000/api/hospital/team/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetchTeam();
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  // Stats
  const total = members.length;
  const doctors = members.filter(m => m.role.toLowerCase() === 'doctor').length;
  const receptionists = members.filter(m => m.role.toLowerCase() === 'receptionist').length;
  const activeMembers = members.filter(m => m.status === 'Active').length;

  // Filtered members
  const filtered = members.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'All' || m.role === roleFilter;
    const matchStatus = statusFilter === 'All' || m.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const getRoleColor = (role: string) => {
    const r = role.toLowerCase();
    if (r === 'doctor') return { bg: '#DBEAFE', color: '#1D4ED8' }; // Blue
    if (r === 'receptionist') return { bg: '#D1FAE5', color: '#047857' }; // Green
    if (r === 'nurse') return { bg: '#F3E8FF', color: '#7E22CE' }; // Purple
    if (r === 'manager') return { bg: '#FFEDD5', color: '#C2410C' }; // Orange
    if (r === 'pharmacist') return { bg: '#E0E7FF', color: '#4338CA' }; // Indigo
    return { bg: '#FEE2E2', color: '#B91C1C' }; // Administrator Red
  };

  const openDrawer = (member: any) => {
    setSelectedMember(member);
    setIsDrawerOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.25rem' }}>Team Management</h1>
          <p style={{ color: 'var(--gray-500)' }}>Manage doctors, receptionists, nurses and clinic staff.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Add Team Member
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F3F4F6', color: '#4B5563', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={24} /></div>
          <div><p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', fontWeight: 500 }}>Total Members</p><h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)' }}>{total}</h3></div>
        </div>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#DBEAFE', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Activity size={24} /></div>
          <div><p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', fontWeight: 500 }}>Doctors</p><h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)' }}>{doctors}</h3></div>
        </div>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#D1FAE5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={24} /></div>
          <div><p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', fontWeight: 500 }}>Receptionists</p><h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)' }}>{receptionists}</h3></div>
        </div>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Shield size={24} /></div>
          <div><p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', fontWeight: 500 }}>Active Members</p><h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)' }}>{activeMembers}</h3></div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input type="text" className="form-input" placeholder="Search Team Member..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={18} color="var(--gray-500)" />
            <select className="form-input" value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ width: '160px' }}>
              <option value="All">All Roles</option>
              <option value="Doctor">Doctor</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Nurse">Nurse</option>
              <option value="Manager">Manager</option>
              <option value="Administrator">Administrator</option>
              <option value="Pharmacist">Pharmacist</option>
            </select>
          </div>
          <select className="form-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: '120px' }}>
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>Loading team...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--gray-500)', border: '1px dashed var(--gray-300)', borderRadius: 'var(--radius)' }}>
            <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p>No team members found.</p>
            <button onClick={() => setShowAddModal(true)} className="btn-secondary" style={{ marginTop: '1rem' }}>Add Team Member</button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--gray-200)', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                  <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Name</th>
                  <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Role</th>
                  <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Contact Info</th>
                  <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Joined Date</th>
                  <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(member => {
                  const roleStyle = getRoleColor(member.role);
                  return (
                    <tr key={member.user_id} style={{ borderBottom: '1px solid var(--gray-100)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '1rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-500)' }}>
                          <User size={18} />
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{member.name}</span>
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <span style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, color: roleStyle.color, background: roleStyle.bg }}>
                          {member.role}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <p style={{ color: 'var(--gray-900)', fontSize: '0.875rem', marginBottom: '0.2rem' }}>{member.phone || 'N/A'}</p>
                        <p style={{ color: 'var(--gray-500)', fontSize: '0.75rem' }}>{member.email}</p>
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: member.status === 'Active' ? '#047857' : '#6B7280' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: member.status === 'Active' ? '#10B981' : '#9CA3AF' }}></span>
                          {member.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.5rem', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                        {new Date(member.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button onClick={() => openDrawer(member)} style={{ padding: '0.4rem', background: 'var(--primary-50)', color: 'var(--primary-600)', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer' }} title="View Profile">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => handleDelete(member.user_id)} style={{ padding: '0.4rem', background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer' }} title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setShowAddModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-500)' }}><X size={24} /></button>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '1.5rem' }}>Add Team Member</h2>
            
            {error && <div style={{ padding: '1rem', background: '#FEE2E2', color: '#DC2626', borderRadius: 'var(--radius)', marginBottom: '1.5rem' }}>{error}</div>}

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div>
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="form-label">Email (Login ID)</label>
                  <input type="email" className="form-input" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="form-label">Password</label>
                  <input type="password" className="form-input" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
                <div>
                  <label className="form-label">Phone Number</label>
                  <input type="tel" className="form-input" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Role</label>
                  <select className="form-input" required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option value="Doctor">Doctor</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Nurse">Nurse</option>
                    <option value="Pharmacist">Pharmacist</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Fields based on Role */}
              {formData.role === 'Doctor' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', padding: '1.5rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)' }}>
                  <div>
                    <label className="form-label">Specialization</label>
                    <input type="text" className="form-input" placeholder="e.g. Cardiologist" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} />
                  </div>
                  <div>
                    <label className="form-label">Consultation Fee (₹)</label>
                    <input type="number" className="form-input" placeholder="500" value={formData.consultation_fee} onChange={e => setFormData({...formData, consultation_fee: e.target.value})} />
                  </div>
                  <div>
                    <label className="form-label">Qualification</label>
                    <input type="text" className="form-input" placeholder="e.g. MBBS, MD" value={formData.qualification} onChange={e => setFormData({...formData, qualification: e.target.value})} />
                  </div>
                  <div>
                    <label className="form-label">Experience</label>
                    <input type="text" className="form-input" placeholder="e.g. 10 Years" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} />
                  </div>
                </div>
              )}

              {formData.role === 'Receptionist' && (
                <div style={{ padding: '1.5rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)' }}>
                  <label className="form-label">Shift Timing</label>
                  <input type="text" className="form-input" placeholder="e.g. 9:00 AM - 5:00 PM" value={formData.shift_timing} onChange={e => setFormData({...formData, shift_timing: e.target.value})} />
                </div>
              )}

              {formData.role === 'Nurse' && (
                <div style={{ padding: '1.5rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)' }}>
                  <label className="form-label">Department</label>
                  <input type="text" className="form-input" placeholder="e.g. ICU, General Ward" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Creating...' : 'Create Team Member'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Profile Drawer */}
      {isDrawerOpen && selectedMember && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'flex-end', zIndex: 100 }}>
          <div style={{ width: '400px', background: '#fff', height: '100%', overflowY: 'auto', padding: '2rem', position: 'relative', boxShadow: '-4px 0 24px rgba(0,0,0,0.1)' }}>
            <button onClick={() => setIsDrawerOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-500)' }}><X size={24} /></button>
            
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-100)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <User size={40} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.25rem' }}>{selectedMember.name}</h2>
              <span style={{ display: 'inline-block', padding: '0.25rem 1rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 600, ...getRoleColor(selectedMember.role) }}>
                {selectedMember.role}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--gray-500)', fontWeight: 600, marginBottom: '0.75rem' }}>Contact Information</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--gray-900)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Mail size={16} color="var(--gray-400)" /> {selectedMember.email}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Phone size={16} color="var(--gray-400)" /> {selectedMember.phone || 'Not provided'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Calendar size={16} color="var(--gray-400)" /> Joined {new Date(selectedMember.created_at).toLocaleDateString()}</div>
                </div>
              </div>

              {selectedMember.role.toLowerCase() === 'doctor' && (
                <div>
                  <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--gray-500)', fontWeight: 600, marginBottom: '0.75rem' }}>Professional Details</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                    <div style={{ background: 'var(--gray-50)', padding: '0.75rem', borderRadius: 'var(--radius)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', display: 'block' }}>Specialization</span>
                      <strong style={{ color: 'var(--gray-900)' }}>{selectedMember.specialization || '-'}</strong>
                    </div>
                    <div style={{ background: 'var(--gray-50)', padding: '0.75rem', borderRadius: 'var(--radius)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', display: 'block' }}>Consultation Fee</span>
                      <strong style={{ color: 'var(--gray-900)' }}>₹{selectedMember.consultation_fee || '0'}</strong>
                    </div>
                    <div style={{ background: 'var(--gray-50)', padding: '0.75rem', borderRadius: 'var(--radius)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', display: 'block' }}>Qualification</span>
                      <strong style={{ color: 'var(--gray-900)' }}>{selectedMember.qualification || '-'}</strong>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--gray-500)', fontWeight: 600, marginBottom: '0.75rem' }}>Permissions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--gray-600)', fontSize: '0.875rem' }}>
                  {selectedMember.role.toLowerCase() === 'doctor' && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={16} color="#10B981" /> View Appointments</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={16} color="#10B981" /> View Patient Records</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={16} color="#10B981" /> Create Prescriptions</div>
                    </>
                  )}
                  {selectedMember.role.toLowerCase() === 'receptionist' && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={16} color="#10B981" /> Manage Appointments</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={16} color="#10B981" /> Register Patients</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={16} color="#10B981" /> Handle Billing</div>
                    </>
                  )}
                  {selectedMember.role.toLowerCase() === 'nurse' && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={16} color="#10B981" /> Record Vitals</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={16} color="#10B981" /> View Patient Queue</div>
                    </>
                  )}
                  {selectedMember.role.toLowerCase() === 'pharmacist' && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={16} color="#10B981" /> View Prescriptions</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={16} color="#10B981" /> Manage Inventory</div>
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
