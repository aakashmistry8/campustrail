import { ItineraryDetails, CompanionDetails, Review } from '../types/TravelTypes';

// Sample reviews for itineraries
const itineraryReviews: Record<string, Review[]> = {
  'it1': [
    {
      id: 'it1_r1',
      userId: 'u1',
      userName: 'Priya Sharma',
      rating: 5,
      title: 'Amazing Kedarkantha experience!',
      comment: 'Vikram was an excellent guide. The trek was well-planned and the summit views were breathtaking. Perfect for beginners!',
      date: '2024-10-25',
      verified: true,
      helpful: 15,
      images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop']
    },
    {
      id: 'it1_r2',
      userId: 'u2',
      userName: 'Rajesh Kumar',
      rating: 4,
      title: 'Great weekend trek',
      comment: 'Well organized trip with good camping arrangements. Only issue was the weather but that\'s beyond anyone\'s control.',
      date: '2024-10-28',
      verified: true,
      helpful: 8
    }
  ],
  'it2': [
    {
      id: 'it2_r1',
      userId: 'u3',
      userName: 'Adventure_Soul',
      rating: 5,
      title: 'Perfect Pondicherry getaway',
      comment: 'Sara planned everything perfectly. The scooter rides along the coast were amazing and Auroville was so peaceful.',
      date: '2024-11-05',
      verified: true,
      helpful: 12
    }
  ]
};

// Sample reviews for companions
const companionReviews: Record<string, Review[]> = {
  'c1': [
    {
      id: 'c1_r1',
      userId: 'u4',
      userName: 'Trekking_Buddy',
      rating: 5,
      title: 'Amazing travel companion!',
      comment: 'Maya is super organized and fun to travel with. She knows great local spots and is very budget-conscious.',
      date: '2024-08-20',
      verified: true,
      helpful: 10
    },
    {
      id: 'c1_r2',
      userId: 'u5',
      userName: 'Mountain_Explorer',
      rating: 4,
      title: 'Great photographer and guide',
      comment: 'Learned so much about photography during our Spiti trip. Maya has a great eye for capturing landscapes.',
      date: '2024-07-15',
      verified: true,
      helpful: 6
    }
  ]
};

