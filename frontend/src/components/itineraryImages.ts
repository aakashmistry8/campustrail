// Map of destination names to image paths from Unsplash
export const itineraryImages: Record<string, string> = {
  // Mountain destinations
  'Kedarkantha': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Dehradun': 'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800&h=600&fit=crop',
  'Sankri': 'https://images.unsplash.com/photo-1464822759844-d150ad6d1e49?w=800&h=600&fit=crop',
  'Summit': 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop',
  'Spiti': 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800&h=600&fit=crop',
  'Manali': 'https://images.unsplash.com/photo-1506793466252-08d94b2b8b5b?w=800&h=600&fit=crop',
  'Kaza': 'https://images.unsplash.com/photo-1597149406029-b71eaf01d4db?w=800&h=600&fit=crop',
  'Chandratal': 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&h=600&fit=crop',
  'Leh': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
  'Ladakh': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&h=600&fit=crop',
  'Nubra': 'https://images.unsplash.com/photo-1566552281675-512f4c669ad0?w=800&h=600&fit=crop',
  'Pangong': 'https://images.unsplash.com/photo-1625516924611-1d4b92b7c3f9?w=800&h=600&fit=crop',
  'Sikkim': 'https://images.unsplash.com/photo-1578895101408-1a36b834405b?w=800&h=600&fit=crop',
  'Gangtok': 'https://images.unsplash.com/photo-1605640640860-7a37a2d4e325?w=800&h=600&fit=crop',
  'Hemkund': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Govindghat': 'https://images.unsplash.com/photo-1464822759844-d150ad6d1e49?w=800&h=600&fit=crop',
  'Ghangaria': 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop',
  'VoF': 'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800&h=600&fit=crop',
  'Kasol': 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800&h=600&fit=crop',
  'Chalal': 'https://images.unsplash.com/photo-1506793466252-08d94b2b8b5b?w=800&h=600&fit=crop',
  'Tosh': 'https://images.unsplash.com/photo-1597149406029-b71eaf01d4db?w=800&h=600&fit=crop',
  'Rishikesh': 'https://images.unsplash.com/photo-1578895101408-1a36b834405b?w=800&h=600&fit=crop',
  'Shivpuri': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
  
  // Beach destinations
  'Pondicherry': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
  'Chennai': 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop',
  'Auroville': 'https://images.unsplash.com/photo-1609592192972-8ba4b6f07b5e?w=800&h=600&fit=crop',
  'Promenade': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
  'Goa': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop',
  'Baga': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
  'Anjuna': 'https://images.unsplash.com/photo-1598091953725-b31dc626a7e7?w=800&h=600&fit=crop',
  'Andaman': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
  'Port Blair': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop',
  'Havelock': 'https://images.unsplash.com/photo-1598091953725-b31dc626a7e7?w=800&h=600&fit=crop',
  'Neil': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
  'Gokarna': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop',
  'Om Beach': 'https://images.unsplash.com/photo-1598091953725-b31dc626a7e7?w=800&h=600&fit=crop',
  'Kerala': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&h=600&fit=crop',
  'Alleppey': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
  'Kumarakom': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&h=600&fit=crop',
  
  // Cultural/Heritage destinations
  'Hampi': 'https://images.unsplash.com/photo-1597149406029-b71eaf01d4db?w=800&h=600&fit=crop',
  'Virupaksha': 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&h=600&fit=crop',
  'Hemakuta': 'https://images.unsplash.com/photo-1597149406029-b71eaf01d4db?w=800&h=600&fit=crop',
  'Matanga': 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&h=600&fit=crop',
  'Rann': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
  'Bhuj': 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop',
  'White Rann': 'https://images.unsplash.com/photo-1609592192972-8ba4b6f07b5e?w=800&h=600&fit=crop',
  'Jaisalmer': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
  'Fort': 'https://images.unsplash.com/photo-1597149406029-b71eaf01d4db?w=800&h=600&fit=crop',
  'Sam Dunes': 'https://images.unsplash.com/photo-1609592192972-8ba4b6f07b5e?w=800&h=600&fit=crop',
  'Araku': 'https://images.unsplash.com/photo-1578895101408-1a36b834405b?w=800&h=600&fit=crop',
  'Borra Caves': 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&h=600&fit=crop',
  
  // Hill stations & Nature
  'Meghalaya': 'https://images.unsplash.com/photo-1578895101408-1a36b834405b?w=800&h=600&fit=crop',
  'Shillong': 'https://images.unsplash.com/photo-1605640640860-7a37a2d4e325?w=800&h=600&fit=crop',
  'Cherrapunji': 'https://images.unsplash.com/photo-1578895101408-1a36b834405b?w=800&h=600&fit=crop',
  'Living Roots': 'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?w=800&h=600&fit=crop',
  'Kodaikanal': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Lake': 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&h=600&fit=crop',
  'Pillar Rocks': 'https://images.unsplash.com/photo-1597149406029-b71eaf01d4db?w=800&h=600&fit=crop',
  'Munnar': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&h=600&fit=crop',
  'Tea Gardens': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&h=600&fit=crop',
  'Top Station': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Coorg': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&h=600&fit=crop',
  'Madikeri': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&h=600&fit=crop',
  'Abbey Falls': 'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?w=800&h=600&fit=crop',
  
  // Default image (used if specific location not found)
  'default': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
};

/**
 * Gets an image path for a given destination
 * @param destination Name of the destination
 * @returns Path to the image for that destination
 */
export function getItineraryImage(destination: string): string {
  // First try exact match
  if (destination && itineraryImages[destination]) {
    return itineraryImages[destination];
  }
  
  // Try to match partial destination name
  const destinationLower = destination.toLowerCase();
  const keys = Object.keys(itineraryImages);
  for (const key of keys) {
    if (key !== 'default' && 
        (destinationLower.includes(key.toLowerCase()) || 
         key.toLowerCase().includes(destinationLower))) {
      return itineraryImages[key];
    }
  }
  
  // Return default image if no match
  return itineraryImages.default;
}
