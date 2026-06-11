// src/pages/ChangePasswordPage.tsx
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService, { ApiError, ValidationDetail } from '../api/services/auth.service';
import { evaluatePassword, isPasswordValid } from '../utils/password';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Alert from '../components/common/Alert';
import Card from '../components/common/Card';

type FieldName = 'contrasenaActual' | 'contrasenaNueva' | 'contrasenaConfirmacion';

const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const usuario = authService.getUsuarioLocal();

  const [formData, setFormData] = useState<Record<FieldName, string>>({
    contrasenaActual: '',
    contrasenaNueva: '',
    contrasenaConfirmacion: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Requisitos de seguridad evaluados en vivo sobre la contraseña nueva.
  const requirements = useMemo(
    () => evaluatePassword(formData.contrasenaNueva),
    [formData.contrasenaNueva]
  );

  const passwordsMatch =
    formData.contrasenaConfirmacion.length > 0 &&
    formData.contrasenaNueva === formData.contrasenaConfirmacion;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar errores del campo editado y mensajes globales.
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setError(null);
  };

  /** Validación en el cliente antes de llamar al backend. */
  const validate = (): boolean => {
    const errors: Partial<Record<FieldName, string>> = {};

    if (!formData.contrasenaActual) {
      errors.contrasenaActual = 'Ingresa tu contraseña actual';
    }
    if (!isPasswordValid(formData.contrasenaNueva)) {
      errors.contrasenaNueva = 'La contraseña no cumple con los requisitos de seguridad';
    } else if (formData.contrasenaNueva === formData.contrasenaActual) {
      errors.contrasenaNueva = 'La contraseña nueva debe ser distinta de la actual';
    }
    if (formData.contrasenaNueva !== formData.contrasenaConfirmacion) {
      errors.contrasenaConfirmacion = 'Las contraseñas no coinciden';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const { mensaje } = await authService.changePassword(formData);
      setSuccess(mensaje || 'Contraseña actualizada correctamente');
      setFormData({ contrasenaActual: '', contrasenaNueva: '', contrasenaConfirmacion: '' });
      // Regresar al panel tras un breve momento para que el usuario vea el éxito.
      setTimeout(() => navigate('/dashboard'), 1800);
    } catch (err) {
      const apiError = err as ApiError;
      // Mapear los detalles de validación del backend a cada campo.
      if (apiError.detalles && apiError.detalles.length > 0) {
        const backendErrors: Partial<Record<FieldName, string>> = {};
        apiError.detalles.forEach((d: ValidationDetail) => {
          backendErrors[d.campo as FieldName] = d.error;
        });
        setFieldErrors(backendErrors);
      }
      setError(apiError.message || 'No se pudo cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const inputType = showPasswords ? 'text' : 'password';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SIGE</h1>
                <p className="text-xs text-gray-500">Sistema de Gestión Escolar</p>
              </div>
            </div>
            {usuario && (
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{usuario.nombre}</p>
                <p className="text-xs text-gray-500 capitalize">{usuario.rol}</p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al panel
        </button>

        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Cambiar contraseña</h2>
          <p className="text-gray-600 mb-6">
            Por tu seguridad, confirma tu contraseña actual antes de establecer una nueva.
          </p>

          {error && (
            <div className="mb-4">
              <Alert type="error" message={error} onClose={() => setError(null)} />
            </div>
          )}
          {success && (
            <div className="mb-4">
              <Alert type="success" message={success} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Contraseña actual"
              type={inputType}
              name="contrasenaActual"
              value={formData.contrasenaActual}
              onChange={handleChange}
              error={fieldErrors.contrasenaActual}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            <Input
              label="Contraseña nueva"
              type={inputType}
              name="contrasenaNueva"
              value={formData.contrasenaNueva}
              onChange={handleChange}
              error={fieldErrors.contrasenaNueva}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />

            {/* Lista de requisitos de seguridad en vivo */}
            {formData.contrasenaNueva.length > 0 && (
              <ul className="space-y-1 text-sm">
                {requirements.map((req) => (
                  <li
                    key={req.label}
                    className={`flex items-center gap-2 ${req.valid ? 'text-green-600' : 'text-gray-500'}`}
                  >
                    <span aria-hidden="true">{req.valid ? '✓' : '○'}</span>
                    {req.label}
                  </li>
                ))}
              </ul>
            )}

            <Input
              label="Confirmar contraseña nueva"
              type={inputType}
              name="contrasenaConfirmacion"
              value={formData.contrasenaConfirmacion}
              onChange={handleChange}
              error={fieldErrors.contrasenaConfirmacion}
              helperText={
                passwordsMatch && !fieldErrors.contrasenaConfirmacion
                  ? 'Las contraseñas coinciden'
                  : undefined
              }
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />

            <label className="flex items-center gap-2 text-sm text-gray-600 select-none">
              <input
                type="checkbox"
                checked={showPasswords}
                onChange={(e) => setShowPasswords(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Mostrar contraseñas
            </label>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => navigate('/dashboard')}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" fullWidth loading={loading}>
                {loading ? 'Guardando...' : 'Actualizar contraseña'}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default ChangePasswordPage;
