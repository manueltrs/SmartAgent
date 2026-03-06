import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const navigate = useNavigate();

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const agentsRes = await api.get('/agents');
            setAgents(agentsRes.data);
            const allTasks = [];
            for (const agent of agentsRes.data) {
                const tasksRes = await api.get(`/agents/${agent.id}/tasks`);
                allTasks.push(...tasksRes.data.map(t => ({ ...t, agentName: agent.name, agentType: agent.type })));
            }
            setTasks(allTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={styles.loading}>Cargando...</div>;

    return (
        <div style={styles.container}>
            <nav style={styles.nav}>
                <h1 style={styles.logo}>🤖 SmartAgent</h1>
                <div style={styles.navLinks}>
                    <button style={styles.navBtn} onClick={() => navigate('/dashboard')}>Dashboard</button>
                    <button style={styles.navBtn} onClick={() => navigate('/agents')}>Agentes</button>
                    <button style={{ ...styles.navBtn, color: '#ff6b6b' }} onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}>Cerrar sesión</button>
                </div>
            </nav>

            <div style={styles.content}>
                <h2 style={styles.title}>Historial de Tareas</h2>

                <div style={styles.layout}>
                    <div style={styles.list}>
                        {tasks.length === 0 && <p style={styles.empty}>No hay tareas aún</p>}
                        {tasks.map(task => (
                            <div
                                key={task.id}
                                style={{ ...styles.taskCard, border: selected?.id === task.id ? '1px solid #667eea' : '1px solid rgba(255,255,255,0.1)' }}
                                onClick={() => setSelected(task)}
                            >
                                <div style={styles.taskHeader}>
                                    <span style={styles.taskName}>{task.taskName}</span>
                                    <span style={{
                                        ...styles.statusBadge,
                                        background: task.status === 'Completed' ? 'rgba(81,207,102,0.2)' : 'rgba(255,107,107,0.2)',
                                        color: task.status === 'Completed' ? '#51cf66' : '#ff6b6b'
                                    }}>{task.status}</span>
                                </div>
                                <div style={styles.taskMeta}>
                                    <span>🤖 {task.agentName}</span>
                                    <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={styles.detail}>
                        {!selected && <p style={styles.empty}>Selecciona una tarea para ver el detalle</p>}
                        {selected && (
                            <>
                                <h3 style={styles.detailTitle}>{selected.taskName}</h3>
                                <div style={styles.detailMeta}>
                                    <span>🤖 {selected.agentName} ({selected.agentType})</span>
                                    <span>{new Date(selected.createdAt).toLocaleString()}</span>
                                </div>
                                <div style={styles.detailSection}>
                                    <h4 style={styles.detailLabel}>Parámetros</h4>
                                    <p style={styles.detailText}>{selected.parameters}</p>
                                </div>
                                <div style={styles.detailSection}>
                                    <h4 style={styles.detailLabel}>Resultado</h4>
                                    <pre style={styles.detailResult}>{selected.result}</pre>
                                </div>
                            </>
                        )}
                    </div>
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
    navLinks: { display: 'flex', gap: '16px' },
    navBtn: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '1rem', padding: '8px 16px', borderRadius: '8px' },
    content: { padding: '32px' },
    title: { color: '#fff', marginBottom: '24px' },
    layout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
    list: { display: 'flex', flexDirection: 'column', gap: '12px' },
    taskCard: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', cursor: 'pointer' },
    taskHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
    taskName: { fontWeight: 'bold', color: '#fff' },
    statusBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem' },
    taskMeta: { display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' },
    detail: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '24px' },
    detailTitle: { color: '#fff', margin: '0 0 12px 0' },
    detailMeta: { display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '16px' },
    detailSection: { marginBottom: '16px' },
    detailLabel: { color: '#667eea', margin: '0 0 8px 0' },
    detailText: { color: 'rgba(255,255,255,0.7)', margin: 0 },
    detailResult: { color: 'rgba(255,255,255,0.8)', whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit', lineHeight: '1.6' },
    empty: { color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
};