import React from "react";
import SelectFromList from "./SelectFromList";

/**
 * Wrapper component for apartment selection that automatically includes tenant names
 * @param {Array} apartments - Array of apartment objects
 * @param {Array} users - Array of user objects
 * @param {Function} onSave - Callback when apartments are selected
 * @param {String} label - Optional label for the selection modal
 */
export default function ApartmentSelection({ 
  apartments = [], 
  users = [], 
  onSave, 
  label = "Seleccionar Apartamentos" 
}) {
  // Build labels with tenant names
  const aptLabels = {};
  const aptValues = [];
  
  apartments.forEach((apt) => {
    const tenantName = users.find(u => u.id === apt.tenant?.id)?.name || 'Sin inquilino';
    aptLabels[apt.name] = `${apt.name} - ${tenantName}`;
    aptValues.push(apt.name);
  });
  
  return (
    <SelectFromList
      label={label}
      onSave={onSave}
      list={aptValues}
      labels={aptLabels}
    />
  );
}