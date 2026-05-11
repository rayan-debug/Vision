'use client';
import { useState } from 'react';
import type { Locale } from '@roua/db';

const COPY: Record<
  Locale,
  { name: string; email: string; message: string; send: string; sent: string; error: string; sending: string }
> = {
  en: {
    name: 'Your name',
    email: 'Email',
    message: 'Tell me about your project',
    send: 'Send brief →',
    sent: 'Thanks — message received. I’ll reply within two working days.',
    error: 'Something went wrong. Try again or email directly.',
    sending: 'Sending…',
  },
  ar: {
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    message: 'حدّثني عن مشروعك',
    send: 'إرسال الملخّص →',
    sent: 'شكراً — استلمت رسالتك. سأرد خلال يومَي عمل.',
    error: 'حدث خطأ. حاول مجدّداً أو راسلني مباشرة عبر البريد.',
    sending: 'جارٍ الإرسال…',
  },
};

export function ContactForm({ locale }: { locale: Locale }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const copy = COPY[locale];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('sending');
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          message: form.get('message'),
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      setState(res.ok ? 'sent' : 'error');
    } catch {
      setState('error');
    }
  }

  if (state === 'sent') {
    return (
      <p className="text-accent font-display text-2xl py-12" data-reveal>
        {copy.sent}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" data-reveal>
      <Field name="name" label={copy.name} required />
      <Field name="email" label={copy.email} type="email" required />
      <Field name="message" label={copy.message} multiline required />
      <button
        type="submit"
        disabled={state === 'sending'}
        className="px-8 py-4 bg-accent text-ink uppercase tracking-widest text-sm hover:bg-accent-light disabled:opacity-60 transition-colors"
      >
        {state === 'sending' ? copy.sending : copy.send}
      </button>
      {state === 'error' && <p className="text-red-400 text-sm">{copy.error}</p>}
    </form>
  );
}

function Field({
  name,
  label,
  type = 'text',
  required,
  multiline,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  multiline?: boolean;
}) {
  const cls =
    'w-full bg-transparent border-b border-bone/30 focus:border-accent outline-none py-3 text-bone placeholder:text-bone/40 transition-colors';
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-widest text-bone/50 mb-2">{label}</span>
      {multiline ? (
        <textarea name={name} required={required} rows={4} className={cls} />
      ) : (
        <input name={name} type={type} required={required} className={cls} />
      )}
    </label>
  );
}
