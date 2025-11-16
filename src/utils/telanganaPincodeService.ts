/**
 * Telangana Pincode Lookup Service
 * Validates pincodes and provides city/district information for Telangana state only
 */

export interface PincodeData {
  pincode: string;
  city: string;
  district: string;
  state: string;
  isServiceable: boolean;
}

// Telangana pincodes with their corresponding cities and districts
// This is a comprehensive list of major areas in Telangana
const telanganaPincodes: Record<string, { city: string; district: string }> = {
  // Hyderabad
  '500001': { city: 'Hyderabad', district: 'Hyderabad' },
  '500002': { city: 'Hyderabad', district: 'Hyderabad' },
  '500003': { city: 'Hyderabad', district: 'Hyderabad' },
  '500004': { city: 'Hyderabad', district: 'Hyderabad' },
  '500005': { city: 'Hyderabad', district: 'Hyderabad' },
  '500006': { city: 'Hyderabad', district: 'Hyderabad' },
  '500007': { city: 'Hyderabad', district: 'Hyderabad' },
  '500008': { city: 'Hyderabad', district: 'Hyderabad' },
  '500009': { city: 'Hyderabad', district: 'Hyderabad' },
  '500010': { city: 'Hyderabad', district: 'Hyderabad' },
  '500011': { city: 'Hyderabad', district: 'Hyderabad' },
  '500012': { city: 'Hyderabad', district: 'Hyderabad' },
  '500013': { city: 'Hyderabad', district: 'Hyderabad' },
  '500014': { city: 'Hyderabad', district: 'Hyderabad' },
  '500015': { city: 'Hyderabad', district: 'Hyderabad' },
  '500016': { city: 'Hyderabad', district: 'Hyderabad' },
  '500017': { city: 'Hyderabad', district: 'Hyderabad' },
  '500018': { city: 'Hyderabad', district: 'Hyderabad' },
  '500019': { city: 'Hyderabad', district: 'Hyderabad' },
  '500020': { city: 'Hyderabad', district: 'Hyderabad' },
  '500022': { city: 'Hyderabad', district: 'Hyderabad' },
  '500023': { city: 'Hyderabad', district: 'Hyderabad' },
  '500024': { city: 'Hyderabad', district: 'Hyderabad' },
  '500025': { city: 'Hyderabad', district: 'Hyderabad' },
  '500026': { city: 'Hyderabad', district: 'Hyderabad' },
  '500027': { city: 'Hyderabad', district: 'Hyderabad' },
  '500028': { city: 'Hyderabad', district: 'Hyderabad' },
  '500029': { city: 'Hyderabad', district: 'Hyderabad' },
  '500030': { city: 'Hyderabad', district: 'Hyderabad' },
  '500031': { city: 'Hyderabad', district: 'Hyderabad' },
  '500032': { city: 'Hyderabad', district: 'Hyderabad' },
  '500033': { city: 'Hyderabad', district: 'Hyderabad' },
  '500034': { city: 'Hyderabad', district: 'Hyderabad' },
  '500035': { city: 'Hyderabad', district: 'Hyderabad' },
  '500036': { city: 'Hyderabad', district: 'Hyderabad' },
  '500038': { city: 'Hyderabad', district: 'Hyderabad' },
  '500039': { city: 'Hyderabad', district: 'Hyderabad' },
  '500040': { city: 'Hyderabad', district: 'Hyderabad' },
  '500041': { city: 'Hyderabad', district: 'Hyderabad' },
  '500042': { city: 'Hyderabad', district: 'Hyderabad' },
  '500043': { city: 'Hyderabad', district: 'Hyderabad' },
  '500044': { city: 'Hyderabad', district: 'Hyderabad' },
  '500045': { city: 'Hyderabad', district: 'Hyderabad' },
  '500046': { city: 'Hyderabad', district: 'Hyderabad' },
  '500047': { city: 'Hyderabad', district: 'Hyderabad' },
  '500048': { city: 'Hyderabad', district: 'Hyderabad' },
  '500049': { city: 'Hyderabad', district: 'Hyderabad' },
  '500050': { city: 'Hyderabad', district: 'Hyderabad' },
  '500051': { city: 'Hyderabad', district: 'Hyderabad' },
  '500052': { city: 'Hyderabad', district: 'Hyderabad' },
  '500053': { city: 'Hyderabad', district: 'Hyderabad' },
  '500055': { city: 'Hyderabad', district: 'Hyderabad' },
  '500056': { city: 'Hyderabad', district: 'Hyderabad' },
  '500057': { city: 'Hyderabad', district: 'Hyderabad' },
  '500058': { city: 'Hyderabad', district: 'Hyderabad' },
  '500059': { city: 'Hyderabad', district: 'Hyderabad' },
  '500060': { city: 'Hyderabad', district: 'Hyderabad' },
  '500061': { city: 'Hyderabad', district: 'Hyderabad' },
  '500062': { city: 'Hyderabad', district: 'Hyderabad' },
  '500063': { city: 'Hyderabad', district: 'Hyderabad' },
  '500064': { city: 'Hyderabad', district: 'Hyderabad' },
  '500065': { city: 'Hyderabad', district: 'Hyderabad' },
  '500066': { city: 'Hyderabad', district: 'Hyderabad' },
  '500067': { city: 'Hyderabad', district: 'Hyderabad' },
  '500068': { city: 'Hyderabad', district: 'Hyderabad' },
  '500069': { city: 'Hyderabad', district: 'Hyderabad' },
  '500070': { city: 'Hyderabad', district: 'Hyderabad' },
  '500071': { city: 'Hyderabad', district: 'Hyderabad' },
  '500072': { city: 'Hyderabad', district: 'Hyderabad' },
  '500073': { city: 'Hyderabad', district: 'Hyderabad' },
  '500074': { city: 'Hyderabad', district: 'Hyderabad' },
  '500075': { city: 'Hyderabad', district: 'Hyderabad' },
  '500076': { city: 'Hyderabad', district: 'Hyderabad' },
  '500077': { city: 'Hyderabad', district: 'Hyderabad' },
  '500078': { city: 'Hyderabad', district: 'Hyderabad' },
  '500079': { city: 'Hyderabad', district: 'Hyderabad' },
  '500080': { city: 'Hyderabad', district: 'Hyderabad' },
  '500081': { city: 'Hyderabad', district: 'Hyderabad' },
  '500082': { city: 'Hyderabad', district: 'Hyderabad' },
  '500084': { city: 'Hyderabad', district: 'Hyderabad' },
  '500085': { city: 'Hyderabad', district: 'Hyderabad' },
  '500086': { city: 'Hyderabad', district: 'Hyderabad' },
  '500087': { city: 'Hyderabad', district: 'Hyderabad' },
  '500088': { city: 'Hyderabad', district: 'Hyderabad' },
  '500089': { city: 'Hyderabad', district: 'Hyderabad' },
  '500090': { city: 'Hyderabad', district: 'Hyderabad' },
  '500091': { city: 'Hyderabad', district: 'Hyderabad' },
  '500092': { city: 'Hyderabad', district: 'Hyderabad' },
  '500093': { city: 'Hyderabad', district: 'Hyderabad' },
  '500094': { city: 'Hyderabad', district: 'Hyderabad' },
  '500095': { city: 'Hyderabad', district: 'Hyderabad' },
  '500096': { city: 'Hyderabad', district: 'Hyderabad' },
  
  // Secunderabad
  '500003': { city: 'Secunderabad', district: 'Hyderabad' },
  '500009': { city: 'Secunderabad', district: 'Hyderabad' },
  '500011': { city: 'Secunderabad', district: 'Hyderabad' },
  '500015': { city: 'Secunderabad', district: 'Hyderabad' },
  '500025': { city: 'Secunderabad', district: 'Hyderabad' },
  '500026': { city: 'Secunderabad', district: 'Hyderabad' },
  '500094': { city: 'Secunderabad', district: 'Hyderabad' },
  
  // Rangareddy District
  '501301': { city: 'Shamshabad', district: 'Rangareddy' },
  '501401': { city: 'Chevella', district: 'Rangareddy' },
  '501501': { city: 'Tandur', district: 'Rangareddy' },
  '501503': { city: 'Vikarabad', district: 'Rangareddy' },
  '501505': { city: 'Mominpet', district: 'Rangareddy' },
  '501512': { city: 'Kodangal', district: 'Rangareddy' },
  
  // Medchal-Malkajgiri District
  '501101': { city: 'Medchal', district: 'Medchal-Malkajgiri' },
  '501201': { city: 'Kompally', district: 'Medchal-Malkajgiri' },
  '501301': { city: 'Ibrahimpatnam', district: 'Medchal-Malkajgiri' },
  '501401': { city: 'Ghatkesar', district: 'Medchal-Malkajgiri' },
  '501505': { city: 'Keesara', district: 'Medchal-Malkajgiri' },
  
  // Warangal
  '506001': { city: 'Warangal', district: 'Warangal Urban' },
  '506002': { city: 'Warangal', district: 'Warangal Urban' },
  '506003': { city: 'Warangal', district: 'Warangal Urban' },
  '506004': { city: 'Warangal', district: 'Warangal Urban' },
  '506005': { city: 'Warangal', district: 'Warangal Urban' },
  '506006': { city: 'Warangal', district: 'Warangal Urban' },
  '506007': { city: 'Warangal', district: 'Warangal Urban' },
  '506008': { city: 'Warangal', district: 'Warangal Urban' },
  '506009': { city: 'Warangal', district: 'Warangal Urban' },
  '506011': { city: 'Warangal', district: 'Warangal Urban' },
  '506013': { city: 'Warangal', district: 'Warangal Urban' },
  '506015': { city: 'Warangal', district: 'Warangal Urban' },
  
  // Nizamabad
  '503001': { city: 'Nizamabad', district: 'Nizamabad' },
  '503002': { city: 'Nizamabad', district: 'Nizamabad' },
  '503003': { city: 'Nizamabad', district: 'Nizamabad' },
  '503111': { city: 'Bodhan', district: 'Nizamabad' },
  '503122': { city: 'Armoor', district: 'Nizamabad' },
  '503144': { city: 'Banswada', district: 'Nizamabad' },
  
  // Karimnagar
  '505001': { city: 'Karimnagar', district: 'Karimnagar' },
  '505002': { city: 'Karimnagar', district: 'Karimnagar' },
  '505003': { city: 'Karimnagar', district: 'Karimnagar' },
  '505122': { city: 'Huzurabad', district: 'Karimnagar' },
  '505174': { city: 'Jagtial', district: 'Jagtial' },
  '505209': { city: 'Metpally', district: 'Jagtial' },
  
  // Khammam
  '507001': { city: 'Khammam', district: 'Khammam' },
  '507002': { city: 'Khammam', district: 'Khammam' },
  '507003': { city: 'Khammam', district: 'Khammam' },
  '507101': { city: 'Madhira', district: 'Khammam' },
  '507115': { city: 'Yellandu', district: 'Khammam' },
  '507116': { city: 'Kothagudem', district: 'Khammam' },
  
  // Nalgonda
  '508001': { city: 'Nalgonda', district: 'Nalgonda' },
  '508002': { city: 'Nalgonda', district: 'Nalgonda' },
  '508101': { city: 'Miryalaguda', district: 'Nalgonda' },
  '508126': { city: 'Devarakonda', district: 'Nalgonda' },
  '508201': { city: 'Suryapet', district: 'Suryapet' },
  '508202': { city: 'Kodad', district: 'Suryapet' },
  
  // Mahabubnagar
  '509001': { city: 'Mahabubnagar', district: 'Mahabubnagar' },
  '509002': { city: 'Mahabubnagar', district: 'Mahabubnagar' },
  '509101': { city: 'Gadwal', district: 'Gadwal' },
  '509125': { city: 'Wanaparthy', district: 'Wanaparthy' },
  '509201': { city: 'Nagarkurnool', district: 'Nagarkurnool' },
  '509209': { city: 'Kalwakurthy', district: 'Nagarkurnool' },
  
  // Adilabad
  '504001': { city: 'Adilabad', district: 'Adilabad' },
  '504002': { city: 'Adilabad', district: 'Adilabad' },
  '504101': { city: 'Mancherial', district: 'Mancherial' },
  '504106': { city: 'Bellampalli', district: 'Mancherial' },
  '504207': { city: 'Nirmal', district: 'Nirmal' },
  '504231': { city: 'Bhainsa', district: 'Nirmal' },
  
  // Medak
  '502001': { city: 'Medak', district: 'Medak' },
  '502101': { city: 'Sangareddy', district: 'Sangareddy' },
  '502102': { city: 'Patancheru', district: 'Sangareddy' },
  '502103': { city: 'Zahirabad', district: 'Sangareddy' },
  '502210': { city: 'Siddipet', district: 'Siddipet' },
  '502285': { city: 'Gajwel', district: 'Siddipet' },
};

