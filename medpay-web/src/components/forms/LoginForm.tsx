import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { LogIn, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { loginSchema } from '@/lib/validators';
import type { LoginFormValues } from '@/lib/validators';
import { cn } from '@/lib/utils';

interface LoginFormProps {
  onSubmit: (data: LoginFormValues) => Promise<void>;
  className?: string;
}

export default function LoginForm({ onSubmit, className }: LoginFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const handleFormSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'w-full max-w-md rounded-xl bg-white/80 backdrop-blur-sm',
        'border border-ivory-200/60 shadow-lg p-8',
        className,
      )}
    >
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 font-display">
          欢迎回来
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          登录您的 MedPay 账户
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        {/* Username */}
        <div>
          <label
            htmlFor="login-username"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            用户名
          </label>
          <input
            id="login-username"
            type="text"
            autoComplete="username"
            {...register('username')}
            className={cn(
              'w-full rounded-md border bg-white px-3 py-2.5 text-sm text-gray-800',
              'placeholder:text-gray-400 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-400',
              errors.username ? 'border-red-300' : 'border-ivory-200',
            )}
            placeholder="请输入用户名"
          />
          {errors.username && (
            <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="login-password"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            密码
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            className={cn(
              'w-full rounded-md border bg-white px-3 py-2.5 text-sm text-gray-800',
              'placeholder:text-gray-400 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-400',
              errors.password ? 'border-red-300' : 'border-ivory-200',
            )}
            placeholder="请输入密码"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5',
            'bg-sage-500 text-white font-medium text-sm',
            'hover:bg-sage-600 active:bg-sage-700 transition-colors',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            'focus:outline-none focus:ring-2 focus:ring-sage-500/40 focus:ring-offset-2',
          )}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogIn className="h-4 w-4" />
          )}
          {loading ? '登录中...' : '登录'}
        </button>
      </form>
    </motion.div>
  );
}
