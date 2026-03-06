import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Agents() {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', type: 'Asistente', description: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => { loadAgents(); }, []);

    const loadAgents = async () => {
        try {
            const res = await api.get('/agents');
            setAgents(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const createAgent = async () => {
        setError('');
        try {
            await api.post('/agents', form);
            setForm({ name: '', type: 'Asistente', description: '' });
            setShowForm(false);
            loadAgents();
        } catch (err) {
            setError(err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : 'Error al crear agente');
        }
    };

    const typeColors = {
        Asistente: '#667eea',
        Resumidor: '#f093fb',
        Traductor: '#4facfe',
        Analista: '#43e97b',
        Programador: '#fa709a',
    };

    const typeEmojis = {
        Asistente: '🤖',
        Resumidor: '📝',
        Traductor: '🌐',
        Analista: '📊',
        Programador: '💻',
    };

    if (loading) return <div style={styles.loading}>Cargando...</div>;

    return (
        <div style={styles.container}>
            <nav style={styles.nav}>
                <h1 style={styles.logo}>🤖 SmartAgent</h1>
                <div style={styles.navLinks}>
                    <button style={styles.navBtn} onClick={() => navigate('/dashboard')}>Dashboard</button>
                    <button style={styles.navBtn} onClick={() => navigate('/tasks')}>Tareas</button>
                    <button style={{ ...styles.navBtn, color: '#ff6b6b' }} onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}>Cerrar sesión</button>
                </div>
            </nav>

            <div style={styles.content}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Mis Agentes</h2>
                    <button style={styles.createBtn} onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancelar' : '+ Nuevo Agente'}
                    </button>
                </div>

                {showForm && (
                    <div style={styles.form}>
                        <h3 style={styles.formTitle}>Crear nuevo agente</h3>
                        {error && <div style={styles.error}>{error}</div>}
                        <input
                            style={styles.input}
                            placeholder="Nombre del agente"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                        <select
                            style={styles.input}
                            value={form.type}
                            onChange={(e) => setForm({ ...form, type: e.target.value })}
                        >
                            <option>Asistente</option>
                            <option>Resumidor</option>
                            <option>Traductor</option>
                            <option>Analista</option>
                            <option>Programador</option>
                        </select>
                        <input
                            style={styles.input}
                            placeholder="Descripción"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                        <button style={styles.createBtn} onClick={createAgent}>Crear Agente</button>
                    </div>
                )}

                <div style={styles.grid}>
                    {agents.map(agent => (
                        <div key={agent.id} style={styles.card}>
                            <div style={styles.cardHeader}>
                                <span style={styles.emoji}>{typeEmojis[agent.type] || '🤖'}</span>
                                <span style={{ ...styles.typeBadge, background: `${typeColors[agent.type]}22`, color: typeColors[agent.type] || '#667eea' }}>
                                    {agent.type}
                                </span>
                            </div>
                            <h3 style={styles.agentName}>{agent.name}</h3>
                            <p style={styles.agentDesc}>{agent.description}</p>
                            <button
                                style={styles.executeBtn}
                                onClick={() => navigate(`/execute/${agent.id}`, { state: { agent } })}
                            >
                                ⚡ Ejecutar tarea
                            </button>
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
    navLinks: { display: 'flex', gap: '16px' },
    navBtn: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '1rem', padding: '8px 16px', borderRadius: '8px' },
    content: { padding: '32px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    title: { color: '#fff', margin: 0 },
    createBtn: { padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', cursor: 'pointer', fontWeight: 'bold' },
    form: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '24px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' },
    formTitle: { color: '#fff', margin: 0 },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '1rem' },
    error: { background: 'rgba(255,0,0,0.2)', border: '1px solid rgba(255,0,0,0.3)', color: '#ff6b6b', padding: '10px', borderRadius: '8px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' },
    card: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    emoji: { fontSize: '2rem' },
    typeBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' },
    agentName: { color: '#fff', margin: 0 },
    agentDesc: { color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '0.9rem' },
    executeBtn: { padding: '10px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', cursor: 'pointer', fontWeight: 'bold' },
};