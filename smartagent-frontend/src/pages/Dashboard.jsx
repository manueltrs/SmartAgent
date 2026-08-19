import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AGENT_META = {
    asistente: { emoji: '🤖', label: 'Asistente' },
    resumidor: { emoji: '📝', label: 'Resumidor' },
    traductor: { emoji: '🌐', label: 'Traductor' },
    analista: { emoji: '📊', label: 'Analista' },
    programador: { emoji: '💻', label: 'Programador' },
};

function metaFor(type) {
    return AGENT_META[type?.toLowerCase()] || { emoji: '⚡', label: type || 'Agente' };
}

export default function Dashboard() {
    const navigate = useNavigate();
    const role = localStorage.getItem('role');

    const [agents, setAgents] = useState([]);
    const [selectedAgentId, setSelectedAgentId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [prompt, setPrompt] = useState('');
    const [taskName, setTaskName] = useState('');
    const [sending, setSending] = useState(false);
    const [loadingAgents, setLoadingAgents] = useState(true);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [showNewAgent, setShowNewAgent] = useState(false);
    const [newAgent, setNewAgent] = useState({ name: '', type: 'Asistente', description: '' });
    const [creatingAgent, setCreatingAgent] = useState(false);
    const scrollRef = useRef(null);

    const selectedAgent = agents.find((a) => a.id === selectedAgentId);

    const stats = {
        total: agents.length,
        activos: agents.filter((a) => a.isActive).length,
        completadas: messages.filter((m) => m.status === 'Completed').length,
        fallidas: messages.filter((m) => m.status === 'Failed').length,
    };

    const loadAgents = useCallback(async () => {
        setLoadingAgents(true);
        try {
            const res = await api.get('/agents');
            setAgents(res.data);
            if (res.data.length > 0 && !selectedAgentId) {
                setSelectedAgentId(res.data[0].id);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingAgents(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadHistory = useCallback(async (agentId) => {
        if (!agentId) return;
        setLoadingHistory(true);
        try {
            const res = await api.get(`/agents/${agentId}/tasks`);
            setMessages([...res.data].reverse());
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingHistory(false);
        }
    }, []);

    useEffect(() => { loadAgents(); }, [loadAgents]);
    useEffect(() => { loadHistory(selectedAgentId); }, [selectedAgentId, loadHistory]);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, sending]);

    const handleSend = async () => {
        if (!prompt.trim() || !selectedAgentId || sending) return;
        setSending(true);

        const optimistic = {
            id: `pending-${Date.now()}`,
            taskName: taskName.trim() || 'Consulta',
            parameters: prompt,
            status: 'Running',
            result: null,
            createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, optimistic]);
        const sentPrompt = prompt;
        const sentTaskName = taskName.trim() || 'Consulta';
        setPrompt('');
        setTaskName('');

        try {
            const res = await api.post(`/agents/${selectedAgentId}/execute`, {
                taskName: sentTaskName,
                parameters: sentPrompt,
            });
            setMessages((prev) =>
                prev.map((m) => (m.id === optimistic.id ? res.data : m))
            );
        } catch (err) {
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === optimistic.id
                        ? { ...m, status: 'Failed', result: err.response?.data?.message || err.response?.data || 'Error al ejecutar' }
                        : m
                )
            );
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleCreateAgent = async () => {
        if (!newAgent.name.trim()) return;
        setCreatingAgent(true);
        try {
            const res = await api.post('/agents', newAgent);
            setAgents((prev) => [...prev, res.data]);
            setSelectedAgentId(res.data.id);
            setShowNewAgent(false);
            setNewAgent({ name: '', type: 'Asistente', description: '' });
        } catch (err) {
            console.error(err);
        } finally {
            setCreatingAgent(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    return (
        <div style={styles.page}>
            <style>{globalCss}</style>

            {/* Header con stats */}
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <span style={styles.logoMark}>◆</span>
                    <h1 style={styles.brand}>SmartAgent</h1>
                    {role && (
                        <span style={styles.roleBadge}>
                            {role === 'Admin' ? '👑 Admin' : '👤 User'}
                        </span>
                    )}
                </div>
                <div style={styles.statsRow}>
                    <Stat label="Agentes" value={stats.total} />
                    <Stat label="Activos" value={stats.activos} color="#00F0FF" />
                    <Stat label="Completadas" value={stats.completadas} color="#4ADE80" />
                    <Stat label="Fallidas" value={stats.fallidas} color="#FF6B8B" />
                </div>
                <button style={styles.logoutButton} onClick={handleLogout}>Salir</button>
            </header>

            <div style={styles.body}>
                {/* Sidebar de agentes */}
                <aside style={styles.sidebar}>
                    <div style={styles.sidebarHeader}>
                        <span style={styles.sidebarTitle}>Tus agentes</span>
                        <button style={styles.newAgentBtn} onClick={() => setShowNewAgent((s) => !s)}>
                            {showNewAgent ? '×' : '+'}
                        </button>
                    </div>

                    {showNewAgent && (
                        <div style={styles.newAgentForm} className="sa-fadein">
                            <input
                                style={styles.newAgentInput}
                                placeholder="Nombre del agente"
                                value={newAgent.name}
                                onChange={(e) => setNewAgent((n) => ({ ...n, name: e.target.value }))}
                            />
                            <select
                                style={styles.newAgentSelect}
                                value={newAgent.type}
                                onChange={(e) => setNewAgent((n) => ({ ...n, type: e.target.value }))}
                            >
                                {Object.values(AGENT_META).map((m) => (
                                    <option key={m.label} value={m.label}>{m.emoji} {m.label}</option>
                                ))}
                            </select>
                            <textarea
                                style={styles.newAgentTextarea}
                                placeholder="Descripción breve"
                                value={newAgent.description}
                                onChange={(e) => setNewAgent((n) => ({ ...n, description: e.target.value }))}
                            />
                            <button
                                style={styles.newAgentSubmit}
                                onClick={handleCreateAgent}
                                disabled={creatingAgent || !newAgent.name.trim()}
                            >
                                {creatingAgent ? 'Creando...' : 'Crear agente'}
                            </button>
                        </div>
                    )}

                    {loadingAgents ? (
                        <div style={styles.sidebarEmpty}>Cargando...</div>
                    ) : agents.length === 0 ? (
                        <div style={styles.sidebarEmpty}>Aún no tienes agentes. Crea uno con “+”.</div>
                    ) : (
                        <div style={styles.agentList}>
                            {agents.map((a) => {
                                const meta = metaFor(a.type);
                                const active = a.id === selectedAgentId;
                                return (
                                    <button
                                        key={a.id}
                                        onClick={() => setSelectedAgentId(a.id)}
                                        style={{ ...styles.agentItem, ...(active ? styles.agentItemActive : {}) }}
                                        className="sa-agent-item"
                                    >
                                        <span style={styles.agentEmoji}>{meta.emoji}</span>
                                        <span style={styles.agentInfo}>
                                            <span style={styles.agentName}>{a.name}</span>
                                            <span style={styles.agentType}>{meta.label}</span>
                                        </span>
                                        <span style={{ ...styles.agentDot, background: a.isActive ? '#4ADE80' : '#5C6B7D' }} />
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </aside>

                {/* Zona de chat */}
                <main style={styles.chatArea}>
                    {!selectedAgent ? (
                        <div style={styles.emptyState}>
                            <span style={{ fontSize: '2.5rem' }}>⚡</span>
                            <p>Selecciona o crea un agente para empezar</p>
                        </div>
                    ) : (
                        <>
                            <div style={styles.chatHeader}>
                                <span style={{ fontSize: '1.3rem' }}>{metaFor(selectedAgent.type).emoji}</span>
                                <div>
                                    <div style={styles.chatHeaderName}>{selectedAgent.name}</div>
                                    <div style={styles.chatHeaderType}>{metaFor(selectedAgent.type).label} · {selectedAgent.isActive ? 'Activo' : 'Inactivo'}</div>
                                </div>
                            </div>

                            <div style={styles.messages} ref={scrollRef}>
                                {loadingHistory ? (
                                    <div style={styles.emptyState}><p>Cargando conversación...</p></div>
                                ) : messages.length === 0 ? (
                                    <div style={styles.emptyState}>
                                        <span style={{ fontSize: '2rem' }}>{metaFor(selectedAgent.type).emoji}</span>
                                        <p>Escríbele algo a {selectedAgent.name} para empezar</p>
                                    </div>
                                ) : (
                                    messages.map((m) => (
                                        <div key={m.id} style={styles.messageGroup}>
                                            <div style={styles.userBubbleWrap}>
                                                <div style={styles.userBubble}>{m.parameters}</div>
                                            </div>
                                            <div style={styles.agentBubbleWrap}>
                                                <span style={styles.agentAvatar}>{metaFor(selectedAgent.type).emoji}</span>
                                                <div style={styles.agentBubble} className="sa-fadein">
                                                    {m.status === 'Running' ? (
                                                        <span style={styles.typingDots} className="sa-typing-dots">
                                                            <span />ॱ<span />ॱ<span />
                                                        </span>
                                                    ) : (
                                                        <>
                                                            <div style={m.status === 'Failed' ? styles.resultError : styles.resultText}>
                                                                {m.result}
                                                            </div>
                                                            <div style={styles.msgMeta}>
                                                                {m.status === 'Failed' ? '⚠ Error' : '✓ Completado'}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div style={styles.inputBar}>
                                <input
                                    style={styles.taskNameInput}
                                    placeholder="Título breve (opcional)"
                                    value={taskName}
                                    onChange={(e) => setTaskName(e.target.value)}
                                />
                                <div style={styles.inputRow}>
                                    <textarea
                                        style={styles.promptInput}
                                        className="sa-prompt-input"
                                        placeholder={`Escribe una tarea para ${selectedAgent.name}...`}
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        rows={1}
                                    />
                                    <button
                                        style={{ ...styles.sendButton, opacity: prompt.trim() && !sending ? 1 : 0.4 }}
                                        onClick={handleSend}
                                        disabled={!prompt.trim() || sending}
                                    >
                                        {sending ? <span style={styles.spinner} className="sa-spinner" /> : <SendIcon />}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}

function Stat({ label, value, color = '#DCF6FF' }) {
    return (
        <div style={styles.statBox}>
            <span style={{ ...styles.statValue, color }}>{value}</span>
            <span style={styles.statLabel}>{label}</span>
        </div>
    );
}

function SendIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m22 2-7 20-4-9-9-4Z" />
            <path d="M22 2 11 13" />
        </svg>
    );
}

const globalCss = `
@keyframes saFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
@keyframes saSpin { to { transform: rotate(360deg); } }
@keyframes saDot { 0%, 80%, 100% { opacity: .25; transform: scale(.8); } 40% { opacity: 1; transform: scale(1); } }
.sa-fadein { animation: saFadeIn .25s ease both; }
.sa-agent-item { transition: background .15s ease, transform .1s ease; }
.sa-agent-item:hover { background: rgba(0,240,255,.06) !important; }
.sa-spinner {
  display: inline-block; width: 16px; height: 16px;
  border: 2px solid rgba(5,8,14,.3); border-top-color: #05080E;
  border-radius: 50%; animation: saSpin .7s linear infinite;
}
.sa-typing-dots span {
  display: inline-block; width: 6px; height: 6px; border-radius: 50%;
  background: #5C6B7D; margin: 0 2px; animation: saDot 1.2s infinite ease-in-out;
}
.sa-typing-dots span:nth-child(2) { animation-delay: .15s; }
.sa-typing-dots span:nth-child(3) { animation-delay: .3s; }
.sa-prompt-input { transition: border-color .15s ease, box-shadow .15s ease; }
.sa-prompt-input:focus { border-color: #00F0FF !important; box-shadow: 0 0 0 1px rgba(0,240,255,.4); }
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-thumb { background: rgba(0,240,255,.15); border-radius: 4px; }
::-webkit-scrollbar-track { background: transparent; }
`;

const styles = {
    page: {
        height: '100vh', display: 'flex', flexDirection: 'column',
        background: '#05080E', fontFamily: "'Inter', system-ui, sans-serif", color: '#DCF6FF', overflow: 'hidden',
    },
    header: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px', borderBottom: '1px solid rgba(0,240,255,0.1)',
        background: 'rgba(9,13,20,0.9)', backdropFilter: 'blur(10px)', flexShrink: 0, gap: '16px', flexWrap: 'wrap',
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
    logoMark: { color: '#00F0FF', fontSize: '1.1rem' },
    brand: { fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#E8F6FF' },
    roleBadge: {
        fontSize: '0.7rem', padding: '3px 9px', borderRadius: '20px',
        background: 'rgba(0,240,255,.08)', border: '1px solid rgba(0,240,255,.25)', color: '#00F0FF',
    },
    statsRow: { display: 'flex', gap: '22px' },
    statBox: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
    statValue: { fontSize: '1.05rem', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" },
    statLabel: { fontSize: '0.62rem', color: '#5C6B7D', letterSpacing: '0.04em', textTransform: 'uppercase' },
    logoutButton: {
        background: 'none', border: '1px solid rgba(255,107,139,.3)', color: '#FF6B8B',
        borderRadius: '6px', padding: '7px 14px', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit',
    },
    body: { flex: 1, display: 'flex', minHeight: 0 },
    sidebar: {
        width: '260px', flexShrink: 0, borderRight: '1px solid rgba(0,240,255,0.1)',
        display: 'flex', flexDirection: 'column', padding: '16px', gap: '10px', overflowY: 'auto',
    },
    sidebarHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    sidebarTitle: { fontSize: '0.75rem', color: '#5C6B7D', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 },
    newAgentBtn: {
        width: '26px', height: '26px', borderRadius: '6px', border: '1px solid rgba(0,240,255,.3)',
        background: 'rgba(0,240,255,.06)', color: '#00F0FF', fontSize: '1rem', cursor: 'pointer', lineHeight: 1,
    },
    newAgentForm: {
        display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px',
        background: 'rgba(0,240,255,.03)', border: '1px solid rgba(0,240,255,.12)', borderRadius: '8px',
    },
    newAgentInput: {
        padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(0,240,255,.15)',
        background: 'rgba(255,255,255,.02)', color: '#DCF6FF', fontSize: '0.82rem', outline: 'none', fontFamily: 'inherit',
    },
    newAgentSelect: {
        padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(0,240,255,.15)',
        background: '#0B0E14', color: '#DCF6FF', fontSize: '0.82rem', outline: 'none', fontFamily: 'inherit',
    },
    newAgentTextarea: {
        padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(0,240,255,.15)',
        background: 'rgba(255,255,255,.02)', color: '#DCF6FF', fontSize: '0.8rem', outline: 'none',
        fontFamily: 'inherit', resize: 'vertical', minHeight: '50px',
    },
    newAgentSubmit: {
        padding: '9px', borderRadius: '6px', border: 'none', background: '#00F0FF', color: '#05080E',
        fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit',
    },
    sidebarEmpty: { color: '#3D4A5C', fontSize: '0.8rem', padding: '20px 8px', textAlign: 'center', lineHeight: 1.5 },
    agentList: { display: 'flex', flexDirection: 'column', gap: '4px' },
    agentItem: {
        display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', borderRadius: '8px',
        border: '1px solid transparent', background: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
    },
    agentItemActive: { background: 'rgba(0,240,255,.08)', border: '1px solid rgba(0,240,255,.25)' },
    agentEmoji: { fontSize: '1.15rem' },
    agentInfo: { display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 },
    agentName: { fontSize: '0.85rem', fontWeight: 600, color: '#DCF6FF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    agentType: { fontSize: '0.68rem', color: '#5C6B7D' },
    agentDot: { width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0 },
    chatArea: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
    emptyState: {
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '10px', color: '#3D4A5C', fontSize: '0.9rem',
    },
    chatHeader: {
        display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 22px',
        borderBottom: '1px solid rgba(0,240,255,0.08)', flexShrink: 0,
    },
    chatHeaderName: { fontSize: '0.95rem', fontWeight: 700, color: '#E8F6FF' },
    chatHeaderType: { fontSize: '0.72rem', color: '#5C6B7D' },
    messages: { flex: 1, overflowY: 'auto', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '18px' },
    messageGroup: { display: 'flex', flexDirection: 'column', gap: '10px' },
    userBubbleWrap: { display: 'flex', justifyContent: 'flex-end' },
    userBubble: {
        maxWidth: '70%', background: 'linear-gradient(135deg, #00B8D4, #0090A8)', color: '#05080E',
        padding: '10px 14px', borderRadius: '14px 14px 4px 14px', fontSize: '0.88rem', lineHeight: 1.5, fontWeight: 500,
    },
    agentBubbleWrap: { display: 'flex', gap: '10px', alignItems: 'flex-start' },
    agentAvatar: {
        width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(0,240,255,.08)',
        border: '1px solid rgba(0,240,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, fontSize: '0.95rem',
    },
    agentBubble: {
        maxWidth: '70%', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
        padding: '10px 14px', borderRadius: '14px 14px 14px 4px', fontSize: '0.88rem', lineHeight: 1.6,
    },
    resultText: { color: '#DCF6FF', whiteSpace: 'pre-wrap' },
    resultError: { color: '#FF6B8B', whiteSpace: 'pre-wrap' },
    msgMeta: { fontSize: '0.65rem', color: '#3D4A5C', marginTop: '6px' },
    typingDots: { display: 'inline-flex', alignItems: 'center', padding: '4px 2px' },
    inputBar: {
        padding: '14px 22px 20px', borderTop: '1px solid rgba(0,240,255,0.08)',
        display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0,
    },
    taskNameInput: {
        padding: '7px 12px', borderRadius: '8px', border: '1px solid rgba(0,240,255,.1)',
        background: 'rgba(255,255,255,.02)', color: '#8B9AAD', fontSize: '0.75rem', outline: 'none',
        fontFamily: 'inherit', maxWidth: '260px',
    },
    inputRow: { display: 'flex', gap: '10px', alignItems: 'flex-end' },
    promptInput: {
        flex: 1, padding: '13px 16px', borderRadius: '14px', border: '1px solid rgba(0,240,255,.15)',
        background: 'rgba(255,255,255,.02)', color: '#DCF6FF', fontSize: '0.9rem', outline: 'none',
        fontFamily: 'inherit', resize: 'none', maxHeight: '140px', lineHeight: 1.5,
    },
    sendButton: {
        width: '44px', height: '44px', borderRadius: '50%', border: 'none',
        background: '#00F0FF', color: '#05080E', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0, transition: 'transform .1s ease',
    },
    spinner: {
        display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(5,8,14,.3)',
        borderTopColor: '#05080E', borderRadius: '50%',
    },
};
