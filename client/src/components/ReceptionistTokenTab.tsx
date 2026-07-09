import React, { useState, useEffect } from 'react';
import { 
  Users, ChevronRight, ChevronLeft, RefreshCw, Bell, UserX
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Queue {
  doctor_id: number;
  doctor_name: string;
  current_token: number;
  last_issued_token: number;
}

export function ReceptionistTokenTab() {
  const { token } = useAuth();
  const [queues, setQueues] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueues = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/hospital/queues/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setQueues(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
    const interval = setInterval(fetchQueues, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [token]);

  const advanceQueue = async (doctorId: number, action: 'next' | 'previous') => {
    try {
      await fetch('http://localhost:5000/api/hospital/queues/advance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ doctor_id: doctorId, action })
      });
      fetchQueues();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--gray-900)' }}>Token Management</h1>
          <p style={{ color: 'var(--gray-500)', marginTop: '0.25rem' }}>Manage independent queues for each doctor.</p>
        </div>
        <button onClick={fetchQueues} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={18} /> Refresh Queues
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {loading && <p>Loading queues...</p>}
        {!loading && queues.length === 0 && <p style={{ color: 'var(--gray-500)' }}>No doctors have active queues today.</p>}
        
        {queues.map(queue => (
          <div key={queue.doctor_id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--gray-200)', background: 'var(--gray-50)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                {queue.doctor_name}
              </h2>
              <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)', fontWeight: 500 }}>
                Total: {queue.last_issued_token}
              </span>
            </div>
            
            <div style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1rem', color: 'var(--gray-500)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Token</span>
                <div style={{ 
                  width: '100px', height: '100px', borderRadius: '50%', 
                  background: 'var(--primary-600)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '3rem', fontWeight: 900,
                  boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)'
                }}>
                  {queue.current_token}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%' }}>
                <button 
                  onClick={() => advanceQueue(queue.doctor_id, 'previous')} 
                  disabled={queue.current_token <= 0}
                  className="btn-secondary" 
                  style={{ display: 'flex', justifyContent: 'center', padding: '0.75rem', gap: '0.5rem', opacity: queue.current_token <= 0 ? 0.5 : 1 }}
                >
                  <ChevronLeft size={20} /> Previous
                </button>
                <button 
                  onClick={() => advanceQueue(queue.doctor_id, 'next')} 
                  disabled={queue.current_token >= queue.last_issued_token}
                  className="btn-primary" 
                  style={{ display: 'flex', justifyContent: 'center', padding: '0.75rem', gap: '0.5rem', opacity: queue.current_token >= queue.last_issued_token ? 0.5 : 1 }}
                >
                  Next <ChevronRight size={20} />
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
