import React, { useState, useEffect } from 'react';
import { UserRole, Service, Appointment } from './types';
import { getAllServices, createAppointment, getAvailableTimeSlots, getAppointments, cancelAppointment } from './services/dbService';
import ServiceCard from './components/ServiceCard';
import GeminiAssistant from './components/GeminiAssistant';
import { Calendar, Scissors, Clock, User, Phone, LayoutDashboard, CheckCircle, Trash2, LogOut } from 'lucide-react';

// ---------------------------------------------------------------------------
// MAIN APP COMPONENT
// ---------------------------------------------------------------------------

const App: React.FC = () => {
  // Simple Role Management State
  const [role, setRole] = useState<UserRole>(UserRole.CLIENT);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Header */}
      <header className="bg-stone-900 text-amber-50 shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setRole(UserRole.CLIENT)}>
            <Scissors className="text-amber-500" size={28} />
            <span className="text-2xl font-bold tracking-wide font-serif">LuxeCuts</span>
          </div>
          <nav className="flex gap-4">
            <button 
              onClick={() => setRole(UserRole.CLIENT)}
              className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${role === UserRole.CLIENT ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-white'}`}
            >
              Reservar
            </button>
            <button 
              onClick={() => setRole(UserRole.ADMIN)}
              className={`px-4 py-1 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${role === UserRole.ADMIN ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-white'}`}
            >
              <LayoutDashboard size={14} />
              Admin
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {role === UserRole.CLIENT ? <ClientBookingFlow /> : <AdminDashboard />}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-500 py-8 text-center text-sm border-t border-stone-800">
        <p>&copy; 2024 LuxeCuts Salon. Elegancia en cada corte.</p>
      </footer>
    </div>
  );
};

// ---------------------------------------------------------------------------
// CLIENT BOOKING PAGE
// ---------------------------------------------------------------------------

