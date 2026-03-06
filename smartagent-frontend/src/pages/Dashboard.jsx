import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Dashboard() {
  const [agents, setAgents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const agentsRes = await api.get('/agents');
      setAgents(agentsRes.data);
      const allTasks = [];
      for (const agent of agentsRes.data) {
        const tasksRes = await api.get(`/agents/${agent.id}/tasks`);
        allTasks.push(...tasksRes.data);
      }
      setTasks(allTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const role = localStorage.getItem('role');
  const completed = tasks.filter(t => t.status === 'Completed').length;
  const failed = tasks.filter(t => t.status === 'Failed').length;

  if (loading) return <div style={styles.loading}>Cargando...</div>;

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <h1 style={styles.logo}>🤖 SmartAgent</h1>
        <div style={styles.navLinks}>
          <span style={{
            ...styles.roleBadge,
            background: role === 'Admin' ? 'rgba(255,215,0,0.2)' : 'rgba(102,126,234,0.2)',
            color: role === 'Admin' ? '#ffd700' : '#667eea',
          }}>
            {role === 'Admin' ? '👑 Admin' : '👤 User'}
          </span>
          <button style={styles.navBtn} onClick={() => navigate('/agents')}>Agentes</button>
          <button style={styles.navBtn} onClick={() => navigate('/tasks')}>Tareas</button>
          <button style={{...styles.navBtn, color: '#ff6b6b'}} onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </nav>

      <div style={styles.content}>
        <h2 style={styles.title}>Dashboard</h2>
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{agents.length}</div>
            <div style={styles.statLabel}>Agentes activos</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{tasks.length}</div>
            <div style={styles.statLabel}>Tareas recientes</div>
          </div>
          <div style={{...styles.statCard, borderColor: '#51cf66'}}>
            <div style={{...styles.statNumber, color: '#51cf66'}}>{completed}</div>
            <div style={styles.statLabel}>Completadas</div>
          </div>
          <div style={{...styles.statCard, borderColor: '#ff6b6b'}}>
            <div style={{...styles.statNumber, color: '#ff6b6b'}}>{failed}</div>
            <div style={styles.statLabel}>Fallidas</div>
          </div>
        </div>

        <h3 style={styles.sectionTitle}>Últimas tareas</h3>
        <div style={styles.taskList}>
          {tasks.length === 0 && <p style={styles.empty}>No hay tareas aún</p>}
          {tasks.map(task => (
            <div key={task.id} style={styles.taskCard}>
              <div style={styles.taskHeader}>
                <span style={styles.taskName}>{task.taskName}</span>
                <span style={{
                  ...styles.taskStatus,
                  background: task.status === 'Completed' ? 'rgba(81,207,102,0.2)' : 'rgba(255,107,107,0.2)',
                  color: task.status === 'Completed' ? '#51cf66' : '#ff6b6b'
                }}>{task.status}</span>
              </div>
              <p style={styles.taskResult}>{task.result?.slice(0, 100)}...</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#0f0f1a', color: '#fff' },
  loading: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f1a', color: '#fff', fontSize: '1.5rem' },
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  logo: { margin: 0, color: '#fff' },
  navLinks: { display: 'flex', gap: '16px', alignItems: 'center' },
  navBtn: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '1rem', padding: '8px 16px', borderRadius: '8px' },
  roleBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' },
  content: { padding: '32px' },
  title: { color: '#fff', marginBottom: '24px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' },
  statCard: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(102,126,234,0.3)', borderRadius: '12px', padding: '24px', textAlign: 'center' },
  statNumber: { fontSize: '2.5rem', fontWeight: 'bold', color: '#667eea' },
  statLabel: { color: 'rgba(255,255,255,0.6)', marginTop: '8px' },
  sectionTitle: { color: '#fff', marginBottom: '16px' },
  taskList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  taskCard: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px' },
  taskHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  taskName: { fontWeight: 'bold', color: '#fff' },
  taskStatus: { padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem' },
  taskResult: { color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '0.9rem' },
  empty: { color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
};