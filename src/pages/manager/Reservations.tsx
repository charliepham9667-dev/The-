import { useState } from 'react';
import { 
  Calendar, 
  Plus, 
  Search, 
  Users, 
  Phone, 
  Mail,
  Clock,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Check,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { 
  useReservations, 
  useCreateReservation, 
  useUpdateReservationStatus,
  useDeleteReservation 
} from '../../hooks/useReservations';
import type { Reservation, ReservationStatus, CreateReservationInput } from '../../types';

const statusConfig: Record<ReservationStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-warning', bg: 'bg-warning/20' },
  confirmed: { label: 'Confirmed', color: 'text-success', bg: 'bg-success/20' },
  seated: { label: 'Seated', color: 'text-info', bg: 'bg-info/20' },
  completed: { label: 'Completed', color: 'text-muted-foreground', bg: 'bg-muted' },
  no_show: { label: 'No Show', color: 'text-error', bg: 'bg-error/20' },
  cancelled: { label: 'Cancelled', color: 'text-muted-foreground', bg: 'bg-muted/50' },
};

export function Reservations() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'all'>('all');

  const dateStr = selectedDate.toISOString().split('T')[0];
  const { data: reservations, isLoading } = useReservations(dateStr, dateStr);

  const filteredReservations = reservations?.filter(r => {
    const matchesSearch = !searchQuery || 
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerPhone?.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const navigateDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const isToday = dateStr === new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Reservations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage customer bookings and table assignments
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Reservation
        </button>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
        <button
          onClick={() => navigateDate(-1)}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          {isToday && (
            <span className="text-xs text-primary">Today</span>
          )}
        </div>
        <button
          onClick={() => navigateDate(1)}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ReservationStatus | 'all')}
          className="rounded-lg border border-border bg-card px-4 py-2 text-foreground focus:border-ring focus:outline-none"
        >
          <option value="all">All Status</option>
          {Object.entries(statusConfig).map(([value, config]) => (
            <option key={value} value={value}>{config.label}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg bg-card border border-border p-3">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-xl font-bold text-foreground">{reservations?.length || 0}</p>
        </div>
        <div className="rounded-lg bg-card border border-border p-3">
          <p className="text-xs text-muted-foreground">Confirmed</p>
          <p className="text-xl font-bold text-success">
            {reservations?.filter(r => r.status === 'confirmed').length || 0}
          </p>
        </div>
        <div className="rounded-lg bg-card border border-border p-3">
          <p className="text-xs text-muted-foreground">Expected Guests</p>
          <p className="text-xl font-bold text-info">
            {reservations?.filter(r => ['pending', 'confirmed'].includes(r.status))
              .reduce((sum, r) => sum + r.partySize, 0) || 0}
          </p>
        </div>
        <div className="rounded-lg bg-card border border-border p-3">
          <p className="text-xs text-muted-foreground">Seated</p>
          <p className="text-xl font-bold text-purple-400">
            {reservations?.filter(r => r.status === 'seated').length || 0}
          </p>
        </div>
      </div>

      {/* Reservations List */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Calendar className="h-8 w-8 mb-2" />
            <p>No reservations for this date</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredReservations.map((reservation) => (
              <ReservationRow key={reservation.id} reservation={reservation} />
            ))}
          </div>
        )}
      </div>

      {/* New Reservation Modal */}
      {showForm && (
        <ReservationForm 
          onClose={() => setShowForm(false)} 
          defaultDate={dateStr}
        />
      )}
    </div>
  );
}

