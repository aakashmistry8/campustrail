import { ProductDetails, Review } from '../types/Product';

// Sample reviews data
const sampleReviews: Record<string, Review[]> = {
  'p1': [
    {
      id: 'r1_1',
      userId: 'u1',
      userName: 'Rajesh Kumar',
      rating: 5,
      title: 'Excellent backpack for long treks',
      comment: 'Used this for a 10-day Himalayan trek. The frame distribution is amazing and it held up perfectly in harsh weather. Highly recommended!',
      date: '2024-08-15',
      verified: true,
      helpful: 12,
      images: ['/images/reviews/backpack_review_1.jpg']
    },
    {
      id: 'r1_2',
      userId: 'u2',
      userName: 'Priya Sharma',
      rating: 4,
      title: 'Great quality, slightly heavy',
      comment: 'Love the build quality and compartments. Only complaint is it\'s a bit heavier than expected, but the comfort makes up for it.',
      date: '2024-07-22',
      verified: true,
      helpful: 8
    },
    {
      id: 'r1_3',
      userId: 'u3',
      userName: 'Adventure_Mike',
      rating: 5,
      title: 'Perfect for multi-day hikes',
      comment: 'This has become my go-to backpack. The rain cover worked perfectly during monsoon season. Excellent value for money.',
      date: '2024-06-10',
      verified: true,
      helpful: 15
    }
  ],
  'p2': [
    {
      id: 'r2_1',
      userId: 'u4',
      userName: 'Camping_Pro',
      rating: 4,
      title: 'Solid tent for 3-season use',
      comment: 'Easy to set up, weatherproof, and spacious for two people. Only issue is the zippers could be smoother.',
      date: '2024-08-01',
      verified: true,
      helpful: 6
    },
    {
      id: 'r2_2',
      userId: 'u5',
      userName: 'Mountain_Explorer',
      rating: 5,
      title: 'Survived heavy rain and wind',
      comment: 'Used this during a storm in Ladakh. Completely dry inside, stable in high winds. Impressed!',
      date: '2024-07-18',
      verified: true,
      helpful: 9
    }
  ],
  'p3': [
    {
      id: 'r3_1',
      userId: 'u6',
      userName: 'Winter_Warrior',
      rating: 5,
      title: 'Kept me warm at -8°C',
      comment: 'Tested this at Rohtang Pass in winter. Stayed warm and comfortable throughout the night. Excellent insulation!',
      date: '2024-01-15',
      verified: true,
      helpful: 11
    }
  ],
  'p4': [
    {
      id: 'r4_1',
      userId: 'u7',
      userName: 'Foodie_Trekker',
      rating: 4,
      title: 'Fast and reliable',
      comment: 'Boils water in under 3 minutes. Compact and easy to use. Wish it came with a carrying case.',
      date: '2024-08-20',
      verified: true,
      helpful: 5
    },
    {
      id: 'r4_2',
      userId: 'u8',
      userName: 'Base_Camp_Chef',
      rating: 5,
      title: 'Perfect for group cooking',
      comment: 'Been using this for our trekking group meals. Consistent flame, stable base. Highly recommended!',
      date: '2024-07-30',
      verified: true,
      helpful: 7
    }
  ]
};

