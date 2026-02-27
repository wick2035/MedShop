import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Phone, Mail, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/api/auth.api';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface FormData {
  fullName: string;
  username: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  fullName?: string;
  username?: string;
  phone?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>({
    fullName: '',
    username: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  function updateField(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = '请输入姓名';
    if (!form.username.trim()) newErrors.username = '请输入用户名';
    if (form.username.trim().length < 3) newErrors.username = '用户名至少3个字符';
    if (!form.phone.trim()) newErrors.phone = '请输入手机号';
    if (!/^1\d{10}$/.test(form.phone.trim())) newErrors.phone = '请输入有效的手机号';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = '请输入有效的邮箱';
    }
    if (!form.password) newErrors.password = '请输入密码';
    if (form.password.length < 6) newErrors.password = '密码至少6个字符';
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await authApi.register({
        fullName: form.fullName.trim(),
        username: form.username.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        password: form.password,
      });
      toast.success('注册成功！请登录');
      navigate('/login');
    } catch (err) {
      const message = err instanceof Error ? err.message : '注册失败';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Decorative panel (hidden on mobile) */}
      <div className="relative hidden overflow-hidden lg:flex lg:w-2/5 lg:flex-col lg:items-center lg:justify-center lg:bg-gradient-to-br lg:from-sage-500 lg:to-sage-700 lg:px-12">
        {/* Floating shapes */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute bottom-20 left-10 h-24 w-24 rotate-45 rounded-lg bg-white/5" />
        <div className="absolute right-1/4 top-1/3 h-16 w-16 rounded-full bg-white/10 animate-float" />
        <div
          className="absolute left-1/4 bottom-1/3 h-12 w-12 rotate-12 rounded-lg bg-white/10 animate-float"
          style={{ animationDelay: '1.5s' }}
        />

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative z-10 text-center"
        >
          <h2 className="font-display text-3xl font-bold leading-tight text-white">
            加入 MedPay
            <br />
            开启健康之旅
          </h2>
          <p className="mt-4 max-w-xs text-base text-white/70">
            开始您的智慧医疗之旅，简单、安全、便捷
          </p>
          <div className="mt-10 flex justify-center gap-2">
            <div className="h-2 w-2 rounded-full bg-white/40" />
            <div className="h-2 w-6 rounded-full bg-white/80" />
            <div className="h-2 w-2 rounded-full bg-white/40" />
          </div>
        </motion.div>
      </div>

      {/* Right side - Register form */}
      <div
        className="relative flex w-full flex-col items-center justify-center px-6 py-12 lg:w-3/5"
        style={{
          backgroundColor: 'var(--ivory-50)',
          backgroundImage: `
            radial-gradient(circle at 80% 50%, rgba(61, 122, 74, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(198, 123, 92, 0.03) 0%, transparent 50%)
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
            <div className="mb-8 text-center">
              <h1 className="font-display text-4xl font-bold text-sage-800">
                MedPay
              </h1>
              <p className="mt-2 text-base text-sage-600">
                医疗商城支付系统
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="姓名"
                icon={User}
                placeholder="请输入姓名"
                value={form.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                error={errors.fullName}
              />

              <Input
                label="用户名"
                icon={User}
                placeholder="请输入用户名"
                value={form.username}
                onChange={(e) => updateField('username', e.target.value)}
                error={errors.username}
                autoComplete="username"
              />

              <Input
                label="手机号"
                icon={Phone}
                placeholder="请输入手机号"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                error={errors.phone}
                type="tel"
              />

              <Input
                label="邮箱（选填）"
                icon={Mail}
                placeholder="请输入邮箱"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                error={errors.email}
                type="email"
              />

              <div className="relative">
                <Input
                  label="密码"
                  icon={Lock}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="请设置密码"
                  value={form.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  error={errors.password}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-sage-400 transition-colors hover:text-sage-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <Input
                label="确认密码"
                icon={Lock}
                type="password"
                placeholder="请确认密码"
                value={form.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                error={errors.confirmPassword}
                autoComplete="new-password"
              />

              <Button
                type="submit"
                loading={loading}
                className="w-full"
                size="lg"
              >
                注册
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-sage-700/60">
              已有账号？{' '}
              <Link
                to="/login"
                className="font-medium text-sage-500 transition-colors hover:text-sage-600"
              >
                去登录
              </Link>
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
