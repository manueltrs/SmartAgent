import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
    const [mode, setMode] = useState('login');
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
        if (e.key === 'Enter') mode === 'login' ? handleLogin() : handleRegister();
    };

    return (
        <div style={styles.page}>
            <style>{globalCss}</style>

            {/* Grid de fondo animado */}
            <div style={styles.grid} aria-hidden="true" />
            <div style={styles.scanline} aria-hidden="true" />
            <div style={styles.glowOrb1} aria-hidden="true" />
            <div style={styles.glowOrb2} aria-hidden="true" />

            <div style={styles.card} className="sa-card">
                {/* Esquinas HUD */}
                <span style={{ ...styles.corner, ...styles.cornerTL }} />
                <span style={{ ...styles.corner, ...styles.cornerTR }} />
                <span style={{ ...styles.corner, ...styles.cornerBL }} />
                <span style={{ ...styles.corner, ...styles.cornerBR }} />

                <div style={styles.header}>
                    <div style={styles.logoRing} className="sa-ring">
                        <span style={styles.logoCore} />
                    </div>
                    <h1 style={styles.title}>SMART<span style={{ color: '#00F0FF' }}>AGENT</span></h1>
                    <p style={styles.subtitle} className="sa-typing">
                        {mode === 'login' ? '> INICIANDO_SESIÓN...' : '> NUEVO_REGISTRO...'}
                    </p>
                </div>

                <div style={styles.tabs}>
                    <button
                        style={{ ...styles.tab, ...(mode === 'login' ? styles.tabActive : {}) }}
                        onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                    >
                        [ ACCESO ]
                    </button>
                    <button
                        style={{ ...styles.tab, ...(mode === 'register' ? styles.tabActive : {}) }}
                        onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
                    >
                        [ REGISTRO ]
                    </button>
                </div>

                {error && <div style={styles.error} className="sa-alert">⚠ {error}</div>}
                {success && <div style={styles.successMsg} className="sa-alert">✓ {success}</div>}

                <label style={styles.label}>IDENTIFICADOR</label>
                <div style={styles.field}>
                    <span style={styles.fieldIcon}><MailIcon /></span>
                    <input
                        style={styles.input}
                        className="sa-input"
                        type="email"
                        placeholder="usuario@dominio.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <span style={styles.fieldBracket}>&gt;</span>
                </div>

                <label style={styles.label}>CLAVE DE ACCESO</label>
                <div style={styles.field}>
                    <span style={styles.fieldIcon}><LockIcon /></span>
                    <input
                        style={{ ...styles.input, paddingRight: '44px' }}
                        className="sa-input"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button type="button" style={styles.eyeButton} onClick={() => setShowPassword((s) => !s)}>
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                </div>

                {mode === 'register' && (
                    <>
                        <label style={styles.label}>CONFIRMAR CLAVE</label>
                        <div style={styles.field}>
                            <span style={styles.fieldIcon}><LockIcon /></span>
                            <input
                                style={styles.input}
                                className="sa-input"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        <div style={styles.roleInfo}>
                            <span style={styles.roleInfoIcon}><ShieldIcon /></span>
                            NIVEL DE ACCESO: <strong style={{ color: '#00F0FF' }}>USER</strong> · Los privilegios de Admin requieren autorización superior.
                        </div>
                    </>
                )}

                <button
                    style={loading ? { ...styles.button, opacity: 0.6 } : styles.button}
                    className="sa-button"
                    onClick={mode === 'login' ? handleLogin : handleRegister}
                    disabled={loading}
                >
                    <span style={styles.buttonGlow} />
                    {loading ? (
                        <span style={styles.spinner} className="sa-spinner" />
                    ) : mode === 'login' ? 'INICIAR CONEXIÓN' : 'CREAR IDENTIDAD'}
                </button>

                <p style={styles.footerNote}>
                    SISTEMA DE GESTIÓN DE AGENTES IA · v2.0
                </p>
            </div>
        </div>
    );
}

const iconProps = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };

