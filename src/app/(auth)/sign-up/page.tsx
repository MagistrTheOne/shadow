
import { auth } from "@/lib/auth";
import { SignUpView } from "@/modules/auth/ui/views/sign-up-view";
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

    return <SignUpView />;
  } catch (error) {
    // Проверяем, является ли это редиректом
    if (error && typeof error === 'object' && 'digest' in error && 
        typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
      // Это редирект, не логируем как ошибку
      throw error;
    }
    
    console.error("Auth session error:", error);
    // Если есть проблемы с базой данных, все равно показываем форму регистрации
    return <SignUpView />;
  }
};
 
export default Page;