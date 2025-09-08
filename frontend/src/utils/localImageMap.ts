/**
 * This file maps itinerary locations to locally stored images
 */

// Local image paths by location type
export const localImageMap = {
  // Mountain destinations
  mountain: {
    default: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    trek: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop',
    peak: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    valley: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    village: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&h=600&fit=crop'
  },
  
  // Beach destinations
  beach: {
    default: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
    sunset: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
    tropical: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
    coastal: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop'
  },
  
  // Desert locations
  desert: {
    default: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop',
    dunes: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop',
    camel: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop',
    fort: 'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=800&h=600&fit=crop'
  },
  
  // Forest locations
  forest: {
    default: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
    trail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
    campsite: 'https://images.unsplash.com/photo-1508873696983-2dfd5898f08b?w=800&h=600&fit=crop',
    waterfall: 'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?w=800&h=600&fit=crop'
  },
  
  // Cities and cultural sites
  urban: {
    default: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
    market: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&h=600&fit=crop',
    temple: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&h=600&fit=crop',
    heritage: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&h=600&fit=crop',
    modern: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop'
  }
};

// Map specific destinations to image categories
const destinationTypeMap: Record<string, keyof typeof localImageMap> = {
  // Mountain destinations
  'Kedarkantha': 'mountain',
  'Dehradun': 'urban',
  'Sankri': 'mountain',
  'Juda Talab': 'mountain',
  'Summit': 'mountain',
  'Spiti': 'mountain',
  'Manali': 'mountain',
  'Kaza': 'mountain',
  'Chandratal': 'mountain',
  
  // Beach destinations
  'Goa': 'beach',
  'Baga': 'beach',
  'Anjuna': 'beach',
  'Pondicherry': 'beach',
  
  // Desert destinations
  'Jaisalmer': 'desert',
  'Sam Dunes': 'desert',
  'Rann': 'desert',
  'Kutch': 'desert',
  
  // Forest areas
  'Coorg': 'forest',
  'Munnar': 'forest',
  'Kerala': 'forest',
  
  // Urban areas
  'Chennai': 'urban',
  'Shillong': 'urban',
  'Delhi': 'urban',
  'Mumbai': 'urban'
};

/**
 * Get a local image path for a destination
 */
export function getLocalDestinationImage(destination: string): string {
  // Default image if we can't find anything specific
  const defaultImage = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop';
  
  if (!destination) return defaultImage;
  
  // Determine the destination type
  const destinationType = destinationTypeMap[destination] || 'mountain';
  
  // Return the default image for that type
  return localImageMap[destinationType].default || defaultImage;
}

/**
 * Get a local image path for a traveler profile
 */
export function getLocalTravelerImage(gender: 'male' | 'female' | 'unknown'): string {
  switch (gender) {
    case 'male':
      return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop';
    case 'female':
      return 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&h=600&fit=crop';
    default:
      return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop';
  }
}
