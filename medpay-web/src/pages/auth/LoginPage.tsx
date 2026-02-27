import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/stores/auth.store';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || '/';

  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!username.trim()) newErrors.username = '请输入用户名';
    if (!password) newErrors.password = '请输入密码';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await authApi.login({ username: username.trim(), password });
      setAuth(response);
      toast.success('欢迎回来！');
      navigate(from, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : '登录失败';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Login form */}
      <div
        className="relative flex w-full flex-col items-center justify-center px-6 py-12 lg:w-3/5"
        style={{
          backgroundColor: 'var(--ivory-50)',
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(61, 122, 74, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(198, 123, 92, 0.03) 0%, transparent 50%),
            linear-gradient(60deg, transparent 40%, rgba(61, 122, 74, 0.02) 40%, rgba(61, 122, 74, 0.02) 41%, transparent 41%),
            linear-gradient(-60deg, transparent 40%, rgba(198, 123, 92, 0.02) 40%, rgba(198, 123, 92, 0.02) 41%, transparent 41%)
          `,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className="w-full max-w-md"
        >
          <GlassCard className="p-8">
            {/* Logo */}
            <div className="mb-8 text-center">
              <h1 className="font-display text-4xl font-bold text-sage-800">
                MedPay
              </h1>
              <p className="mt-2 text-base text-sage-600">
                医疗商城支付系统
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="用户名"
                icon={User}
                placeholder="请输入用户名"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errors.username) setErrors((prev) => ({ ...prev, username: undefined }));
                }}
                error={errors.username}
                autoComplete="username"
              />

              <div className="relative">
                <Input
                  label="密码"
                  icon={Lock}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  error={errors.password}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-sage-400 transition-colors hover:text-sage-600"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full"
                size="lg"
              >
                登录
              </Button>
            </form>

            {/* Register link */}
            <p className="mt-6 text-center text-sm text-sage-700/60">
              还没有账号？{' '}
              <Link
                to="/register"
                className="font-medium text-sage-500 transition-colors hover:text-sage-600"
              >
                立即注册
              </Link>
            </p>
          </GlassCard>
        </motion.div>
      </div>

      {/* Right side - Decorative panel (hidden on mobile) */}
      <div className="relative hidden overflow-hidden lg:flex lg:w-2/5 lg:flex-col lg:items-center lg:justify-center lg:bg-gradient-to-br lg:from-sage-500 lg:to-sage-700 lg:px-12">
        {/* Floating decorative shapes */}
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute bottom-20 right-10 h-24 w-24 rotate-45 rounded-lg bg-white/5" />
        <div className="absolute left-1/4 top-1/3 h-16 w-16 rounded-full bg-white/10 animate-float" />
        <div
          className="absolute right-1/4 bottom-1/3 h-12 w-12 rotate-12 rounded-lg bg-white/10 animate-float"
          style={{ animationDelay: '1.5s' }}
        />
        <div className="absolute left-10 bottom-40 h-8 w-8 rounded-full bg-white/10 animate-float" style={{ animationDelay: '0.8s' }} />

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative z-10 text-center"
        >
          <h2 className="font-display text-3xl font-bold leading-tight text-white">
            智慧医疗，
            <br />
            便捷支付
          </h2>
          <p className="mt-4 max-w-xs text-base text-white/70">
            一站式管理预约、处方和支付
          </p>

          {/* Decorative dots */}
          <div className="mt-10 flex justify-center gap-2">
            <div className="h-2 w-2 rounded-full bg-white/40" />
            <div className="h-2 w-6 rounded-full bg-white/80" />
            <div className="h-2 w-2 rounded-full bg-white/40" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