function MailIcon() {
    return <svg {...iconProps}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 6 10 7 10-7" /></svg>;
}
function LockIcon() {
    return <svg {...iconProps}><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>;
}
function ShieldIcon() {
    return <svg {...iconProps} width="16" height="16"><path d="M12 2 4 5v6c0 5 3.4 8.4 8 9 4.6-.6 8-4 8-9V5l-8-3Z" /></svg>;
}
function EyeIcon() {
    return <svg {...iconProps}><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" /><circle cx="12" cy="12" r="3" /></svg>;
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

const globalCss = `
@keyframes saGridMove { from { background-position: 0 0; } to { background-position: 48px 48px; } }
@keyframes saScan { 0% { top: -10%; } 100% { top: 110%; } }
@keyframes saOrb1 { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,-20px) scale(1.15); } }
@keyframes saOrb2 { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-25px,25px) scale(1.1); } }
@keyframes saRingSpin { to { transform: rotate(360deg); } }
@keyframes saCoreGlow { 0%, 100% { box-shadow: 0 0 8px 2px rgba(0,240,255,.6); } 50% { box-shadow: 0 0 18px 6px rgba(0,240,255,.9); } }
@keyframes saCardIn { from { opacity: 0; transform: translateY(18px) scale(.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes saSpin { to { transform: rotate(360deg); } }
@keyframes saBlink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: .3; } }
.sa-card { animation: saCardIn .55s cubic-bezier(.22,1,.36,1) both; position: relative; }
.sa-ring { animation: saRingSpin 6s linear infinite; }
.sa-ring span { animation: saCoreGlow 2s ease-in-out infinite; }
.sa-typing { border-right: 2px solid #00F0FF; animation: saBlink 1s step-end infinite; display: inline-block; }
.sa-input { transition: border-color .15s ease, box-shadow .15s ease, background .15s ease; }
.sa-input:focus {
  border-color: #00F0FF !important;
  box-shadow: 0 0 0 1px #00F0FF, 0 0 16px 0 rgba(0,240,255,.35);
  background: rgba(0,240,255,.04) !important;
}
.sa-button { transition: transform .15s ease, box-shadow .2s ease, filter .15s ease; position: relative; overflow: hidden; }
.sa-button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 0 24px 4px rgba(0,240,255,.55), 0 8px 20px -6px rgba(0,0,0,.5);
  filter: brightness(1.08);
}
.sa-button:not(:disabled):active { transform: translateY(0); }
.sa-alert { animation: saCardIn .3s ease both; }
.sa-spinner {
  display: inline-block; width: 16px; height: 16px;
  border: 2px solid rgba(5,8,14,.35); border-top-color: #05080E;
  border-radius: 50%; animation: saSpin .7s linear infinite;
}
input::placeholder { color: #3D4A5C; font-family: 'JetBrains Mono', monospace; font-size: 0.82rem; }
`;

const styles = {
    page: {
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden', background: '#05080E',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    },
    grid: {
        position: 'absolute', inset: '-50px',
        backgroundImage: 'linear-gradient(rgba(0,240,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,.06) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        animation: 'saGridMove 6s linear infinite',
        maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 75%)',
        WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 75%)',
    },
    scanline: {
        position: 'absolute', left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg, transparent, rgba(0,240,255,.5), transparent)',
        animation: 'saScan 4.5s linear infinite', pointerEvents: 'none',
    },
    glowOrb1: {
        position: 'absolute', width: '380px', height: '380px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,240,255,.14) 0%, transparent 70%)',
        top: '-8%', left: '-6%', animation: 'saOrb1 9s ease-in-out infinite', filter: 'blur(10px)',
    },
    glowOrb2: {
        position: 'absolute', width: '420px', height: '420px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(157,0,255,.12) 0%, transparent 70%)',
        bottom: '-10%', right: '-8%', animation: 'saOrb2 10s ease-in-out infinite', filter: 'blur(10px)',
    },
    card: {
        zIndex: 1, background: 'rgba(9,13,20,0.85)', backdropFilter: 'blur(16px)',
        border: '1px solid rgba(0,240,255,0.2)', borderRadius: '4px', padding: '38px',
        width: '100%', maxWidth: '410px', display: 'flex', flexDirection: 'column', gap: '13px',
        boxShadow: '0 0 0 1px rgba(0,240,255,.06), 0 25px 70px -20px rgba(0,0,0,.7), 0 0 40px -10px rgba(0,240,255,.15)',
    },
    corner: { position: 'absolute', width: '18px', height: '18px', borderColor: '#00F0FF', pointerEvents: 'none' },
    cornerTL: { top: '-1px', left: '-1px', borderTop: '2px solid', borderLeft: '2px solid' },
    cornerTR: { top: '-1px', right: '-1px', borderTop: '2px solid', borderRight: '2px solid' },
    cornerBL: { bottom: '-1px', left: '-1px', borderBottom: '2px solid', borderLeft: '2px solid' },
    cornerBR: { bottom: '-1px', right: '-1px', borderBottom: '2px solid', borderRight: '2px solid' },
    header: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '4px' },
    logoRing: {
        width: '46px', height: '46px', borderRadius: '50%',
        border: '2px solid transparent', borderTopColor: '#00F0FF', borderRightColor: 'rgba(0,240,255,.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    logoCore: { width: '10px', height: '10px', borderRadius: '50%', background: '#00F0FF' },
    title: {
        color: '#E8F6FF', margin: 0, fontSize: '1.5rem', fontFamily: "'Space Grotesk', 'Inter', sans-serif",
        fontWeight: 700, letterSpacing: '0.03em',
    },
    subtitle: { color: '#5FE1F2', margin: 0, fontSize: '0.78rem', fontFamily: "'JetBrains Mono', monospace" },
    tabs: { display: 'flex', gap: '4px', background: 'rgba(0,240,255,0.04)', border: '1px solid rgba(0,240,255,.12)', borderRadius: '3px', padding: '4px' },
    tab: {
        flex: 1, padding: '9px', borderRadius: '2px', border: 'none', background: 'none', color: '#5C6B7D',
        cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: '0.05em', transition: 'color .15s ease',
    },
    tabActive: { background: 'rgba(0,240,255,.1)', color: '#00F0FF', boxShadow: 'inset 0 0 0 1px rgba(0,240,255,.4)' },
    label: { color: '#4A5A6E', fontSize: '0.65rem', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em', marginBottom: '-6px', marginTop: '2px' },
    field: { position: 'relative', display: 'flex', alignItems: 'center' },
    fieldIcon: { position: 'absolute', left: '14px', display: 'flex', color: '#3D5064', pointerEvents: 'none' },
    fieldBracket: { position: 'absolute', right: '14px', color: '#1F5F6B', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', pointerEvents: 'none' },
    input: {
        width: '100%', padding: '12px 14px 12px 42px', borderRadius: '3px',
        border: '1px solid rgba(0,240,255,0.14)', background: 'rgba(0,240,255,0.02)',
        color: '#DCF6FF', fontSize: '0.9rem', outline: 'none', fontFamily: "'Inter', sans-serif", boxSizing: 'border-box',
    },
    eyeButton: { position: 'absolute', right: '12px', background: 'none', border: 'none', color: '#3D5064', cursor: 'pointer', display: 'flex', padding: '4px' },
    button: {
        padding: '14px', borderRadius: '3px', border: '1px solid rgba(0,240,255,.5)',
        background: 'linear-gradient(135deg, #00F0FF 0%, #00B8D4 100%)', color: '#05080E',
        fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'Space Grotesk', 'Inter', sans-serif",
        letterSpacing: '0.06em', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '48px',
    },
    buttonGlow: { position: 'absolute', inset: 0, pointerEvents: 'none' },
    error: {
        background: 'rgba(255,45,85,0.08)', border: '1px solid rgba(255,45,85,0.3)', color: '#FF6B8B',
        padding: '10px 12px', borderRadius: '3px', fontSize: '0.78rem', fontFamily: "'JetBrains Mono', monospace",
    },
    successMsg: {
        background: 'rgba(0,240,255,0.06)', border: '1px solid rgba(0,240,255,0.3)', color: '#00F0FF',
        padding: '10px 12px', borderRadius: '3px', fontSize: '0.78rem', fontFamily: "'JetBrains Mono', monospace",
    },
    roleInfo: {
        display: 'flex', alignItems: 'flex-start', gap: '8px', background: 'rgba(0,240,255,0.03)',
        border: '1px solid rgba(0,240,255,0.1)', color: '#5C6B7D', padding: '10px 12px', borderRadius: '3px',
        fontSize: '0.7rem', lineHeight: 1.6, fontFamily: "'JetBrains Mono', monospace",
    },
    roleInfoIcon: { color: '#00F0FF', flexShrink: 0, marginTop: '1px' },
    footerNote: {
        textAlign: 'center', color: '#2A3542', fontSize: '0.62rem', fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: '0.1em', margin: '6px 0 0',
    },
};
