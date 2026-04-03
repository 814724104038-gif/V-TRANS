/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db, collection, addDoc, getDocs } from '../firebase';
import { TransportType } from '../types';

const sampleTransports = [
  {
    name: "Express Bus 101",
    type: TransportType.BUS,
    from: "Chennai",
    to: "Bangalore",
    departure: "08:00 AM",
    arrival: "02:00 PM",
    price: 850,
    availableSeats: 32
  },
  {
    name: "City Shuttle",
    type: TransportType.BUS,
    from: "Chennai",
    to: "Madurai",
    departure: "10:30 AM",
    arrival: "06:30 PM",
    price: 650,
    availableSeats: 15
  },
  {
    name: "Shatabdi Express",
    type: TransportType.TRAIN,
    from: "Chennai",
    to: "Coimbatore",
    departure: "07:15 AM",
    arrival: "02:15 PM",
    price: 1200,
    availableSeats: 120
  },
  {
    name: "Indigo 6E-245",
    type: TransportType.FLIGHT,
    from: "Chennai",
    to: "Delhi",
    departure: "09:00 PM",
    arrival: "11:45 PM",
    price: 4500,
    availableSeats: 45
  }
];

export const seedInitialData = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'transports'));
    if (snapshot.empty) {
      console.log("Seeding initial transport data...");
      for (const transport of sampleTransports) {
        await addDoc(collection(db, 'transports'), transport);
      }
      console.log("Seeding complete!");
    }
  } catch (error) {
    console.error("Error seeding data:", error);
  }
};