function ReservationRow({ reservation }: { reservation: Reservation }) {
  const [showActions, setShowActions] = useState(false);
  const updateStatus = useUpdateReservationStatus();
  const deleteReservation = useDeleteReservation();

  const config = statusConfig[reservation.status];

  const handleStatusChange = (status: ReservationStatus) => {
    updateStatus.mutate({ id: reservation.id, status });
    setShowActions(false);
  };

  return (
    <div className="p-4 hover:bg-muted/30 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium text-foreground">{reservation.customerName}</h3>
            <span className={`rounded-full px-2 py-0.5 text-xs ${config.bg} ${config.color}`}>
              {config.label}
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {reservation.reservationTime}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {reservation.partySize} guests
            </span>
            {reservation.customerPhone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                {reservation.customerPhone}
              </span>
            )}
          </div>

          {(reservation.tablePreference || reservation.specialRequests) && (
            <p className="text-xs text-muted-foreground mt-2">
              {reservation.tablePreference && <span>📍 {reservation.tablePreference}</span>}
              {reservation.tablePreference && reservation.specialRequests && ' • '}
              {reservation.specialRequests && <span>📝 {reservation.specialRequests}</span>}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {showActions && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowActions(false)} 
              />
              <div className="absolute right-0 top-full mt-1 z-20 w-40 rounded-lg border border-border bg-card shadow-lg py-1">
                {reservation.status === 'confirmed' && (
                  <button
                    onClick={() => handleStatusChange('seated')}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground/80 hover:bg-muted text-left"
                  >
                    <Check className="h-4 w-4 text-info" />
                    Mark Seated
                  </button>
                )}
                {reservation.status === 'seated' && (
                  <button
                    onClick={() => handleStatusChange('completed')}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground/80 hover:bg-muted text-left"
                  >
                    <Check className="h-4 w-4 text-success" />
                    Complete
                  </button>
                )}
                {['pending', 'confirmed'].includes(reservation.status) && (
                  <>
                    <button
                      onClick={() => handleStatusChange('no_show')}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground/80 hover:bg-muted text-left"
                    >
                      <AlertCircle className="h-4 w-4 text-error" />
                      No Show
                    </button>
                    <button
                      onClick={() => handleStatusChange('cancelled')}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground/80 hover:bg-muted text-left"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                      Cancel
                    </button>
                  </>
                )}
                <hr className="my-1 border-border" />
                <button
                  onClick={() => {
                    deleteReservation.mutate(reservation.id);
                    setShowActions(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-error hover:bg-error/10 text-left"
                >
                  <X className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface ReservationFormProps {
  onClose: () => void;
  defaultDate: string;
}

function ReservationForm({ onClose, defaultDate }: ReservationFormProps) {
  const [formData, setFormData] = useState<CreateReservationInput>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    reservationDate: defaultDate,
    reservationTime: '19:00',
    partySize: 2,
    tablePreference: '',
    specialRequests: '',
    source: 'phone',
  });
  const [error, setError] = useState<string | null>(null);

  const createReservation = useCreateReservation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.customerName.trim()) {
      setError('Customer name is required');
      return;
    }

    try {
      await createReservation.mutateAsync(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create reservation');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">New Reservation</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground/80 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData(f => ({ ...f, customerName: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-ring focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData(f => ({ ...f, customerPhone: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-ring focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Email</label>
              <input
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData(f => ({ ...f, customerEmail: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-ring focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Date *</label>
              <input
                type="date"
                value={formData.reservationDate}
                onChange={(e) => setFormData(f => ({ ...f, reservationDate: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-ring focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Time *</label>
              <input
                type="time"
                value={formData.reservationTime}
                onChange={(e) => setFormData(f => ({ ...f, reservationTime: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-ring focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Party Size *</label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.partySize}
                onChange={(e) => setFormData(f => ({ ...f, partySize: parseInt(e.target.value) || 1 }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-ring focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Table Preference</label>
              <input
                type="text"
                value={formData.tablePreference}
                onChange={(e) => setFormData(f => ({ ...f, tablePreference: e.target.value }))}
                placeholder="e.g., VIP booth, terrace"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground/80 mb-1">Special Requests</label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) => setFormData(f => ({ ...f, specialRequests: e.target.value }))}
                placeholder="e.g., Birthday celebration, dietary restrictions"
                rows={2}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none resize-none"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-error">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createReservation.isPending}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createReservation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Reservation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
