// Companion profile images based on activity preferences
export const companionImages: Record<string, string> = {
  // Activity-based images
  'Trekking': 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop',
  'Trek': 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop',
  'Hiking': 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=600&fit=crop',
  'Backpacking': 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=600&fit=crop',
  'Photography': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop',
  'Diving': 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&h=600&fit=crop',
  'Marine': 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&h=600&fit=crop',
  'Beach': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
  'Cycling': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
  'Ride': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
  'Culture': 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&h=600&fit=crop',
  'History': 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&h=600&fit=crop',
  'Museums': 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&h=600&fit=crop',
  'Yoga': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Relax': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Chill': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
  'Cafe': 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&h=600&fit=crop',
  'Stargaze': 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&h=600&fit=crop',
  'Camel': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop',
  'Nightlife': 'https://images.unsplash.com/photo-1537944434965-cf4679d1a598?w=800&h=600&fit=crop',
  'Scenic': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Budget': 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=600&fit=crop',
  'Hostel': 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=600&fit=crop',
  'Rafting': 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&h=600&fit=crop',
  'Adventure': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  
  // Location-based images
  'Mountain': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Himalaya': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
  'Desert': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop',
  'Forest': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
  'Waterfall': 'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?w=800&h=600&fit=crop',
  'City': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
  'Rural': 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&h=600&fit=crop',
  
  // Default images by gender (as a fallback)
  'male': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
  'female': 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&h=600&fit=crop',
  'default': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop'
};

/**
 * Gets a companion profile image based on their preferences or name
 * @param name Name of the companion
 * @param preferences List of activity preferences
 * @returns Path to an appropriate profile image
 */
export function getCompanionImage(name: string, preferences: string[]): string {
  // First try to match based on preferences
  if (preferences && preferences.length > 0) {
    for (const pref of preferences) {
      // Look for exact match
      if (companionImages[pref]) {
        return companionImages[pref];
      }
      
      // Try partial match
      const prefLower = pref.toLowerCase();
      const keys = Object.keys(companionImages);
      for (const key of keys) {
        if (key !== 'male' && key !== 'female' && key !== 'default' && 
            (prefLower.includes(key.toLowerCase()) || 
             key.toLowerCase().includes(prefLower))) {
          return companionImages[key];
        }
      }
    }
  }
  
  // Try to determine gender from name (simplified approach)
  const femaleNames = ['Maya', 'Sara', 'Aisha', 'Neha', 'Zara', 'Sonia', 'Anjali', 'Farah', 'Kavya', 'Divya', 'Pooja'];
  if (femaleNames.includes(name)) {
    return companionImages.female;
  }
  
  const maleNames = ['Arjun', 'Rahul', 'Ishan', 'Karan', 'Vivek', 'Pranav', 'Nikhil', 'Ravi', 'Rahim'];
  if (maleNames.includes(name)) {
    return companionImages.male;
  }
  
  // Fallback to default
  return companionImages.default;
}
