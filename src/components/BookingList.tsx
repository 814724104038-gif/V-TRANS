/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Booking, TransportType } from '../types';
import { Bus, Train, Plane, Calendar, MapPin, XCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

interface BookingListProps {
  bookings: Booking[];
  onCancel?: (bookingId: string) => void;
  isCancelling?: string | null;
}

export const BookingList: React.FC<BookingListProps> = ({ 
  bookings, 
  onCancel,
  isCancelling = null 
}) => {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 font-medium">No bookings found.</p>
        <p className="text-sm text-gray-400">Try saying "Book a bus" to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking, index) => {
        const Icon = booking.transportType === TransportType.BUS ? Bus : 
                     booking.transportType === TransportType.TRAIN ? Train : Plane;
        
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            key={booking.id}
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-3 rounded-xl",
                booking.transportType === TransportType.BUS ? "bg-blue-50 text-blue-600" :
                booking.transportType === TransportType.TRAIN ? "bg-green-50 text-green-600" :
                "bg-purple-50 text-purple-600"
              )}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-gray-900">{booking.transportName}</h4>
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                    booking.status === 'confirmed' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                  )}>
                    {booking.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{booking.from} → {booking.to}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{booking.departure}</span>
                  </div>
                </div>
              </div>
            </div>

            {booking.status === 'confirmed' && onCancel && (
              <button
                onClick={() => onCancel(booking.id)}
                disabled={isCancelling === booking.id}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300"
                title="Cancel Booking"
              >
                {isCancelling === booking.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <XCircle className="w-6 h-6" />
                )}
              </button>
            )}
            
            {booking.status === 'cancelled' && (
              <div className="p-2 text-gray-300">
                <XCircle className="w-6 h-6" />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

const Loader2 = ({ className }: { className?: string }) => (
  <svg
    className={cn("animate-spin", className)}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