/**
 * Check if a pincode belongs to Telangana
 */
export function isTelananaPincode(pincode: string): boolean {
  const cleanPincode = pincode.trim();
  return cleanPincode in telanganaPincodes;
}

/**
 * Get location details for a Telangana pincode
 */
export function getTelanganaLocationByPincode(pincode: string): PincodeData | null {
  const cleanPincode = pincode.trim();
  
  if (!isTelananaPincode(cleanPincode)) {
    return null;
  }
  
  const location = telanganaPincodes[cleanPincode];
  
  return {
    pincode: cleanPincode,
    city: location.city,
    district: location.district,
    state: 'Telangana',
    isServiceable: true
  };
}

/**
 * Validate pincode and return location details
 * Returns error if pincode is not from Telangana
 */
export async function validateAndGetLocation(pincode: string): Promise<{
  success: boolean;
  data?: PincodeData;
  error?: string;
}> {
  const cleanPincode = pincode.trim();
  
  // Validate pincode format
  if (!/^\d{6}$/.test(cleanPincode)) {
    return {
      success: false,
      error: 'Please enter a valid 6-digit pincode'
    };
  }
  
  // Check if pincode is from Telangana
  const locationData = getTelanganaLocationByPincode(cleanPincode);
  
  if (!locationData) {
    return {
      success: false,
      error: 'Sorry, we currently deliver only within Telangana. This pincode is not serviceable.'
    };
  }
  
  return {
    success: true,
    data: locationData
  };
}

/**
 * Get all serviceable pincodes
 */
export function getAllServiceablePincodes(): string[] {
  return Object.keys(telanganaPincodes);
}

/**
 * Get all cities in Telangana that we service
 */
export function getAllServiceableCities(): string[] {
  const cities = new Set<string>();
  Object.values(telanganaPincodes).forEach(location => {
    cities.add(location.city);
  });
  return Array.from(cities).sort();
}

export default {
  isTelananaPincode,
  getTelanganaLocationByPincode,
  validateAndGetLocation,
  getAllServiceablePincodes,
  getAllServiceableCities
};
