/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Transport, TransportType } from '../types';
import { Plus, Trash2, Edit2, Bus, Train, Plane, Save, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface AdminDashboardProps {
  transports: Transport[];
  onAdd: (transport: Omit<Transport, 'id'>) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, transport: Partial<Transport>) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  transports,
  onAdd,
  onDelete,
  onUpdate
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTransport, setNewTransport] = useState<Omit<Transport, 'id'>>({
    name: '',
    type: TransportType.BUS,
    from: '',
    to: '',
    departure: '',
    arrival: '',
    price: 0,
    availableSeats: 40
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(newTransport);
    setIsAdding(false);
    setNewTransport({
      name: '',
      type: TransportType.BUS,
      from: '',
      to: '',
      departure: '',
      arrival: '',
      price: 0,
      availableSeats: 40
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
      <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Admin Dashboard</h2>
          <p className="text-sm text-gray-500">Manage transport services and schedules</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100"
        >
          {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isAdding ? "Cancel" : "Add Transport"}
        </button>
      </div>

      <div className="p-8">
        {isAdding && (
          <form onSubmit={handleSubmit} className="mb-12 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Name</label>
              <input
                required
                type="text"
                placeholder="Bus Name"
                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={newTransport.name}
                onChange={e => setNewTransport({ ...newTransport, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Type</label>
              <select
                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={newTransport.type}
                onChange={e => setNewTransport({ ...newTransport, type: e.target.value as TransportType })}
              >
                <option value={TransportType.BUS}>Bus</option>
                <option value={TransportType.TRAIN}>Train</option>
                <option value={TransportType.FLIGHT}>Flight</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">From</label>
              <input
                required
                type="text"
                placeholder="Origin"
                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={newTransport.from}
                onChange={e => setNewTransport({ ...newTransport, from: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">To</label>
              <input
                required
                type="text"
                placeholder="Destination"
                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={newTransport.to}
                onChange={e => setNewTransport({ ...newTransport, to: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Departure</label>
              <input
                required
                type="text"
                placeholder="e.g. 10:00 AM"
                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={newTransport.departure}
                onChange={e => setNewTransport({ ...newTransport, departure: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Price (₹)</label>
              <input
                required
                type="number"
                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={newTransport.price}
                onChange={e => setNewTransport({ ...newTransport, price: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Seats</label>
              <input
                required
                type="number"
                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={newTransport.availableSeats}
                onChange={e => setNewTransport({ ...newTransport, availableSeats: parseInt(e.target.value) })}
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-green-600 text-white p-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100"
              >
                Save Transport
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                <th className="pb-4 px-4">Transport</th>
                <th className="pb-4 px-4">Route</th>
                <th className="pb-4 px-4">Departure</th>
                <th className="pb-4 px-4">Price</th>
                <th className="pb-4 px-4">Seats</th>
                <th className="pb-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              {transports.map(t => (
                <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-all">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {t.type === TransportType.BUS ? <Bus className="w-4 h-4" /> : 
                         t.type === TransportType.TRAIN ? <Train className="w-4 h-4" /> : <Plane className="w-4 h-4" />}
                      </div>
                      <span className="font-bold text-gray-900">{t.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">{t.from} → {t.to}</td>
                  <td className="py-4 px-4">{t.departure}</td>
                  <td className="py-4 px-4 font-bold text-blue-600">₹{t.price}</td>
                  <td className="py-4 px-4">{t.availableSeats}</td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => onDelete(t.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
