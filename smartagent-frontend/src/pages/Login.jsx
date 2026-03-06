import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
    const [mode, setMode] = useState('login'); // 'login' o 'register'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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

            // Decodificar el token para obtener el rol
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

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>🤖 SmartAgent</h1>
                <p style={styles.subtitle}>
                    {mode === 'login' ? 'Inicia sesión para continuar' : 'Crea tu cuenta'}
                </p>

                <div style={styles.tabs}>
                    <button
                        style={{ ...styles.tab, ...(mode === 'login' ? styles.tabActive : {}) }}
                        onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                    >
                        Iniciar Sesión
                    </button>
                    <button
                        style={{ ...styles.tab, ...(mode === 'register' ? styles.tabActive : {}) }}
                        onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
                    >
                        Registrarse
                    </button>
                </div>

                {error && <div style={styles.error}>{error}</div>}
                {success && <div style={styles.successMsg}>{success}</div>}

                <input
                    style={styles.input}
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    style={styles.input}
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {mode === 'register' && (
                    <>
                        <input
                            style={styles.input}
                            type="password"
                            placeholder="Confirmar contraseña"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <div style={styles.roleInfo}>
                            🔒 Los nuevos usuarios se registran como <strong>User</strong>.
                            Solo un Admin puede crear otros Admins.
                        </div>
                    </>
                )}

                <button
                    style={loading ? { ...styles.button, opacity: 0.7 } : styles.button}
                    onClick={mode === 'login' ? handleLogin : handleRegister}
                    disabled={loading}
                >
                    {loading ? 'Cargando...' : mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                </button>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    },
    card: {
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    title: { color: '#fff', textAlign: 'center', margin: 0, fontSize: '2rem' },
    subtitle: { color: 'rgba(255,255,255,0.6)', textAlign: 'center', margin: 0 },
    tabs: { display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '4px' },
    tab: { flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.9rem' },
    tabActive: { background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', fontWeight: 'bold' },
    input: {
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.2)',
        background: 'rgba(255,255,255,0.1)',
        color: '#fff',
        fontSize: '1rem',
        outline: 'none',
    },
    button: {
        padding: '12px',
        borderRadius: '8px',
        border: 'none',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: '#fff',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    error: {
        background: 'rgba(255,0,0,0.2)',
        border: '1px solid rgba(255,0,0,0.3)',
        color: '#ff6b6b',
        padding: '10px',
        borderRadius: '8px',
        textAlign: 'center',
        fontSize: '0.9rem',
    },
    successMsg: {
        background: 'rgba(81,207,102,0.2)',
        border: '1px solid rgba(81,207,102,0.3)',
        color: '#51cf66',
        padding: '10px',
        borderRadius: '8px',
        textAlign: 'center',
        fontSize: '0.9rem',
    },
    roleInfo: {
        background: 'rgba(102,126,234,0.15)',
        border: '1px solid rgba(102,126,234,0.3)',
        color: 'rgba(255,255,255,0.7)',
        padding: '10px',
        borderRadius: '8px',
        fontSize: '0.85rem',
        textAlign: 'center',
    },
};