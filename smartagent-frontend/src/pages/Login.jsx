import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
    const [mode, setMode] = useState('login'); // 'login' o 'register'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);

            const payload = JSON.parse(atob(res.data.token.split('.')[1]));
            const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            localStorage.setItem('role', role);

            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data || 'Credenciales incorrectas');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/register', { email, password });
            setSuccess('¡Usuario creado exitosamente! Ya puedes iniciar sesión.');
            setMode('login');
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data || 'Error al registrar');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            mode === 'login' ? handleLogin() : handleRegister();
        }
    };

    return (
        <div style={styles.page}>
            <style>{globalCss}</style>

            {/* Red de nodos ambiente — evoca agentes conectados */}
            <div style={styles.nodeField} aria-hidden="true">
                {NODES.map((n, i) => (
                    <span
                        key={i}
                        className="sa-node"
                        style={{ left: `${n.x}%`, top: `${n.y}%`, animationDelay: `${n.delay}s` }}
                    />
                ))}
                <svg style={styles.nodeLines} preserveAspectRatio="none">
                    {LINES.map(([a, b], i) => (
                        <line
                            key={i}
                            x1={`${NODES[a].x}%`} y1={`${NODES[a].y}%`}
                            x2={`${NODES[b].x}%`} y2={`${NODES[b].y}%`}
                            className="sa-line"
                            style={{ animationDelay: `${i * 0.4}s` }}
                        />
                    ))}
                </svg>
            </div>

            <div style={styles.card} className="sa-card">
                <div style={styles.brandRow}>
                    <span style={styles.brandMark}>◆</span>
                    <div>
                        <h1 style={styles.title}>SmartAgent</h1>
                        <p style={styles.subtitle}>
                            {mode === 'login' ? 'Accede a tu panel de agentes' : 'Registra una nueva cuenta'}
                        </p>
                    </div>
                </div>

                <div style={styles.tabs}>
                    <button
                        style={{ ...styles.tab, ...(mode === 'login' ? styles.tabActive : {}) }}
                        onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                    >
                        Iniciar sesión
                    </button>
                    <button
                        style={{ ...styles.tab, ...(mode === 'register' ? styles.tabActive : {}) }}
                        onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
                    >
                        Registrarse
                    </button>
                </div>

                {error && <div style={styles.error} className="sa-alert">{error}</div>}
                {success && <div style={styles.successMsg} className="sa-alert">{success}</div>}

                <div style={styles.field}>
                    <span style={styles.fieldIcon}><MailIcon /></span>
                    <input
                        style={styles.input}
                        className="sa-input"
                        type="email"
                        placeholder="tu@correo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>

                <div style={styles.field}>
                    <span style={styles.fieldIcon}><LockIcon /></span>
                    <input
                        style={{ ...styles.input, paddingRight: '44px' }}
                        className="sa-input"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        type="button"
                        style={styles.eyeButton}
                        onClick={() => setShowPassword((s) => !s)}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                </div>

                {mode === 'register' && (
                    <>
                        <div style={styles.field}>
                            <span style={styles.fieldIcon}><LockIcon /></span>
                            <input
                                style={styles.input}
                                className="sa-input"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Confirmar contraseña"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        <div style={styles.roleInfo}>
                            <span style={styles.roleInfoIcon}><ShieldIcon /></span>
                            Los nuevos usuarios se registran como <strong style={{ color: '#E6EDF3' }}>User</strong>.
                            Solo un Admin puede crear otros Admins.
                        </div>
                    </>
                )}

                <button
                    style={loading ? { ...styles.button, opacity: 0.7 } : styles.button}
                    className="sa-button"
                    onClick={mode === 'login' ? handleLogin : handleRegister}
                    disabled={loading}
                >
                    {loading ? (
                        <span style={styles.spinner} className="sa-spinner" />
                    ) : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                </button>

                <p style={styles.footerNote}>
                    Plataforma de gestión de agentes de IA
                </p>
            </div>
        </div>
    );
}

/* ---------- Iconos SVG inline (sin dependencias externas) ---------- */
const iconProps = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };

