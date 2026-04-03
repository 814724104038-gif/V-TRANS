/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum TransportType {
  BUS = 'bus',
  TRAIN = 'train',
  FLIGHT = 'flight',
}

export interface Transport {
  id: string;
  name: string;
  type: TransportType;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  price: number;
  availableSeats: number;
}

export interface Booking {
  id: string;
  userId: string;
  transportId: string;
  transportName: string;
  transportType: TransportType;
  from: string;
  to: string;
  departure: string;
  bookingDate: string;
  status: 'confirmed' | 'cancelled';
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
}
