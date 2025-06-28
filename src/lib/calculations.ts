// CO2 Emission Factors based on IPCC Guidelines and Indian Standards
// All factors are in kg CO2e per unit

export interface EmissionFactor {
  value: number;
  unit: string;
  source: string;
  description: string;
}

export const EMISSION_FACTORS: Record<string, EmissionFactor> = {
  // Fuel Combustion
  diesel: {
    value: 2.65,
    unit: 'kg CO2e/litre',
    source: 'IPCC 2006 Guidelines',
    description: 'Diesel fuel combustion in stationary equipment'
  },
  petrol: {
    value: 2.31,
    unit: 'kg CO2e/litre',
    source: 'IPCC 2006 Guidelines',
    description: 'Petrol fuel combustion'
  },
  coal: {
    value: 2.42,
    unit: 'kg CO2e/kg',
    source: 'IPCC 2006 Guidelines',
    description: 'Coal combustion (bituminous)'
  },
  lpg: {
    value: 2.98,
    unit: 'kg CO2e/kg',
    source: 'IPCC 2006 Guidelines',
    description: 'Liquefied Petroleum Gas'
  },
  cng: {
    value: 2.16,
    unit: 'kg CO2e/kg',
    source: 'IPCC 2006 Guidelines',
    description: 'Compressed Natural Gas'
  },

  // Electricity (Grid Mix - India)
  electricity: {
    value: 0.82,
    unit: 'kg CO2e/kWh',
    source: 'CEA 2023',
    description: 'Indian grid electricity mix'
  },
  solar: {
    value: 0.045,
    unit: 'kg CO2e/kWh',
    source: 'IPCC 2014',
    description: 'Solar PV electricity generation'
  },
  wind: {
    value: 0.011,
    unit: 'kg CO2e/kWh',
    source: 'IPCC 2014',
    description: 'Wind electricity generation'
  },

  // Transport
  transport_diesel: {
    value: 0.166,
    unit: 'kg CO2e/km',
    source: 'ARAI 2023',
    description: 'Diesel vehicle transport (heavy truck)'
  },
  transport_petrol: {
    value: 0.142,
    unit: 'kg CO2e/km',
    source: 'ARAI 2023',
    description: 'Petrol vehicle transport (light vehicle)'
  },
  transport_electric: {
    value: 0.082,
    unit: 'kg CO2e/km',
    source: 'ARAI 2023',
    description: 'Electric vehicle transport (grid charged)'
  },

  // Equipment and Machinery
  excavator_diesel: {
    value: 3.15,
    unit: 'kg CO2e/hour',
    source: 'Caterpillar 2023',
    description: 'Heavy excavator operation'
  },
  bulldozer_diesel: {
    value: 4.25,
    unit: 'kg CO2e/hour',
    source: 'Caterpillar 2023',
    description: 'Bulldozer operation'
  },
  haul_truck_diesel: {
    value: 8.75,
    unit: 'kg CO2e/hour',
    source: 'Caterpillar 2023',
    description: 'Heavy haul truck operation'
  },

  // Refrigerants and Chemicals
  r134a: {
    value: 1430,
    unit: 'kg CO2e/kg',
    source: 'IPCC 2006 Guidelines',
    description: 'R134a refrigerant (GWP = 1430)'
  },
  r404a: {
    value: 3922,
    unit: 'kg CO2e/kg',
    source: 'IPCC 2006 Guidelines',
    description: 'R404a refrigerant (GWP = 3922)'
  },

  // Waste
  waste_landfill: {
    value: 0.5,
    unit: 'kg CO2e/kg',
    source: 'IPCC 2006 Guidelines',
    description: 'Municipal solid waste to landfill'
  },
  waste_incineration: {
    value: 0.8,
    unit: 'kg CO2e/kg',
    source: 'IPCC 2006 Guidelines',
    description: 'Waste incineration'
  }
};

// Carbon Sink Factors
export const CARBON_SINK_FACTORS: Record<string, EmissionFactor> = {
  tree_plantation: {
    value: 0.025,
    unit: 'tonnes CO2e/tree/year',
    source: 'Forest Research Institute India',
    description: 'Native tree species carbon sequestration'
  },
  solar_installation: {
    value: 0.82,
    unit: 'kg CO2e/kWh',
    source: 'CEA 2023',
    description: 'CO2 avoided by solar electricity generation'
  },
  wind_installation: {
    value: 0.82,
    unit: 'kg CO2e/kWh',
    source: 'CEA 2023',
    description: 'CO2 avoided by wind electricity generation'
  },
  energy_efficiency: {
    value: 0.82,
    unit: 'kg CO2e/kWh',
    source: 'CEA 2023',
    description: 'CO2 avoided through energy efficiency'
  }
};

// Calculation Functions
export const calculateCO2Emission = (
  activityType: string,
  quantity: number,
  customFactor?: number
): number => {
  const factor = customFactor || EMISSION_FACTORS[activityType]?.value;
  
  if (!factor) {
    throw new Error(`No emission factor found for activity type: ${activityType}`);
  }
  
  return quantity * factor;
};

export const calculateCarbonSink = (
  sinkType: string,
  quantity: number,
  customFactor?: number
): number => {
  const factor = customFactor || CARBON_SINK_FACTORS[sinkType]?.value;
  
  if (!factor) {
    throw new Error(`No carbon sink factor found for sink type: ${sinkType}`);
  }
  
  return quantity * factor;
};

// Utility Functions
export const formatCO2Value = (value: number): string => {
  const kg = value.toFixed(2);
  const tonnes = (value / 1000).toFixed(2);
  return `${kg} kg CO₂e (${tonnes} tonnes CO₂e)`;
};

export const formatCO2Tonnes = (value: number): string => {
  return `${(value / 1000).toFixed(2)} tonnes CO₂e`;
};

export const calculateReductionPercentage = (
  totalEmissions: number,
  carbonSinks: number
): number => {
  if (totalEmissions === 0) return 0;
  return Math.min((carbonSinks / totalEmissions) * 100, 100);
};

export const calculateNetEmissions = (
  totalEmissions: number,
  carbonSinks: number
): number => {
  return Math.max(totalEmissions - carbonSinks, 0);
};

// Activity Type Categories
export const ACTIVITY_CATEGORIES = {
  fuel_combustion: ['diesel', 'petrol', 'coal', 'lpg', 'cng'],
  electricity: ['electricity', 'solar', 'wind'],
  transport: ['transport_diesel', 'transport_petrol', 'transport_electric'],
  equipment: ['excavator_diesel', 'bulldozer_diesel', 'haul_truck_diesel'],
  refrigerants: ['r134a', 'r404a'],
  waste: ['waste_landfill', 'waste_incineration']
};

export const SINK_CATEGORIES = {
  natural: ['tree_plantation'],
  renewable_energy: ['solar_installation', 'wind_installation'],
  efficiency: ['energy_efficiency']
};

// Get all available activity types
export const getAvailableActivityTypes = (): Array<{value: string, label: string, factor: number, unit: string}> => {
  return Object.entries(EMISSION_FACTORS).map(([key, factor]) => ({
    value: key,
    label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    factor: factor.value,
    unit: factor.unit.split('/')[1] || factor.unit
  }));
};

export const getAvailableSinkTypes = (): Array<{value: string, label: string, factor: number, unit: string}> => {
  return Object.entries(CARBON_SINK_FACTORS).map(([key, factor]) => ({
    value: key,
    label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    factor: factor.value,
    unit: factor.unit.split('/')[1] || factor.unit
  }));
}; 