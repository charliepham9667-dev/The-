import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { ShiftCalendar } from '../../components/staffing/ShiftCalendar';
import { ShiftModal } from '../../components/staffing/ShiftModal';
import { useShifts } from '../../hooks/useShifts';

export function Staffing() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<string | null>(null);

  const { data: shifts, isLoading } = useShifts(selectedDate);

  // Get week start (Monday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const weekStart = getWeekStart(selectedDate);
  
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedDate(newDate);
  };

  const formatWeekRange = () => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${weekStart.toLocaleDateString('en-US', options)} - ${weekEnd.toLocaleDateString('en-US', options)}, ${weekEnd.getFullYear()}`;
  };

  const handleEditShift = (shiftId: string) => {
    setEditingShift(shiftId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingShift(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Staffing & Team</h1>
          <p className="text-sm text-slate-400 mt-1">Manage shifts and team schedules</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-[#ff6b35] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#e55a2b] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Shift
        </button>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between rounded-xl border border-[#374151] bg-[#1a1f2e] p-4">
        <button
          onClick={() => navigateWeek('prev')}
          className="rounded-lg p-2 text-slate-400 hover:bg-[#374151] hover:text-white transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <p className="text-lg font-semibold text-white">{formatWeekRange()}</p>
          <button
            onClick={() => setSelectedDate(new Date())}
            className="text-sm text-[#ff6b35] hover:underline"
          >
            Today
          </button>
        </div>
        <button
          onClick={() => navigateWeek('next')}
          className="rounded-lg p-2 text-slate-400 hover:bg-[#374151] hover:text-white transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Calendar */}
      <ShiftCalendar
        weekStart={weekStart}
        shifts={shifts || []}
        isLoading={isLoading}
        onEditShift={handleEditShift}
      />

      {/* Modal */}
      {isModalOpen && (
        <ShiftModal
          shiftId={editingShift}
          defaultDate={selectedDate}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
