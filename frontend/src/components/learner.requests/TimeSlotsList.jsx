// components/requests/TimeSlotsList.js
import React from 'react';

const TimeSlotsList = ({ timeSlots, selectedTimeSlot }) => {
  // Format helper
  const formatDateTime = (dateString) => {
    const options = { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  return (
    <div className="bg-light p-3 rounded mb-3">
      {timeSlots && timeSlots.length > 0 ? (
        timeSlots.map((slot, index) => (
          <div key={index} className={`mb-2 ${
            selectedTimeSlot && 
            slot.startTime === selectedTimeSlot.startTime && 
            slot.endTime === selectedTimeSlot.endTime
              ? 'p-2 bg-success-subtle rounded' 
              : ''
          }`}>
            <span className={`${
              selectedTimeSlot && 
              slot.startTime === selectedTimeSlot.startTime && 
              slot.endTime === selectedTimeSlot.endTime
                ? 'fw-bold' 
                : ''
            }`}>
              <i className={`bi ${
                selectedTimeSlot && 
                slot.startTime === selectedTimeSlot.startTime && 
                slot.endTime === selectedTimeSlot.endTime
                  ? 'bi-check-circle-fill text-success' 
                  : 'bi-clock'
              } me-2`}></i>
              Option {index + 1}: {formatDateTime(slot.startTime)} - {formatDateTime(slot.endTime)}
              {selectedTimeSlot && 
               slot.startTime === selectedTimeSlot.startTime && 
               slot.endTime === selectedTimeSlot.endTime && 
               <span className="ms-2 text-success">(Selected)</span>}
            </span>
          </div>
        ))
      ) : (
        <p className="mb-0">No time slots proposed</p>
      )}
    </div>
  );
};

export default TimeSlotsList;