// Create detailed itinerary data
export const itineraryDetailsData: Record<string, ItineraryDetails> = {
  'it1': {
    id: 'it1',
    title: 'Kedarkantha Weekend',
    creator: 'Vikram',
    dates: 'Oct 18–20',
    stops: ['Dehradun', 'Sankri', 'Juda Talab', 'Summit'],
    notes: 'Budget ~₹6k, rental gear welcome.',
    seats: 3,
    fullDescription: 'Experience the magic of Kedarkantha, one of the most popular winter treks in Uttarakhand. This weekend adventure offers stunning snow-capped peaks, pristine forests, and an achievable summit for beginners. Perfect for those looking to start their Himalayan trekking journey.',
    price: 5999,
    difficulty: 'Moderate',
    duration: '3 Days, 2 Nights',
    distance: '20 km',
    elevation: '12,500 ft',
    accommodation: ['Base camp tents', 'Guesthouse in Sankri'],
    included: ['Accommodation', 'All meals', 'Trek guide', 'Permits', 'First aid'],
    excluded: ['Transport to Dehradun', 'Personal gear', 'Tips', 'Insurance'],
    itinerary: [
      {
        day: 1,
        title: 'Dehradun to Sankri Base Camp',
        description: 'Drive through scenic mountain roads to reach Sankri village, our base camp.',
        activities: ['Scenic drive', 'Village exploration', 'Briefing session'],
        accommodation: 'Guesthouse',
        meals: ['Dinner']
      },
      {
        day: 2,
        title: 'Sankri to Juda Talab',
        description: 'Trek through beautiful oak and pine forests to reach the pristine Juda Talab lake.',
        activities: ['Forest trekking', 'Lake camping', 'Star gazing'],
        accommodation: 'Camping',
        meals: ['Breakfast', 'Lunch', 'Dinner']
      },
      {
        day: 3,
        title: 'Summit Day and Return',
        description: 'Early morning summit push followed by descent back to Sankri and return to Dehradun.',
        activities: ['Summit climb', 'Panoramic views', 'Descent'],
        meals: ['Breakfast', 'Lunch']
      }
    ],
    packingList: ['Trekking shoes', 'Warm clothing', 'Rain gear', 'Water bottle', 'Headlamp', 'Personal medicines'],
    requirements: ['Basic fitness level', 'No prior trekking experience needed', 'Age 16-55'],
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1464822759844-d150ad6d1e49?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800&h=600&fit=crop'
    ],
    avgRating: 4.5,
    reviewCount: 2,
    reviews: itineraryReviews['it1'] || [],
    tags: ['weekend', 'beginner-friendly', 'snow', 'himalaya', 'trekking'],
    meetingPoint: 'Dehradun Railway Station',
    emergencyContact: '+91-9876543210',
    cancellationPolicy: 'Free cancellation 7 days before. 50% refund 3-7 days before.',
    groupSize: {
      min: 4,
      max: 12,
      current: 9
    }
  },
  'it2': {
    id: 'it2',
    title: 'Pondicherry Ride',
    creator: 'Sara',
    dates: 'Nov 1–3',
    stops: ['Chennai', 'Auroville', 'Promenade'],
    notes: 'Scooter rentals, beach hostel.',
    seats: 2,
    fullDescription: 'Discover the French charm of Pondicherry on this coastal adventure. Explore the spiritual community of Auroville, cruise along scenic coastal roads, and immerse yourself in the unique Indo-French culture.',
    price: 4499,
    difficulty: 'Easy',
    duration: '3 Days, 2 Nights',
    distance: '150 km (by scooter)',
    accommodation: ['Beach hostel', 'Heritage guesthouse'],
    included: ['Accommodation', 'Scooter rental', 'Auroville entry', 'Local guide', 'Some meals'],
    excluded: ['Transport to Chennai', 'All meals', 'Personal expenses', 'Fuel'],
    itinerary: [
      {
        day: 1,
        title: 'Chennai to Pondicherry',
        description: 'Travel to Pondicherry and explore the French Quarter.',
        activities: ['French Quarter walk', 'Beach visit', 'Local cuisine'],
        accommodation: 'Heritage guesthouse',
        meals: ['Dinner']
      },
      {
        day: 2,
        title: 'Auroville and Coastal Ride',
        description: 'Visit the spiritual community of Auroville and enjoy coastal scooter rides.',
        activities: ['Auroville tour', 'Matrimandir meditation', 'Coastal ride', 'Beach sunset'],
        accommodation: 'Beach hostel',
        meals: ['Breakfast']
      },
      {
        day: 3,
        title: 'Local Exploration and Departure',
        description: 'Explore local markets, cafes, and prepare for departure.',
        activities: ['Market visit', 'Cafe hopping', 'Souvenir shopping'],
        meals: ['Breakfast']
      }
    ],
    packingList: ['Light cotton clothes', 'Sunscreen', 'Hat', 'Camera', 'Valid ID', 'Beach wear'],
    requirements: ['Valid driving license', 'Basic scooter riding skills', 'Age 18+'],
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1609592192972-8ba4b6f07b5e?w=800&h=600&fit=crop'
    ],
    avgRating: 5.0,
    reviewCount: 1,
    reviews: itineraryReviews['it2'] || [],
    tags: ['coastal', 'cultural', 'scooter', 'spiritual', 'easy'],
    meetingPoint: 'Chennai Central Station',
    emergencyContact: '+91-9876543211',
    cancellationPolicy: 'Free cancellation 5 days before. 25% refund 2-5 days before.',
    groupSize: {
      min: 2,
      max: 6,
      current: 4
    }
  }
};

