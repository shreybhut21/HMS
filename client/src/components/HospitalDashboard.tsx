import { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Calendar, Users, FileText, 
  Receipt, BarChart3, Building2, Settings, ChevronRight, UserPlus,
  Bell, Clock, IndianRupee, CheckCircle, XCircle, Plus, User, FilePlus,
  Search, Filter, Download, Eye, Edit2, Trash2, X, Phone, Mail, Activity, AlertTriangle, MessageSquare, Droplet, Pill
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { TeamTab } from './TeamTab';
import { ClinicProfileTab } from './ClinicProfileTab';

type Tab = 'dashboard' | 'appointments' | 'team' | 'patients' | 'records' | 'billing' | 'reports' | 'profile' | 'settings';

export function HospitalDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const { user } = useAuth();

  // Lifted state
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('medicare_token');
      const res = await fetch('http://localhost:5000/api/hospital/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load hospital dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const menuItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'appointments', label: 'Appointments', icon: <Calendar size={20} /> },
    { id: 'team', label: 'Team', icon: <Users size={20} /> },
    { id: 'patients', label: 'Patients', icon: <UserPlus size={20} /> },
    { id: 'records', label: 'Medical Records', icon: <FileText size={20} /> },
    { id: 'billing', label: 'Billing', icon: <Receipt size={20} /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 size={20} /> },
    { id: 'profile', label: 'Clinic Profile', icon: <Building2 size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  const renderContent = () => {
    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-500)' }}>Loading data...</div>;

    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab clinicName={user?.name} data={data} refreshData={fetchDashboard} />;
      case 'appointments':
        return <AppointmentsTab data={data} refreshData={fetchDashboard} />;
      case 'team':
        return <TeamTab />;
      case 'patients':
        return <PatientsTab data={data} />;
      case 'records':
        return <div><h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Medical Records</h2></div>;
      case 'billing':
        return <div><h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Billing & Invoices</h2></div>;
      case 'reports':
        return <div><h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Analytics & Reports</h2></div>;
      case 'profile':
        return <ClinicProfileTab />;
      case 'settings':
        return <div><h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Settings</h2></div>;
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 73px)', background: 'var(--gray-50)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px', background: '#fff', borderRight: '1px solid var(--gray-200)',
        padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem'
      }}>
        {menuItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.75rem 1rem', borderRadius: 'var(--radius)', border: 'none',
                background: isActive ? 'var(--primary-50)' : 'transparent',
                color: isActive ? 'var(--primary-700)' : 'var(--gray-600)',
                fontWeight: isActive ? 600 : 500, cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isActive) { e.currentTarget.style.background = 'var(--gray-50)'; e.currentTarget.style.color = 'var(--gray-900)'; }
              }}
              onMouseLeave={(e) => {
                if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-600)'; }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ color: isActive ? 'var(--primary-600)' : 'var(--gray-400)' }}>{item.icon}</span>
                {item.label}
              </div>
              {isActive && <ChevronRight size={16} />}
            </button>
          );
        })}
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', background: activeTab === 'dashboard' ? 'transparent' : '#fff', padding: activeTab === 'dashboard' ? '0' : '2rem', borderRadius: 'var(--radius)', border: activeTab === 'dashboard' ? 'none' : '1px solid var(--gray-200)', minHeight: '600px' }}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}


// --- Dashboard Tab ---

function StatCard({ title, value, icon, color, trend }: { title: string, value: string, icon: React.ReactNode, color: string, trend: string }) {
  return (
    <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ 
          width: '48px', height: '48px', borderRadius: '12px', background: `${color}15`, 
          color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' 
        }}>
          {icon}
        </div>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#10B981', background: '#D1FAE5', padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
          {trend}
        </span>
      </div>
      <div>
        <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--gray-900)' }}>{value}</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', fontWeight: 500, marginTop: '0.25rem' }}>{title}</p>
      </div>
    </div>
  );
}

