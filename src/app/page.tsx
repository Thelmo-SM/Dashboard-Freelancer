import Dashboard from "@/components/Dashboard";
import Visitors from "@/components/Visitors";
import SolicitudServicios from "@/components/SolicitudServicios";
import Cotizaciones from "@/components/Cotizaciones";
import Emails from "@/components/Emails";
import DashboardLayout from "@/components/DashboardLayout";


export default function Home() {
  return (
    <section className="">
      <DashboardLayout>
        <Dashboard />
        <Visitors />
        <SolicitudServicios />
        <Cotizaciones />
        <Emails />
      </DashboardLayout>
    </section>
  );
}