// Create detailed companion data
export const companionDetailsData: Record<string, CompanionDetails> = {
  'c1': {
    id: 'c1',
    name: 'Maya',
    trip: 'Spiti Circuit',
    dates: 'Nov 6–14',
    prefs: ['Budget', 'Backpacking', 'Photography'],
    seats: 2,
    fullBio: 'Adventure enthusiast and photographer with a passion for high-altitude landscapes. I love exploring offbeat destinations and capturing their raw beauty. Looking for like-minded travelers who appreciate slow travel and authentic experiences.',
    age: 26,
    location: 'Delhi, India',
    languages: ['Hindi', 'English', 'Basic German'],
    travelStyle: ['Backpacking', 'Budget', 'Photography', 'Cultural immersion'],
    experience: {
      totalTrips: 25,
      countries: 8,
      specialties: ['High-altitude trekking', 'Photography', 'Solo travel', 'Cultural exploration']
    },
    availability: {
      flexible: true,
      preferredDates: ['Nov 6–14', 'Nov 20–28'],
      duration: '7-10 days'
    },
    budget: {
      range: '₹15,000 - ₹25,000',
      splitPreference: ['Equal split', 'By consumption']
    },
    accommodation: ['Hostels', 'Guesthouses', 'Camping', 'Homestays'],
    transportation: ['Public transport', 'Shared taxis', 'Motorbike'],
    interests: ['Photography', 'Hiking', 'Local cuisine', 'Cultural sites', 'Astronomy'],
    socialMedia: {
      instagram: '@maya_wanderlust',
    },
    verifications: {
      email: true,
      phone: true,
      government_id: true
    },
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506793466252-08d94b2b8b5b?w=800&h=600&fit=crop'
    ],
    avgRating: 4.5,
    reviewCount: 2,
    reviews: companionReviews['c1'] || [],
    tags: ['photographer', 'budget-friendly', 'experienced', 'flexible'],
    lastActive: '2024-09-07',
    responseRate: 95,
    responseTime: 'within 2 hours'
  },
  'c2': {
    id: 'c2',
    name: 'Arjun',
    trip: 'Hampi Weekend',
    dates: 'Oct 25–27',
    prefs: ['History', 'Hostels', 'Sunrise'],
    seats: 3,
    fullBio: 'History buff and architecture enthusiast who loves exploring ancient ruins and heritage sites. I enjoy early morning explorations to beat the crowds and capture the best light for photography.',
    age: 29,
    location: 'Bangalore, India',
    languages: ['Hindi', 'English', 'Kannada'],
    travelStyle: ['Heritage', 'Cultural', 'Photography', 'Early riser'],
    experience: {
      totalTrips: 18,
      countries: 5,
      specialties: ['Heritage tours', 'Architecture photography', 'Historical research']
    },
    availability: {
      flexible: false,
      preferredDates: ['Oct 25–27'],
      duration: '2-3 days'
    },
    budget: {
      range: '₹5,000 - ₹8,000',
      splitPreference: ['Equal split']
    },
    accommodation: ['Hostels', 'Budget hotels'],
    transportation: ['Bus', 'Train', 'Shared taxi'],
    interests: ['History', 'Architecture', 'Photography', 'Archaeology', 'Local culture'],
    verifications: {
      email: true,
      phone: true,
      government_id: false
    },
    images: [
      'https://images.unsplash.com/photo-1597149406029-b71eaf01d4db?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&h=600&fit=crop'
    ],
    avgRating: 4.2,
    reviewCount: 1,
    reviews: [],
    tags: ['history-lover', 'photographer', 'heritage', 'weekend-trips'],
    lastActive: '2024-09-06',
    responseRate: 88,
    responseTime: 'within 4 hours'
  }
};

// Generate basic data for remaining items
const generateBasicItineraryReviews = (id: string, count: number = 2): Review[] => {
  const reviewTemplates = [
    { rating: 5, title: 'Amazing experience!', comment: 'Perfect trip with great organization and stunning views!' },
    { rating: 4, title: 'Well organized', comment: 'Good trip overall, would recommend to others.' },
    { rating: 5, title: 'Loved every moment', comment: 'Incredible journey with wonderful companions!' }
  ];
  
  const userNames = ['Travel_Explorer', 'Mountain_Lover', 'Adventure_Seeker', 'Nature_Enthusiast'];
  
  return Array.from({ length: count }, (_, i) => {
    const template = reviewTemplates[i % reviewTemplates.length];
    return {
      id: `${id}_r${i + 1}`,
      userId: `u${Math.floor(Math.random() * 100)}`,
      userName: userNames[i % userNames.length],
      rating: template.rating,
      title: template.title,
      comment: template.comment,
      date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      verified: Math.random() > 0.3,
      helpful: Math.floor(Math.random() * 15)
    };
  });
};

export default { itineraryDetailsData, companionDetailsData };