// Create detailed product information
export const productDetailsData: Record<string, ProductDetails> = {
  'p1': {
    id: 'p1',
    name: '65L Trekking Backpack',
    description: 'Ergonomic frame • Weather resistant • 1.2kg',
    fullDescription: 'This professional-grade 65L trekking backpack is designed for serious adventurers. Featuring an advanced ergonomic frame system that distributes weight evenly, weather-resistant materials, and multiple compartments for organized packing. Perfect for multi-day treks and expedition use.',
    price: 2499,
    stock: 5,
    category: 'Backpacks',
    image: '/images/products/backpack_main.jpg',
    images: [
      '/images/products/backpack_main.jpg',
      '/images/products/backpack_side.jpg',
      '/images/products/backpack_open.jpg',
      '/images/products/backpack_details.jpg'
    ],
    deposit: 800,
    owner: 'Ankit',
    avgRating: 4.7,
    reviewCount: 3,
    brand: 'TrekGear Pro',
    weight: '1.2 kg',
    dimensions: '70 x 35 x 25 cm',
    material: 'Ripstop Nylon, Aluminum Frame',
    warranty: '2 years',
    specifications: {
      'Capacity': '65 Liters',
      'Frame Type': 'Internal Aluminum',
      'Material': 'Ripstop Nylon 420D',
      'Weight': '1.2 kg',
      'Dimensions': '70 x 35 x 25 cm',
      'Compartments': 'Main + Bottom + 7 Pockets',
      'Rain Cover': 'Included',
      'Load Range': '15-25 kg'
    },
    tags: ['trekking', 'backpack', 'waterproof', 'professional', 'multi-day'],
    reviews: sampleReviews['p1'] || []
  },
  'p2': {
    id: 'p2',
    name: '2-Person Dome Tent',
    description: 'Aluminum poles • 3-season • Ultra compact',
    fullDescription: 'Lightweight 2-person dome tent perfect for 3-season camping. Features aluminum poles for strength, double-wall construction for weather protection, and compact pack size for easy transport.',
    price: 4599,
    stock: 2,
    category: 'Tents',
    image: '/images/products/tent_main.jpg',
    images: [
      '/images/products/tent_main.jpg',
      '/images/products/tent_setup.jpg',
      '/images/products/tent_interior.jpg'
    ],
    deposit: 1200,
    owner: 'Meera',
    avgRating: 4.5,
    reviewCount: 2,
    brand: 'Camp Master',
    weight: '2.8 kg',
    dimensions: '210 x 140 x 110 cm (setup)',
    material: 'Polyester, Aluminum',
    warranty: '1 year',
    specifications: {
      'Capacity': '2 Person',
      'Season Rating': '3-Season',
      'Floor Area': '2.9 m²',
      'Peak Height': '110 cm',
      'Packed Size': '45 x 15 cm',
      'Weight': '2.8 kg',
      'Waterproof Rating': '3000mm',
      'Setup Time': '5 minutes'
    },
    tags: ['camping', 'tent', '2-person', 'lightweight', '3-season'],
    reviews: sampleReviews['p2'] || []
  },
  'p3': {
    id: 'p3',
    name: 'Sleeping Bag -5°C',
    description: 'Mummy shape • Draft collar • 1.1kg fill',
    fullDescription: 'High-performance mummy sleeping bag rated for temperatures down to -5°C. Features draft collar, hood, and premium synthetic insulation for warmth and comfort in cold conditions.',
    price: 1899,
    stock: 0,
    category: 'Sleeping',
    image: '/images/products/sleepingbag_main.jpg',
    images: [
      '/images/products/sleepingbag_main.jpg',
      '/images/products/sleepingbag_open.jpg'
    ],
    deposit: 600,
    owner: 'Ravi',
    avgRating: 5.0,
    reviewCount: 1,
    brand: 'Thermal Pro',
    weight: '1.1 kg',
    dimensions: '220 x 80 cm',
    material: 'Polyester, Synthetic Fill',
    warranty: '3 years',
    specifications: {
      'Temperature Rating': '-5°C to +10°C',
      'Shape': 'Mummy',
      'Fill Type': 'Synthetic',
      'Fill Weight': '1.1 kg',
      'Shell Material': 'Ripstop Polyester',
      'Zipper': 'YKK 2-way',
      'Packed Size': '25 x 15 cm',
      'Length': '220 cm'
    },
    tags: ['sleeping', 'winter', 'mummy', 'lightweight', 'synthetic'],
    reviews: sampleReviews['p3'] || []
  },
  'p4': {
    id: 'p4',
    name: 'Portable Gas Stove',
    description: 'Fast boil • Piezo ignition • Stable base',
    fullDescription: 'Compact and efficient portable gas stove with piezo ignition system. Features a stable wide base, adjustable flame control, and fast boiling capability for outdoor cooking.',
    price: 1299,
    stock: 7,
    category: 'Cooking',
    image: '/images/products/stove_main.jpg',
    images: [
      '/images/products/stove_main.jpg',
      '/images/products/stove_flame.jpg'
    ],
    deposit: 400,
    owner: 'Priya',
    avgRating: 4.5,
    reviewCount: 2,
    brand: 'CookFast',
    weight: '320g',
    dimensions: '11 x 11 x 4 cm',
    material: 'Aluminum, Stainless Steel',
    warranty: '1 year',
    specifications: {
      'Fuel Type': 'Butane/Propane',
      'Power Output': '3.5 kW',
      'Boil Time': '2-3 minutes (1L water)',
      'Weight': '320g',
      'Ignition': 'Piezo',
      'Base Diameter': '11 cm',
      'Flame Control': 'Adjustable',
      'Safety': 'Auto shut-off'
    },
    tags: ['cooking', 'stove', 'portable', 'fast', 'reliable'],
    reviews: sampleReviews['p4'] || []
  }
};

