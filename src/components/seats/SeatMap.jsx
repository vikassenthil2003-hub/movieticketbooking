import React from 'react';
import ScreenIndicator from './ScreenIndicator';

const SeatMap = ({ layout = [], selectedSeats = [], onToggleSeat }) => {
  // Check if seat is selected
  const isSelected = (seatNumber) => selectedSeats.some((s) => s.seatNumber === seatNumber);

  return (
    <div className="w-full select-none flex flex-col items-center">
      {/* Screen Indicator */}
      <ScreenIndicator />

      {/* Seat Rows Container */}
      <div className="w-full max-w-3xl overflow-x-auto py-6 px-2 flex flex-col items-center gap-3">
        {layout.map((row) => (
          <div key={row.rowLabel} className="flex items-center gap-3 min-w-max">
            {/* Left Row Label */}
            <span className="w-6 text-center text-xs font-bold text-slate-400">
              {row.rowLabel}
            </span>

            {/* Seats Grid */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {row.seats.map((seat) => {
                const selected = isSelected(seat.seatNumber);
                const isLocked = seat.status === 'locked';
                const isBooked = seat.status === 'booked';
                const isAvailable = seat.status === 'available' || seat.status === 'locked_by_me';

                let seatClass = 'seat-item ';
                if (selected) {
                  seatClass += 'seat-selected';
                } else if (isBooked) {
                  seatClass += 'seat-booked';
                } else if (isLocked) {
                  seatClass += 'seat-locked';
                } else {
                  // Category styling
                  if (seat.category === 'Recliner') seatClass += 'seat-available-recliner';
                  else if (seat.category === 'Premium') seatClass += 'seat-available-premium';
                  else seatClass += 'seat-available-standard';
                }

                return (
                  <React.Fragment key={seat.seatNumber}>
                    <button
                      type="button"
                      disabled={isBooked || (isLocked && !selected)}
                      onClick={() => onToggleSeat(seat)}
                      className={seatClass}
                      title={`${seat.seatNumber} — ${seat.category} (₹${seat.price}) - ${seat.status}`}
                    >
                      {seat.seatNumber.slice(1)}
                    </button>
                    {/* Add visual aisle gap */}
                    {seat.isAisle && <div className="w-4 sm:w-6" />}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Right Row Label */}
            <span className="w-6 text-center text-xs font-bold text-slate-400">
              {row.rowLabel}
            </span>
          </div>
        ))}
      </div>

      {/* Seat Legend */}
      <div className="mt-8 pt-6 border-t border-white/10 w-full max-w-2xl flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <div className="seat-item seat-available-standard scale-90" />
          <span>Standard</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="seat-item seat-available-premium scale-90" />
          <span>Premium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="seat-item seat-available-recliner scale-90" />
          <span>Recliner</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="seat-item seat-selected scale-90" />
          <span className="font-semibold text-emerald-400">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="seat-item seat-locked scale-90" />
          <span className="text-orange-400">Locked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="seat-item seat-booked scale-90" />
          <span className="text-slate-500">Booked</span>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