function MailIcon() {
    return (
        <svg {...iconProps}>
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m2 6 10 7 10-7" />
        </svg>
    );
}
function LockIcon() {
    return (
        <svg {...iconProps}>
            <rect x="4" y="10" width="16" height="10" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
    );
}
function ShieldIcon() {
    return (
        <svg {...iconProps} width="16" height="16">
            <path d="M12 2 4 5v6c0 5 3.4 8.4 8 9 4.6-.6 8-4 8-9V5l-8-3Z" />
        </svg>
    );
}
function EyeIcon() {
    return (
        <svg {...iconProps}>
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}
function EyeOffIcon() {
    return (
        <svg {...iconProps}>
            <path d="M3 3l18 18" />
            <path d="M10.6 5.1A11.6 11.6 0 0 1 12 5c7 0 11 7 11 7a17.5 17.5 0 0 1-3.2 4M6.5 6.6C3.7 8.4 2 12 2 12s4 7 11 7c1.4 0 2.7-.3 3.9-.7" />
            <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
        </svg>
    );
}

/* ---------- Datos de la red de nodos ambiente ---------- */
const NODES = [
    { x: 8, y: 15, delay: 0 }, { x: 22, y: 65, delay: 0.6 }, { x: 88, y: 20, delay: 1.1 },
    { x: 78, y: 75, delay: 0.3 }, { x: 45, y: 8, delay: 0.9 }, { x: 92, y: 55, delay: 1.4 },
    { x: 12, y: 88, delay: 0.2 }, { x: 60, y: 92, delay: 1.6 },
];
const LINES = [[0, 4], [4, 2], [2, 5], [1, 6], [3, 7], [3, 5], [1, 0]];

/* ---------- CSS global (animaciones que no se pueden hacer solo con style inline) ---------- */
const globalCss = `
@keyframes saNodePulse { 0%, 100% { opacity: .25; transform: scale(1); } 50% { opacity: .9; transform: scale(1.6); } }
@keyframes saLineDraw { 0% { stroke-dashoffset: 1; opacity: 0; } 15% { opacity: .5; } 100% { stroke-dashoffset: 0; opacity: .18; } }
@keyframes saCardIn { from { opacity: 0; transform: translateY(14px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes saSpin { to { transform: rotate(360deg); } }
.sa-node {
  position: absolute; width: 4px; height: 4px; border-radius: 50%;
  background: #5EEAD4; box-shadow: 0 0 8px 1px rgba(94,234,212,.6);
  animation: saNodePulse 3.2s ease-in-out infinite;
}
.sa-line {
  stroke: #5EEAD4; stroke-width: 1; pathLength: 1;
  stroke-dasharray: 1; stroke-dashoffset: 1;
  animation: saLineDraw 2.4s ease-out forwards;
}
.sa-card { animation: saCardIn .5s cubic-bezier(.22,1,.36,1) both; }
.sa-input {
  transition: border-color .15s ease, box-shadow .15s ease, background .15s ease;
}
.sa-input:focus {
  border-color: #5EEAD4 !important;
  box-shadow: 0 0 0 3px rgba(94,234,212,.15);
  background: rgba(94,234,212,.05) !important;
}
.sa-button {
  transition: transform .15s ease, box-shadow .15s ease, filter .15s ease;
}
.sa-button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px -4px rgba(94,234,212,.4);
  filter: brightness(1.05);
}
.sa-button:not(:disabled):active { transform: translateY(0); }
.sa-alert { animation: saCardIn .3s ease both; }
.sa-spinner {
  display: inline-block; width: 16px; height: 16px;
  border: 2px solid rgba(11,14,20,.3); border-top-color: #0B0E14;
  border-radius: 50%; animation: saSpin .7s linear infinite;
}
input::placeholder { color: #5B6472; font-family: 'Inter', system-ui, sans-serif; }
`;

/* ---------- Estilos ---------- */
const styles = {
    page: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: '#0B0E14',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    },
    nodeField: {
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
    },
    nodeLines: {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
    },
    card: {
        position: 'relative',
        zIndex: 1,
        background: 'linear-gradient(180deg, #131824 0%, #0F131C 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: '36px',
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxShadow: '0 20px 60px -20px rgba(0,0,0,.6), 0 0 0 1px rgba(94,234,212,.03)',
    },
    brandRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '4px',
    },
    brandMark: {
        fontSize: '1.4rem',
        color: '#5EEAD4',
        lineHeight: 1,
    },
    title: {
        color: '#E6EDF3',
        margin: 0,
        fontSize: '1.5rem',
        fontFamily: "'Space Grotesk', 'Inter', sans-serif",
        fontWeight: 600,
        letterSpacing: '-0.01em',
    },
    subtitle: {
        color: '#8B95A7',
        margin: '2px 0 0',
        fontSize: '0.85rem',
    },
    tabs: {
        display: 'flex',
        gap: '4px',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: '10px',
        padding: '4px',
    },
    tab: {
        flex: 1,
        padding: '9px',
        borderRadius: '7px',
        border: 'none',
        background: 'none',
        color: '#8B95A7',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: 500,
        fontFamily: 'inherit',
        transition: 'color .15s ease',
    },
    tabActive: {
        background: '#1B2230',
        color: '#5EEAD4',
        boxShadow: 'inset 0 0 0 1px rgba(94,234,212,.25)',
    },
    field: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
    },
    fieldIcon: {
        position: 'absolute',
        left: '14px',
        display: 'flex',
        color: '#5B6472',
        pointerEvents: 'none',
    },
    input: {
        width: '100%',
        padding: '12px 14px 12px 42px',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.03)',
        color: '#E6EDF3',
        fontSize: '0.92rem',
        outline: 'none',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
    },
    eyeButton: {
        position: 'absolute',
        right: '12px',
        background: 'none',
        border: 'none',
        color: '#5B6472',
        cursor: 'pointer',
        display: 'flex',
        padding: '4px',
    },
    button: {
        padding: '13px',
        borderRadius: '10px',
        border: 'none',
        background: '#5EEAD4',
        color: '#0B0E14',
        fontSize: '0.95rem',
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: "'Space Grotesk', 'Inter', sans-serif",
        marginTop: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '46px',
    },
    error: {
        background: 'rgba(248,81,73,0.12)',
        border: '1px solid rgba(248,81,73,0.3)',
        color: '#ff8783',
        padding: '10px 12px',
        borderRadius: '8px',
        fontSize: '0.82rem',
    },
    successMsg: {
        background: 'rgba(94,234,212,0.1)',
        border: '1px solid rgba(94,234,212,0.3)',
        color: '#5EEAD4',
        padding: '10px 12px',
        borderRadius: '8px',
        fontSize: '0.82rem',
    },
    roleInfo: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        color: '#8B95A7',
        padding: '10px 12px',
        borderRadius: '8px',
        fontSize: '0.78rem',
        lineHeight: 1.5,
    },
    roleInfoIcon: {
        color: '#5EEAD4',
        flexShrink: 0,
        marginTop: '1px',
    },
    footerNote: {
        textAlign: 'center',
        color: '#4A5262',
        fontSize: '0.7rem',
        fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: '0.02em',
        margin: '4px 0 0',
    },
};