const ClientBookingFlow: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setServices(getAllServices());
  }, []);

  useEffect(() => {
    if (date && selectedService) {
      setAvailableSlots(getAvailableTimeSlots(date, selectedService.id));
      setTime(''); // Reset time when date changes
    }
  }, [date, selectedService]);

  const handleServiceRecommend = (serviceId: string) => {
    const rec = services.find(s => s.id === serviceId);
    if (rec) {
      setSelectedService(rec);
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !date || !time || !clientName || !clientPhone) return;

    const newAppt: Appointment = {
      id: crypto.randomUUID(),
      clientName,
      clientPhone,
      serviceId: selectedService.id,
      date,
      time,
      status: 'confirmed',
      createdAt: Date.now()
    };

    createAppointment(newAppt);
    setIsSuccess(true);
    setStep(3);
  };

  const resetForm = () => {
    setSelectedService(null);
    setDate('');
    setTime('');
    setClientName('');
    setClientPhone('');
    setIsSuccess(false);
    setStep(1);
  };

  if (isSuccess) {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-8 text-center border border-stone-100">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-stone-800 mb-2 font-serif">¡Cita Confirmada!</h2>
        <p className="text-stone-600 mb-6">
          Gracias, <strong>{clientName}</strong>. Te esperamos el <strong>{date}</strong> a las <strong>{time}</strong> para tu {selectedService?.name}.
        </p>
        <button 
          onClick={resetForm}
          className="bg-stone-900 text-white px-8 py-3 rounded-full font-medium hover:bg-amber-600 transition-colors"
        >
          Reservar otra cita
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-500'}`}>1</div>
          <div className={`h-1 w-16 ${step >= 2 ? 'bg-amber-600' : 'bg-stone-200'}`}></div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-500'}`}>2</div>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Service Selection */}
        <div className={`md:col-span-7 ${step === 2 ? 'hidden md:block opacity-50 pointer-events-none' : ''}`}>
          <h2 className="text-2xl font-bold mb-6 font-serif text-stone-800">Selecciona un Servicio</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {services.map(service => (
              <ServiceCard 
                key={service.id} 
                service={service} 
                isSelected={selectedService?.id === service.id}
                onSelect={(s) => {
                  setSelectedService(s);
                  setStep(2); // Auto advance on desktop, user can click back if needed
                }}
              />
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Date & Details (Visible when Service Selected) */}
        <div className={`md:col-span-5 bg-white p-6 rounded-2xl shadow-lg border border-stone-100 h-fit sticky top-24 ${step === 1 ? 'hidden md:block' : ''}`}>
           {step === 2 && (
             <button onClick={() => setStep(1)} className="md:hidden mb-4 text-stone-500 text-sm hover:text-amber-600">
               &larr; Volver a servicios
             </button>
           )}
           
           <h3 className="text-xl font-bold mb-4 font-serif text-stone-800 border-b pb-2">Tu Reserva</h3>
           
           {!selectedService ? (
             <div className="text-center py-12 text-stone-400">
               <Scissors size={48} className="mx-auto mb-2 opacity-20" />
               <p>Selecciona un servicio para continuar</p>
             </div>
           ) : (
             <form onSubmit={handleSubmit} className="space-y-5">
               <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                 <span className="text-xs text-amber-800 font-bold uppercase tracking-wider">Servicio</span>
                 <div className="font-bold text-stone-800">{selectedService.name}</div>
                 <div className="text-sm text-stone-600">{selectedService.price}€ • {selectedService.durationMinutes} min</div>
               </div>

               <div>
                 <label className="block text-sm font-medium text-stone-700 mb-1 flex items-center gap-2">
                   <Calendar size={16} /> Fecha
                 </label>
                 <input 
                   type="date" 
                   required
                   min={new Date().toISOString().split('T')[0]}
                   value={date}
                   onChange={(e) => setDate(e.target.value)}
                   className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-stone-700 mb-1 flex items-center gap-2">
                   <Clock size={16} /> Hora Disponible
                 </label>
                 {date ? (
                   availableSlots.length > 0 ? (
                     <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                       {availableSlots.map(slot => (
                         <button
                           key={slot}
                           type="button"
                           onClick={() => setTime(slot)}
                           className={`py-2 px-1 text-sm rounded border ${time === slot ? 'bg-amber-600 text-white border-amber-600' : 'bg-white border-stone-200 hover:border-amber-400'}`}
                         >
                           {slot}
                         </button>
                       ))}
                     </div>
                   ) : (
                     <p className="text-red-500 text-sm bg-red-50 p-2 rounded">No hay huecos disponibles este día.</p>
                   )
                 ) : (
                   <p className="text-stone-400 text-sm italic">Selecciona una fecha primero</p>
                 )}
               </div>

               <div className="grid grid-cols-1 gap-4 border-t pt-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1 flex items-center gap-2">
                      <User size={16} /> Nombre Completo
                    </label>
                    <input 
                      type="text" 
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Juan Pérez"
                      className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1 flex items-center gap-2">
                      <Phone size={16} /> Teléfono
                    </label>
                    <input 
                      type="tel" 
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="600 000 000"
                      className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
               </div>

               <button 
                 type="submit" 
                 disabled={!time || !clientName || !clientPhone}
                 className="w-full bg-stone-900 text-white py-3 rounded-lg font-bold hover:bg-amber-600 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors shadow-lg mt-2"
               >
                 Confirmar Cita
               </button>
             </form>
           )}
        </div>
      </div>

      <GeminiAssistant onRecommend={handleServiceRecommend} />
    </div>
  );
};

// ---------------------------------------------------------------------------
// ADMIN DASHBOARD
// ---------------------------------------------------------------------------

const AdminDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filterDate, setFilterDate] = useState<string>('');

  const refreshData = () => {
    const all = getAppointments();
    // Sort by date then time
    all.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });
    setAppointments(all);
  };

  useEffect(() => {
    refreshData();
    // Set today as default filter
    setFilterDate(new Date().toISOString().split('T')[0]);
  }, []);

  const handleCancel = (id: string) => {
    if (confirm('¿Seguro que deseas cancelar esta cita?')) {
      cancelAppointment(id);
      refreshData();
    }
  };

  const filteredAppointments = filterDate 
    ? appointments.filter(a => a.date === filterDate)
    : appointments;

  const getServiceName = (id: string) => {
    const s = getAllServices().find(srv => srv.id === id);
    return s ? s.name : 'Servicio desconocido';
  };

  // Simple stats
  const todayStats = {
    total: filteredAppointments.length,
    active: filteredAppointments.filter(a => a.status !== 'cancelled').length,
    cancelled: filteredAppointments.filter(a => a.status === 'cancelled').length
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold font-serif text-stone-800">Panel de Gestión</h2>
          <p className="text-stone-500">Administra las citas y agenda del salón.</p>
        </div>
        <div className="bg-white p-2 rounded-lg shadow-sm border flex items-center gap-2">
           <Calendar className="text-stone-400" size={20} />
           <input 
             type="date" 
             value={filterDate}
             onChange={(e) => setFilterDate(e.target.value)}
             className="outline-none text-stone-700 font-medium"
           />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200">
          <div className="text-stone-500 text-xs uppercase font-bold tracking-wider">Citas Totales</div>
          <div className="text-3xl font-bold text-stone-800">{todayStats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100">
          <div className="text-green-600 text-xs uppercase font-bold tracking-wider">Activas</div>
          <div className="text-3xl font-bold text-green-700">{todayStats.active}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-red-100">
          <div className="text-red-500 text-xs uppercase font-bold tracking-wider">Canceladas</div>
          <div className="text-3xl font-bold text-red-700">{todayStats.cancelled}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="p-4 font-bold text-stone-600 text-sm">Hora</th>
                <th className="p-4 font-bold text-stone-600 text-sm">Cliente</th>
                <th className="p-4 font-bold text-stone-600 text-sm">Servicio</th>
                <th className="p-4 font-bold text-stone-600 text-sm">Teléfono</th>
                <th className="p-4 font-bold text-stone-600 text-sm">Estado</th>
                <th className="p-4 font-bold text-stone-600 text-sm text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-400 italic">
                    No hay citas programadas para este día.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map(appt => (
                  <tr key={appt.id} className={`hover:bg-stone-50 transition-colors ${appt.status === 'cancelled' ? 'bg-stone-50 opacity-60' : ''}`}>
                    <td className="p-4 font-mono text-stone-800 font-bold">{appt.time}</td>
                    <td className="p-4 font-medium text-stone-800">{appt.clientName}</td>
                    <td className="p-4 text-stone-600">{getServiceName(appt.serviceId)}</td>
                    <td className="p-4 text-stone-500 text-sm">{appt.clientPhone}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        appt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        appt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {appt.status === 'confirmed' ? 'Confirmada' : appt.status === 'cancelled' ? 'Cancelada' : 'Completada'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {appt.status !== 'cancelled' && (
                        <button 
                          onClick={() => handleCancel(appt.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors"
                          title="Cancelar Cita"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default App;