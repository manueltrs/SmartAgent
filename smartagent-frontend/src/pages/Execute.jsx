import { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import api from '../services/api';

export default function Execute() {
    const { id } = useParams();
    const { state } = useLocation();
    const agent = state?.agent;
    const navigate = useNavigate();

    const [taskName, setTaskName] = useState('');
    const [parameters, setParameters] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const execute = async () => {
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const res = await api.post(`/agents/${id}/execute`, { taskName, parameters });
            setResult(res.data);
        } catch (err) {
            setError('Error al ejecutar la tarea');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <nav style={styles.nav}>
                <h1 style={styles.logo}>🤖 SmartAgent</h1>
                <div style={styles.navLinks}>
                    <button style={styles.navBtn} onClick={() => navigate('/dashboard')}>Dashboard</button>
                    <button style={styles.navBtn} onClick={() => navigate('/agents')}>Agentes</button>
                    <button style={styles.navBtn} onClick={() => navigate('/tasks')}>Tareas</button>
                    <button style={{ ...styles.navBtn, color: '#ff6b6b' }} onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}>Cerrar sesión</button>
                </div>
            </nav>

            <div style={styles.content}>
                <button style={styles.backBtn} onClick={() => navigate('/agents')}>← Volver</button>

                {agent && (
                    <div style={styles.agentInfo}>
                        <h2 style={styles.agentName}>⚡ {agent.name}</h2>
                        <span style={styles.agentType}>{agent.type}</span>
                        <p style={styles.agentDesc}>{agent.description}</p>
                    </div>
                )}

                <div style={styles.form}>
                    <h3 style={styles.formTitle}>Nueva tarea</h3>
                    {error && <div style={styles.error}>{error}</div>}
                    <input
                        style={styles.input}
                        placeholder="Nombre de la tarea (ej: Resumir texto)"
                        value={taskName}
                        onChange={(e) => setTaskName(e.target.value)}
                    />
                    <textarea
                        style={{ ...styles.input, height: '120px', resize: 'vertical' }}
                        placeholder="Parámetros o contenido para la tarea..."
                        value={parameters}
                        onChange={(e) => setParameters(e.target.value)}
                    />
                    <button
                        style={loading ? { ...styles.executeBtn, opacity: 0.7 } : styles.executeBtn}
                        onClick={execute}
                        disabled={loading}
                    >
                        {loading ? '⏳ Ejecutando...' : '⚡ Ejecutar'}
                    </button>
                </div>

                {result && (
                    <div style={styles.result}>
                        <div style={styles.resultHeader}>
                            <h3 style={styles.resultTitle}>Resultado</h3>
                            <span style={{
                                ...styles.statusBadge,
                                background: result.status === 'Completed' ? 'rgba(81,207,102,0.2)' : 'rgba(255,107,107,0.2)',
                                color: result.status === 'Completed' ? '#51cf66' : '#ff6b6b'
                            }}>{result.status}</span>
                        </div>
                        <pre style={styles.resultText}>{result.result}</pre>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: { minHeight: '100vh', background: '#0f0f1a', color: '#fff' },
    nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' },
    logo: { margin: 0, color: '#fff' },
    navLinks: { display: 'flex', gap: '16px' },
    navBtn: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '1rem', padding: '8px 16px', borderRadius: '8px' },
    content: { padding: '32px', maxWidth: '800px', margin: '0 auto' },
    backBtn: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '1rem', marginBottom: '24px', padding: 0 },
    agentInfo: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '24px', marginBottom: '24px' },
    agentName: { color: '#fff', margin: '0 0 8px 0' },
    agentType: { background: 'rgba(102,126,234,0.2)', color: '#667eea', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem' },
    agentDesc: { color: 'rgba(255,255,255,0.6)', marginTop: '12px', marginBottom: 0 },
    form: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '24px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' },
    formTitle: { color: '#fff', margin: 0 },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '1rem', fontFamily: 'inherit' },
    executeBtn: { padding: '12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' },
    error: { background: 'rgba(255,0,0,0.2)', border: '1px solid rgba(255,0,0,0.3)', color: '#ff6b6b', padding: '10px', borderRadius: '8px' },
    result: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '24px' },
    resultHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    resultTitle: { color: '#fff', margin: 0 },
    statusBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem' },
    resultText: { color: 'rgba(255,255,255,0.8)', whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit', lineHeight: '1.6' },
};