function DashboardTab({ clinicName, data, refreshData }: { clinicName?: string, data: any, refreshData: () => void }) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const stats = data?.stats || { todayAppointments: 0, pendingRequests: 0, totalPatients: 0, revenue: 0 };
  const todayAppointments = data?.todayAppointments || [];
  const pendingRequests = data?.pendingRequests || [];

  const updateStatus = async (id: number, status: string) => {
    try {
      const token = localStorage.getItem('medicare_token');
      const res = await fetch(`http://localhost:5000/api/hospital/appointments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        refreshData();
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.25rem' }}>
            Good Morning, {clinicName || 'Clinic'} 👋
          </h1>
          <p style={{ color: 'var(--gray-500)' }}>Manage appointments and clinic operations efficiently.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ textAlign: 'right', color: 'var(--gray-500)', fontSize: '0.875rem', fontWeight: 500 }}>
            {today}
          </div>
          <button style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--gray-600)' }}>
            <Bell size={18} />
          </button>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-100)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--primary-200)' }}>
            <Building2 size={20} />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <StatCard title="Today's Appointments" value={stats.todayAppointments.toString()} icon={<Calendar size={24} />} color="#2563EB" trend="Live" />
        <StatCard title="Pending Requests" value={stats.pendingRequests.toString()} icon={<Clock size={24} />} color="#F59E0B" trend="Live" />
        <StatCard title="Total Patients" value={stats.totalPatients.toString()} icon={<Users size={24} />} color="#10B981" trend="Live" />
        <StatCard title="Today's Revenue" value={`₹${stats.revenue}`} icon={<IndianRupee size={24} />} color="#8B5CF6" trend="Live" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Column (70%) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Today's Appointments */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--gray-900)' }}>Today's Appointments</h2>
              <button style={{ color: 'var(--primary-600)', background: 'none', border: 'none', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>View All</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {todayAppointments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--gray-500)', border: '1px dashed var(--gray-300)', borderRadius: 'var(--radius)' }}>
                  <Calendar size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <p>No appointments scheduled today</p>
                  <button className="btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>Create Appointment</button>
                </div>
              ) : (
                todayAppointments.map((apt: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius)', background: 'var(--gray-50)', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--gray-900)', width: '80px', fontSize: '0.9375rem' }}>{apt.appointment_time}</div>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gray-200)', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={20} />
                      </div>
                      <div>
                        <h4 style={{ fontWeight: 600, color: 'var(--gray-900)', fontSize: '0.9375rem', marginBottom: '0.1rem' }}>{apt.patient_name}</h4>
                        <p style={{ color: 'var(--gray-500)', fontSize: '0.8125rem' }}>{apt.problem_description}</p>
                      </div>
                    </div>
                    <span style={{ padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, color: '#10B981', background: '#D1FAE5' }}>
                      {apt.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending Requests */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '1.5rem' }}>Pending Appointment Requests</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>
                  No pending requests.
                </div>
              ) : (
                pendingRequests.map((req: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FEF3C7', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Clock size={24} />
                      </div>
                      <div>
                        <h4 style={{ fontWeight: 600, color: 'var(--gray-900)', fontSize: '1rem', marginBottom: '0.2rem' }}>{req.patient_name}</h4>
                        <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>Requested: {new Date(req.appointment_date).toLocaleDateString()} at {req.appointment_time}</p>
                        <p style={{ color: 'var(--gray-400)', fontSize: '0.8125rem', marginTop: '0.2rem' }}>Reason: {req.problem_description}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => updateStatus(req.id, 'Approved')} style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: '#D1FAE5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#A7F3D0'} onMouseLeave={e => e.currentTarget.style.background = '#D1FAE5'} title="Approve">
                        <CheckCircle size={20} />
                      </button>
                      <button onClick={() => updateStatus(req.id, 'Rejected')} style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: '#FEE2E2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#FECACA'} onMouseLeave={e => e.currentTarget.style.background = '#FEE2E2'} title="Reject">
                        <XCircle size={20} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column (30%) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '1.25rem' }}>Quick Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1.5rem 1rem', background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-50)'; e.currentTarget.style.borderColor = 'var(--primary-200)'; e.currentTarget.style.color = 'var(--primary-700)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'var(--gray-50)'; e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.color = 'var(--gray-900)'; }}>
                <Plus size={24} style={{ color: 'var(--primary-600)' }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>New Appointment</span>
              </button>
              <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1.5rem 1rem', background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-50)'; e.currentTarget.style.borderColor = 'var(--primary-200)'; e.currentTarget.style.color = 'var(--primary-700)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'var(--gray-50)'; e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.color = 'var(--gray-900)'; }}>
                <UserPlus size={24} style={{ color: 'var(--primary-600)' }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Register Patient</span>
              </button>
              <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1.5rem 1rem', background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-50)'; e.currentTarget.style.borderColor = 'var(--primary-200)'; e.currentTarget.style.color = 'var(--primary-700)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'var(--gray-50)'; e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.color = 'var(--gray-900)'; }}>
                <Users size={24} style={{ color: 'var(--primary-600)' }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Add Team</span>
              </button>
              <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1.5rem 1rem', background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-50)'; e.currentTarget.style.borderColor = 'var(--primary-200)'; e.currentTarget.style.color = 'var(--primary-700)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'var(--gray-50)'; e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.color = 'var(--gray-900)'; }}>
                <FilePlus size={24} style={{ color: 'var(--primary-600)' }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Create Invoice</span>
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '1.5rem' }}>Recent Activity</h2>
            <div style={{ position: 'relative', paddingLeft: '1.25rem', borderLeft: '2px solid var(--gray-200)', display: 'flex', flexDirection: 'column', gap: '1.5rem', marginLeft: '0.5rem' }}>
              <div style={{ textAlign: 'center', color: 'var(--gray-500)', fontSize: '0.875rem', fontStyle: 'italic' }}>
                No recent activity to display.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}


// --- Appointments Tab ---

function getStatusColor(status: string) {
  switch (status) {
    case 'Pending': return { color: '#F59E0B', bg: '#FEF3C7' }; // Orange
    case 'Approved': return { color: '#10B981', bg: '#D1FAE5' }; // Green
    case 'Completed': return { color: '#3B82F6', bg: '#DBEAFE' }; // Blue
    case 'Cancelled': return { color: '#EF4444', bg: '#FEE2E2' }; // Red
    case 'Rejected': return { color: '#6B7280', bg: '#F3F4F6' }; // Gray
    default: return { color: '#6B7280', bg: '#F3F4F6' };
  }
}

function AppointmentsTab({ data, refreshData }: { data: any, refreshData: () => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  const appointments = data?.appointments || [];

  // Derived Stats
  const today = new Date().toDateString();
  const todayApts = appointments.filter((a: any) => new Date(a.appointment_date).toDateString() === today && a.status === 'Approved').length;
  const pendingCount = appointments.filter((a: any) => a.status === 'Pending').length;
  const completedToday = appointments.filter((a: any) => new Date(a.appointment_date).toDateString() === today && a.status === 'Completed').length;
  const cancelledToday = appointments.filter((a: any) => new Date(a.appointment_date).toDateString() === today && a.status === 'Cancelled').length;

  // Filter logic
  const filtered = useMemo(() => {
    return appointments.filter((a: any) => {
      const matchSearch = a.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          a.id.toString().includes(searchTerm) || 
                          a.problem_description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'All' || a.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [appointments, searchTerm, statusFilter]);

  const updateStatus = async (id: number, status: string) => {
    try {
      const token = localStorage.getItem('medicare_token');
      const res = await fetch(`http://localhost:5000/api/hospital/appointments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        refreshData();
        if (selectedAppointment && selectedAppointment.id === id) {
          setSelectedAppointment({ ...selectedAppointment, status });
        }
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.25rem' }}>Appointments</h1>
          <p style={{ color: 'var(--gray-500)' }}>Manage patient appointments and booking requests.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={16} /> Export
          </button>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} /> New Appointment
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <StatCard title="Today's Appointments" value={todayApts.toString()} icon={<Calendar size={24} />} color="#2563EB" trend="Live" />
        <StatCard title="Pending Requests" value={pendingCount.toString()} icon={<Clock size={24} />} color="#F59E0B" trend="Action Needed" />
        <StatCard title="Completed Today" value={completedToday.toString()} icon={<CheckCircle size={24} />} color="#10B981" trend="Live" />
        <StatCard title="Cancelled Today" value={cancelledToday.toString()} icon={<XCircle size={24} />} color="#EF4444" trend="Live" />
      </div>

      {/* Main Table Card */}
      <div className="card" style={{ padding: '1.5rem' }}>
        
        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input 
              type="text" 
              placeholder="Search patient, ID, or description..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <select 
              className="form-input" 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              style={{ width: '180px', appearance: 'none' }}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Rejected">Rejected</option>
            </select>
            <Filter size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--gray-500)', border: '1px dashed var(--gray-300)', borderRadius: 'var(--radius)' }}>
              <Calendar size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>No appointments found</h3>
              <p style={{ marginBottom: '1.5rem' }}>Try adjusting your filters or create a new appointment.</p>
              <button className="btn-primary" style={{ display: 'inline-flex' }}>Create Appointment</button>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--gray-200)', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                  <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Appt ID</th>
                  <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Patient Name</th>
                  <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Date & Time</th>
                  <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Reason</th>
                  <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '1rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((apt: any) => {
                  const sColor = getStatusColor(apt.status);
                  return (
                    <tr key={apt.id} style={{ borderBottom: '1px solid var(--gray-100)', transition: 'background 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} onClick={() => setSelectedAppointment(apt)}>
                      <td style={{ padding: '1rem 0.5rem', fontWeight: 500, color: 'var(--gray-900)' }}>APT-{apt.id}</td>
                      <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>{apt.patient_name}</td>
                      <td style={{ padding: '1rem 0.5rem', color: 'var(--gray-600)' }}>
                        {new Date(apt.appointment_date).toLocaleDateString('en-GB')} <br/>
                        <span style={{ fontSize: '0.8125rem' }}>{apt.appointment_time}</span>
                      </td>
                      <td style={{ padding: '1rem 0.5rem', color: 'var(--gray-600)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {apt.problem_description}
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <span style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, color: sColor.color, background: sColor.bg }}>
                          {apt.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                          <button onClick={() => setSelectedAppointment(apt)} style={{ background: 'none', border: 'none', color: 'var(--primary-600)', cursor: 'pointer' }} title="View Details"><Eye size={18}/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Appointment Modal Overlay */}
      {selectedAppointment && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '750px', background: '#ffffff', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Calendar style={{ color: 'var(--primary-600)' }} size={24} />
                  Appointment Details
                </h2>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>ID: APT-{selectedAppointment.id} • Booked on {new Date(selectedAppointment.appointment_date).toLocaleDateString()}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ padding: '0.35rem 1rem', borderRadius: '999px', fontSize: '0.8125rem', fontWeight: 700, color: getStatusColor(selectedAppointment.status).color, background: getStatusColor(selectedAppointment.status).bg, border: `1px solid ${getStatusColor(selectedAppointment.status).color}30` }}>
                  {selectedAppointment.status}
                </span>
                <button onClick={() => setSelectedAppointment(null)} style={{ background: '#F1F5F9', border: 'none', color: 'var(--gray-500)', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'} onMouseLeave={e => e.currentTarget.style.background = '#F1F5F9'}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div style={{ padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Top Row: Patient & Schedule */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
                
                {/* Patient Profile Card */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--primary-100)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={28} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)' }}>{selectedAppointment.patient_name}</h3>
                      <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>Patient ID: P-{selectedAppointment.patient_id}</p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Mail size={16} style={{ color: 'var(--gray-400)' }}/> <span style={{ wordBreak: 'break-all' }}>{selectedAppointment.patient_email}</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Phone size={16} style={{ color: 'var(--gray-400)' }}/> <span>{selectedAppointment.phone || 'Not provided'}</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><User size={16} style={{ color: 'var(--gray-400)' }}/> <span>{selectedAppointment.gender || 'Not provided'}</span></div>
                  </div>
                </div>

                {/* Schedule & Vitals */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '16px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: '#38BDF8', color: '#fff', padding: '0.75rem', borderRadius: '12px' }}><Clock size={24} /></div>
                    <div>
                      <p style={{ color: '#0369A1', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Scheduled For</p>
                      <p style={{ color: '#0C4A6E', fontWeight: 700, fontSize: '1.125rem' }}>{selectedAppointment.appointment_time}</p>
                      <p style={{ color: '#0284C7', fontSize: '0.875rem' }}>{new Date(selectedAppointment.appointment_date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                    <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '0.75rem', textAlign: 'center' }}>
                      <Droplet size={18} style={{ color: '#EF4444', margin: '0 auto 0.25rem' }} />
                      <p style={{ fontSize: '0.65rem', color: '#991B1B', fontWeight: 700, textTransform: 'uppercase' }}>Blood</p>
                      <p style={{ color: '#7F1D1D', fontWeight: 700 }}>{selectedAppointment.blood_group || '-'}</p>
                    </div>
                    <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '0.75rem', textAlign: 'center' }}>
                      <Activity size={18} style={{ color: '#22C55E', margin: '0 auto 0.25rem' }} />
                      <p style={{ fontSize: '0.65rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>Weight</p>
                      <p style={{ color: '#14532D', fontWeight: 700 }}>{selectedAppointment.weight ? `${selectedAppointment.weight}kg` : '-'}</p>
                    </div>
                    <div style={{ background: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: '12px', padding: '0.75rem', textAlign: 'center' }}>
                      <User size={18} style={{ color: '#A855F7', margin: '0 auto 0.25rem' }} />
                      <p style={{ fontSize: '0.65rem', color: '#6B21A8', fontWeight: 700, textTransform: 'uppercase' }}>Height</p>
                      <p style={{ color: '#581C87', fontWeight: 700 }}>{selectedAppointment.height ? `${selectedAppointment.height}cm` : '-'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reason for Visit */}
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MessageSquare size={18} style={{ color: 'var(--primary-500)' }} />
                  Reason for Visit
                </h4>
                <div style={{ background: '#FFFBEB', borderLeft: '4px solid #F59E0B', padding: '1.25rem', borderRadius: '0 12px 12px 0', color: '#92400E', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                  {selectedAppointment.problem_description}
                </div>
              </div>

              {/* Medical History Grid */}
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={18} style={{ color: 'var(--primary-500)' }} />
                  Clinical Profile
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '1rem', borderRadius: '12px' }}>
                    <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--gray-500)', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}><FileText size={14} /> Medical History</p>
                    <p style={{ color: 'var(--gray-700)', fontSize: '0.875rem', lineHeight: 1.5 }}>{selectedAppointment.medical_history || 'None reported'}</p>
                  </div>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '1rem', borderRadius: '12px' }}>
                    <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--gray-500)', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Activity size={14} /> Chronic Diseases</p>
                    <p style={{ color: 'var(--gray-700)', fontSize: '0.875rem', lineHeight: 1.5 }}>{selectedAppointment.chronic_diseases || 'None reported'}</p>
                  </div>
                  <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '1rem', borderRadius: '12px' }}>
                    <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#DC2626', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}><AlertTriangle size={14} /> Allergies</p>
                    <p style={{ color: '#991B1B', fontSize: '0.875rem', lineHeight: 1.5 }}>{selectedAppointment.allergies || 'No known allergies'}</p>
                  </div>
                  <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '1rem', borderRadius: '12px' }}>
                    <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#16A34A', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Pill size={14} /> Current Medications</p>
                    <p style={{ color: '#166534', fontSize: '0.875rem', lineHeight: 1.5 }}>{selectedAppointment.current_medications || 'None reported'}</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer / Actions */}
            <div style={{ padding: '1.25rem 2rem', background: '#F8FAFC', borderTop: '1px solid var(--gray-200)', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              {selectedAppointment.status === 'Pending' && (
                <>
                  <button onClick={() => updateStatus(selectedAppointment.id, 'Rejected')} className="btn-secondary" style={{ color: '#EF4444', borderColor: '#FECACA', background: '#FEF2F2', padding: '0.75rem 1.5rem' }}>Reject Request</button>
                  <button onClick={() => updateStatus(selectedAppointment.id, 'Approved')} className="btn-primary" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={18} /> Approve Appointment</button>
                </>
              )}
              {selectedAppointment.status === 'Approved' && (
                <button onClick={() => updateStatus(selectedAppointment.id, 'Completed')} className="btn-primary" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={18} /> Mark as Completed</button>
              )}
              {selectedAppointment.status !== 'Completed' && selectedAppointment.status !== 'Cancelled' && (
                <button onClick={() => updateStatus(selectedAppointment.id, 'Cancelled')} className="btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>Cancel Appointment</button>
              )}
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}

// --- Patients Tab ---

function PatientsTab({ data }: { data: any }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Extract unique patients from appointments
  const appointments = data?.appointments || [];
  
  const uniquePatientsMap = new Map();
  appointments.forEach((apt: any) => {
    if (!uniquePatientsMap.has(apt.patient_id)) {
      uniquePatientsMap.set(apt.patient_id, {
        id: apt.patient_id,
        name: apt.patient_name,
        email: apt.patient_email,
        totalVisits: 0,
        lastVisit: apt.appointment_date
      });
    }
    const patient = uniquePatientsMap.get(apt.patient_id);
    patient.totalVisits += 1;
    if (new Date(apt.appointment_date) > new Date(patient.lastVisit)) {
      patient.lastVisit = apt.appointment_date;
    }
  });

  const patients = Array.from(uniquePatientsMap.values());

  const filtered = patients.filter((p: any) => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.25rem' }}>Patients Directory</h1>
          <p style={{ color: 'var(--gray-500)' }}>View and manage all patients registered with your clinic.</p>
        </div>
        <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Download size={16} /> Export List
        </button>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ position: 'relative', width: '350px', marginBottom: '1.5rem' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
          <input 
            type="text" 
            placeholder="Search patient by name or email..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--gray-500)', border: '1px dashed var(--gray-300)', borderRadius: 'var(--radius)' }}>
              <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>No patients found</h3>
              <p>You have no registered patients matching that search.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--gray-200)', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                  <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Patient Profile</th>
                  <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Contact Email</th>
                  <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Total Bookings</th>
                  <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Last Activity Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((pt: any) => (
                  <tr key={pt.id} style={{ borderBottom: '1px solid var(--gray-100)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-100)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={20} />
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{pt.name}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>ID: P-{pt.id}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--gray-600)' }}>{pt.email}</td>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--gray-600)' }}>{pt.totalVisits} appointment(s)</td>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--gray-600)' }}>
                      {new Date(pt.lastVisit).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
