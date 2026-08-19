import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const TYPE_EMOJI = {
    Asistente: '🤖', Resumidor: '📝', Traductor: '🌐', Analista: '📊', Programador: '💻',
};

export default function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [filter, setFilter] = useState('all');
    const navigate = useNavigate();

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const agentsRes = await api.get('/agents');
            const allTasks = [];
            for (const agent of agentsRes.data) {
                const tasksRes = await api.get(`/agents/${agent.id}/tasks`);
                allTasks.push(...tasksRes.data.map((t) => ({ ...t, agentName: agent.name, agentType: agent.type })));
            }
            const sorted = allTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setTasks(sorted);
            if (sorted.length > 0) setSelected(sorted[0]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredTasks = tasks.filter((t) => {
        if (filter === 'all') return true;
        if (filter === 'completed') return t.status === 'Completed';
        if (filter === 'failed') return t.status === 'Failed';
        return true;
    });

    if (loading) {
        return (
            <div style={styles.loadingPage}>
                <style>{globalCss}</style>
                <span style={styles.spinner} className="sa-spinner" />
                <p>Cargando historial...</p>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <style>{globalCss}</style>

            <nav style={styles.nav}>
                <div style={styles.navLeft}>
                    <span style={styles.logoMark}>◆</span>
                    <h1 style={styles.logo}>SmartAgent</h1>
                </div>
                <div style={styles.navLinks}>
                    <button style={styles.navBtn} onClick={() => navigate('/dashboard')}>Dashboard</button>
                    <button
                        style={{ ...styles.navBtn, color: '#FF6B8B' }}
                        onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('role'); navigate('/login'); }}
                    >
                        Cerrar sesión
                    </button>
                </div>
            </nav>

            <div style={styles.content}>
                <div style={styles.headerRow}>
                    <h2 style={styles.title}>Historial de Tareas</h2>
                    <div style={styles.filters}>
                        {['all', 'completed', 'failed'].map((f) => (
                            <button
                                key={f}
                                style={{ ...styles.filterBtn, ...(filter === f ? styles.filterBtnActive : {}) }}
                                onClick={() => setFilter(f)}
                            >
                                {f === 'all' ? 'Todas' : f === 'completed' ? 'Completadas' : 'Fallidas'}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={styles.layout}>
                    <div style={styles.list}>
                        {filteredTasks.length === 0 && <p style={styles.empty}>No hay tareas en esta categoría</p>}
                        {filteredTasks.map((task) => (
                            <div
                                key={task.id}
                                style={{
                                    ...styles.taskCard,
                                    ...(selected?.id === task.id ? styles.taskCardActive : {}),
                                }}
                                className="sa-task-card"
                                onClick={() => setSelected(task)}
                            >
                                <div style={styles.taskHeader}>
                                    <span style={styles.taskName}>{task.taskName}</span>
                                    <span
                                        style={{
                                            ...styles.statusBadge,
                                            background: task.status === 'Completed' ? 'rgba(74,222,128,0.12)' : 'rgba(255,107,139,0.12)',
                                            color: task.status === 'Completed' ? '#4ADE80' : '#FF6B8B',
                                        }}
                                    >
                                        {task.status === 'Completed' ? '✓ Completada' : '⚠ Fallida'}
                                    </span>
                                </div>
                                <div style={styles.taskMeta}>
                                    <span>{TYPE_EMOJI[task.agentType] || '⚡'} {task.agentName}</span>
                                    <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={styles.detail}>
                        {!selected ? (
                            <p style={styles.empty}>Selecciona una tarea para ver el detalle</p>
                        ) : (
                            <>
                                <div style={styles.detailHeader}>
                                    <h3 style={styles.detailTitle}>{selected.taskName}</h3>
                                    <span
                                        style={{
                                            ...styles.statusBadge,
                                            background: selected.status === 'Completed' ? 'rgba(74,222,128,0.12)' : 'rgba(255,107,139,0.12)',
                                            color: selected.status === 'Completed' ? '#4ADE80' : '#FF6B8B',
                                        }}
                                    >
                                        {selected.status}
                                    </span>
                                </div>
                                <div style={styles.detailMeta}>
                                    <span>{TYPE_EMOJI[selected.agentType] || '⚡'} {selected.agentName} · {selected.agentType}</span>
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

const globalCss = `
@keyframes saSpin { to { transform: rotate(360deg); } }
.sa-spinner {
  display: inline-block; width: 28px; height: 28px;
  border: 3px solid rgba(0,240,255,.15); border-top-color: #00F0FF;
  border-radius: 50%; animation: saSpin .8s linear infinite;
}
.sa-task-card { transition: border-color .15s ease, background .15s ease; }
.sa-task-card:hover { background: rgba(0,240,255,.04) !important; }
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-thumb { background: rgba(0,240,255,.15); border-radius: 4px; }
::-webkit-scrollbar-track { background: transparent; }
`;

const styles = {
    page: { minHeight: '100vh', background: '#05080E', color: '#DCF6FF', fontFamily: "'Inter', system-ui, sans-serif" },
    loadingPage: {
        minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '14px', background: '#05080E', color: '#8B9AAD',
    },
    nav: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px',
        borderBottom: '1px solid rgba(0,240,255,0.1)', background: 'rgba(9,13,20,0.9)', backdropFilter: 'blur(10px)',
    },
    navLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
    logoMark: { color: '#00F0FF', fontSize: '1.1rem' },
    logo: { margin: 0, fontSize: '1.05rem', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: '#E8F6FF' },
    navLinks: { display: 'flex', gap: '8px' },
    navBtn: {
        background: 'none', border: '1px solid transparent', color: '#8B9AAD', cursor: 'pointer',
        fontSize: '0.85rem', padding: '8px 14px', borderRadius: '8px', fontFamily: 'inherit',
    },
    content: { padding: '32px', maxWidth: '1200px', margin: '0 auto' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
    title: { color: '#E8F6FF', margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.3rem' },
    filters: { display: 'flex', gap: '6px', background: 'rgba(0,240,255,.04)', border: '1px solid rgba(0,240,255,.1)', borderRadius: '9px', padding: '4px' },
    filterBtn: {
        padding: '7px 14px', borderRadius: '6px', border: 'none', background: 'none', color: '#5C6B7D',
        fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
    },
    filterBtnActive: { background: 'rgba(0,240,255,.1)', color: '#00F0FF' },
    layout: { display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px' },
    list: { display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '4px' },
    taskCard: {
        background: 'rgba(255,255,255,.02)', border: '1px solid rgba(0,240,255,0.08)', borderRadius: '10px',
        padding: '14px 16px', cursor: 'pointer',
    },
    taskCardActive: { border: '1px solid rgba(0,240,255,.4)', background: 'rgba(0,240,255,.05)' },
    taskHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', gap: '8px' },
    taskName: { fontWeight: 600, color: '#DCF6FF', fontSize: '0.9rem' },
    statusBadge: { padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600, whiteSpace: 'nowrap' },
    taskMeta: { display: 'flex', justifyContent: 'space-between', color: '#5C6B7D', fontSize: '0.78rem' },
    detail: {
        background: 'rgba(255,255,255,.02)', border: '1px solid rgba(0,240,255,0.1)', borderRadius: '12px',
        padding: '24px', height: 'fit-content',
    },
    detailHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '8px' },
    detailTitle: { color: '#E8F6FF', margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem' },
    detailMeta: { display: 'flex', justifyContent: 'space-between', color: '#5C6B7D', fontSize: '0.78rem', marginBottom: '18px' },
    detailSection: { marginBottom: '18px' },
    detailLabel: { color: '#00F0FF', margin: '0 0 8px 0', fontSize: '0.78rem', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' },
    detailText: { color: '#B8C7D9', margin: 0, fontSize: '0.88rem', lineHeight: 1.6 },
    detailResult: { color: '#DCF6FF', whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit', lineHeight: 1.6, fontSize: '0.88rem' },
    empty: { color: '#3D4A5C', textAlign: 'center', padding: '20px', fontSize: '0.85rem' },
};
