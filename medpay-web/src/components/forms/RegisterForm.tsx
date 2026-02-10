import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { UserPlus, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { registerSchema } from '@/lib/validators';
import type { RegisterFormValues } from '@/lib/validators';
import { cn } from '@/lib/utils';

interface RegisterFormProps {
  onSubmit: (data: RegisterFormValues) => Promise<void>;
  className?: string;
}

export default function RegisterForm({ onSubmit, className }: RegisterFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      phone: '',
      password: '',
      fullName: '',
      gender: '',
      email: '',
    },
  });

  const handleFormSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (hasError: boolean) =>
    cn(
      'w-full rounded-md border bg-white px-3 py-2.5 text-sm text-gray-800',
      'placeholder:text-gray-400 transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-sage-500/20 focus:border-sage-400',
      hasError ? 'border-red-300' : 'border-ivory-200',
    );

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
          创建账户
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          注册 MedPay 账户
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="reg-fullName" className="mb-1.5 block text-sm font-medium text-gray-700">
            姓名 <span className="text-red-400">*</span>
          </label>
          <input
            id="reg-fullName"
            type="text"
            {...register('fullName')}
            className={inputCls(!!errors.fullName)}
            placeholder="请输入姓名"
          />
          {errors.fullName && (
            <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>
          )}
        </div>

        {/* Username */}
        <div>
          <label htmlFor="reg-username" className="mb-1.5 block text-sm font-medium text-gray-700">
            用户名 <span className="text-red-400">*</span>
          </label>
          <input
            id="reg-username"
            type="text"
            autoComplete="username"
            {...register('username')}
            className={inputCls(!!errors.username)}
            placeholder="请输入用户名"
          />
          {errors.username && (
            <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="reg-phone" className="mb-1.5 block text-sm font-medium text-gray-700">
            手机号 <span className="text-red-400">*</span>
          </label>
          <input
            id="reg-phone"
            type="tel"
            {...register('phone')}
            className={inputCls(!!errors.phone)}
            placeholder="请输入手机号"
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="reg-password" className="mb-1.5 block text-sm font-medium text-gray-700">
            密码 <span className="text-red-400">*</span>
          </label>
          <input
            id="reg-password"
            type="password"
            autoComplete="new-password"
            {...register('password')}
            className={inputCls(!!errors.password)}
            placeholder="请输入密码（至少6位）"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Gender */}
        <div>
          <label htmlFor="reg-gender" className="mb-1.5 block text-sm font-medium text-gray-700">
            性别
          </label>
          <select
            id="reg-gender"
            {...register('gender')}
            className={inputCls(!!errors.gender)}
          >
            <option value="">请选择</option>
            <option value="M">男</option>
            <option value="F">女</option>
          </select>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="reg-email" className="mb-1.5 block text-sm font-medium text-gray-700">
            邮箱
          </label>
          <input
            id="reg-email"
            type="email"
            {...register('email')}
            className={inputCls(!!errors.email)}
            placeholder="请输入邮箱（可选）"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
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
            <UserPlus className="h-4 w-4" />
          )}
          {loading ? '注册中...' : '注册'}
        </button>
      </form>
    </motion.div>
  );
}
