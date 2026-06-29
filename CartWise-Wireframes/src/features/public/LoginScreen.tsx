import {useState, type FormEvent} from 'react';
import {ChevronLeft, Eye, EyeOff} from 'lucide-react';
import {AUTH_EMAIL, AUTH_PASS} from '../../domain/constants';

export function LoginScreen({onLogin, onBack}: {onLogin: () => void; onBack?: () => void}) {
  const [email, setEmail] = useState(AUTH_EMAIL);
  const [password, setPassword] = useState(AUTH_PASS);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (email.trim().toLowerCase() === AUTH_EMAIL && password === AUTH_PASS) {
      setError('');
      onLogin();
      return;
    }
    setError('Credenciales inválidas. Revisa tu correo y contraseña.');
  };

  return (
    <main className="cw-login">
      <div className="cw-login-card">
        <section className="cw-login-form-side">
          {onBack && (
            <button type="button" className="cw-link-btn cw-login-back" onClick={onBack}>
              <ChevronLeft size={16} aria-hidden="true" /> Volver al inicio
            </button>
          )}
          <h1>Bienvenido de vuelta</h1>
          <p>Inicia sesión para preparar tu compra y comparar precios.</p>
          <form onSubmit={submit} className="cw-login-form">
            <label htmlFor="cw-login-email">
              Correo
              <input
                id="cw-login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'cw-login-error' : undefined}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label htmlFor="cw-login-password">
              Contraseña
              <div className="cw-password-field">
                <input
                  id="cw-login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? 'cw-login-error' : undefined}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  className="cw-password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
            </label>
            {error && <div className="cw-form-error" id="cw-login-error" role="alert">{error}</div>}
            <button type="submit" className="cw-primary-btn">Ingresar</button>
          </form>
        </section>
        <aside className="cw-login-info">
          <span className="cw-kicker">Compara y ahorra</span>
          <h2>Encuentra dónde conviene comprar, en 3 pasos</h2>
          <ol className="cw-login-steps">
            <li className="cw-step"><span>1</span> Busca los productos que necesitas</li>
            <li className="cw-step"><span>2</span> Ajusta las cantidades de tu compra</li>
            <li className="cw-step"><span>3</span> Compara las 4 tiendas y ahorra</li>
          </ol>
        </aside>
      </div>
    </main>
  );
}
