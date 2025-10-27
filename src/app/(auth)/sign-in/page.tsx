export const dynamic = 'force-dynamic';

import { auth } from "@/lib/auth";
import { SignInView } from "@/modules/auth/ui/views/sign-in-view";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const Page = async () => {
  try {
const session = await auth.api.getSession({
        headers: await headers(),
      });
    
    if (!!session) {
      redirect("/dashboard");
      }
    
    return <SignInView />;
  } catch (error) {
    // Проверяем, является ли это редиректом
    if (error && typeof error === 'object' && 'digest' in error && 
        typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
      // Это редирект, не логируем как ошибку
      throw error;
    }
    
    console.error("Auth session error:", error);
    // Если есть проблемы с базой данных, все равно показываем форму входа
    return <SignInView />;
}
};
 
export default Page;