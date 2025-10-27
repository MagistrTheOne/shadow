import { redirect } from "next/navigation";

const DashboardPage = () => {
  // Редиректим на корневой роут, где находится дашборд
  redirect("/");
};

export default DashboardPage;