// Add more basic details for remaining products
const generateBasicReviews = (productId: string, count: number = 2): Review[] => {
  const reviewTemplates = [
    { rating: 5, title: 'Excellent quality!', comment: 'Great product, exactly as described. Highly recommended!' },
    { rating: 4, title: 'Good value for money', comment: 'Solid product with good build quality. Minor issues but overall satisfied.' },
    { rating: 4, title: 'Works as expected', comment: 'Does the job well. Good for the price point.' },
    { rating: 5, title: 'Perfect for my needs', comment: 'Exactly what I was looking for. Great performance!' },
    { rating: 3, title: 'Decent product', comment: 'It\'s okay, some room for improvement but usable.' }
  ];
  
  const userNames = ['Alex_Outdoor', 'Trek_Enthusiast', 'Nature_Lover', 'Adventure_Seeker', 'Mountain_Guide', 'Wilderness_Expert'];
  
  return Array.from({ length: count }, (_, i) => {
    const template = reviewTemplates[i % reviewTemplates.length];
    return {
      id: `${productId}_r${i + 1}`,
      userId: `u${Math.floor(Math.random() * 100)}`,
      userName: userNames[i % userNames.length],
      rating: template.rating,
      title: template.title,
      comment: template.comment,
      date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      verified: Math.random() > 0.2,
      helpful: Math.floor(Math.random() * 10)
    };
  });
};

// Generate details for remaining products
const remainingProductIds = ['p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11', 'p12', 'p13', 'p14', 'p15', 'p16', 'p17', 'p18', 'p19', 'p20', 'p21'];

const productNameMap: Record<string, string> = {
  'p5': 'Carbon Trekking Poles',
  'p6': '30L Daypack',
  'p7': 'Titanium Cook Set',
  'p8': 'Trail Running Vest 12L',
  'p9': 'LED Headlamp 400lm',
  'p10': 'Water Filter Straw',
  'p11': 'Insulated Sleeping Pad',
  'p12': 'Hammock Single',
  'p13': 'Quick-Dry Towel L',
  'p14': 'Compact Multi-tool',
  'p15': 'GPS Watch',
  'p16': 'Power Bank 20k mAh',
  'p17': 'Ultra-light Chair',
  'p18': 'Rain Jacket',
  'p19': 'Merino Base Layer',
  'p20': 'Dry Sack 10L',
  'p21': 'Cooking Fuel Canister'
};

remainingProductIds.forEach(id => {
  if (!productDetailsData[id]) {
    productDetailsData[id] = {
      id,
      name: productNameMap[id] || `Product ${id}`,
      description: 'Quality outdoor gear for adventurers',
      fullDescription: `High-quality ${productNameMap[id]?.toLowerCase() || 'outdoor equipment'} designed for adventure enthusiasts. Built with premium materials and tested in harsh conditions.`,
      price: 1000 + Math.floor(Math.random() * 3000),
      stock: Math.floor(Math.random() * 20) + 1,
      category: 'Gear',
      image: `/images/products/${id}_main.jpg`,
      images: [`/images/products/${id}_main.jpg`],
      avgRating: 3.5 + Math.random() * 1.5,
      reviewCount: Math.floor(Math.random() * 10) + 1,
      brand: 'OutdoorPro',
      weight: '500g',
      warranty: '1 year',
      specifications: {
        'Weight': '500g',
        'Material': 'High-grade materials',
        'Warranty': '1 year',
        'Brand': 'OutdoorPro'
      },
      tags: ['outdoor', 'gear', 'adventure'],
      reviews: generateBasicReviews(id, Math.floor(Math.random() * 5) + 1)
    } as ProductDetails;
  }
});

export default productDetailsData;
