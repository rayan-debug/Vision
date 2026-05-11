import { redirect } from 'next/navigation';
import { getLocaleFromHeaders } from '@/lib/locale';

export default async function Root() {
  const locale = await getLocaleFromHeaders();
  redirect(`/${locale}`);
}
