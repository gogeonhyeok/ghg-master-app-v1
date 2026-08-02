"use client"

import React from 'react';

const NearbyRestaurants = () => {
  const restaurants = [
    { name: "Restaurant A", type: "Hawker Center" },
    { name: "Restaurant B", type: "Restaurant" },
    { name: "Restaurant C", type: "Hawker Center" },
    { name: "Restaurant D", type: "Restaurant" },
  ];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Nearby Restaurants and Hawker Centers</h2>
      <ul className="list-disc pl-5 space-y-2">
        {restaurants.map((restaurant, index) => (
          <li key={index} className="text-lg">
            <span className="font-semibold">{restaurant.name}</span> - {restaurant.type}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NearbyRestaurants;
