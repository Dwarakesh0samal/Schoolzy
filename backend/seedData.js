const db = require('./firestore');

const sampleSchools = [
  {
    name: "St. Mary's High School",
    location: "Bhubaneswar, Odisha",
    city: "Bhubaneswar",
    state: "Odisha",
    category: "High",
    type: "Private",
    description: "A prestigious private high school known for academic excellence and holistic development.",
    address: "123 Main Street, Bhubaneswar",
    phone: "+91-674-1234567",
    email: "info@stmarys.edu",
    website: "www.stmarys.edu",
    averageRating: 4.5,
    reviewCount: 23,
    latitude: 20.2961,
    longitude: 85.8245,
    facilities: ["Library", "Computer Lab", "Sports Ground", "Science Lab"],
    established: 1995
  },
  {
    name: "Delhi Public School",
    location: "Bhubaneswar, Odisha",
    city: "Bhubaneswar",
    state: "Odisha",
    category: "High",
    type: "Private",
    description: "Part of the renowned DPS chain, offering quality education with modern facilities.",
    address: "456 College Road, Bhubaneswar",
    phone: "+91-674-2345678",
    email: "admissions@dpsbbsr.edu",
    website: "www.dpsbbsr.edu",
    averageRating: 4.2,
    reviewCount: 18,
    latitude: 20.3000,
    longitude: 85.8200,
    facilities: ["Smart Classrooms", "Auditorium", "Cafeteria", "Transport"],
    established: 2000
  },
  {
    name: "Kendriya Vidyalaya No. 1",
    location: "Bhubaneswar, Odisha",
    city: "Bhubaneswar",
    state: "Odisha",
    category: "High",
    type: "Public",
    description: "Government school providing quality education with affordable fees.",
    address: "789 Government Colony, Bhubaneswar",
    phone: "+91-674-3456789",
    email: "kv1bbsr@gmail.com",
    website: "www.kv1bbsr.edu",
    averageRating: 3.8,
    reviewCount: 15,
    latitude: 20.3100,
    longitude: 85.8300,
    facilities: ["Library", "Playground", "Computer Lab"],
    established: 1985
  },
  {
    name: "Mother's Public School",
    location: "Bhubaneswar, Odisha",
    city: "Bhubaneswar",
    state: "Odisha",
    category: "Elementary",
    type: "Private",
    description: "Nurturing environment for young learners with focus on creativity and values.",
    address: "321 Lake View, Bhubaneswar",
    phone: "+91-674-4567890",
    email: "info@motherspublic.edu",
    website: "www.motherspublic.edu",
    averageRating: 4.0,
    reviewCount: 12,
    latitude: 20.2900,
    longitude: 85.8100,
    facilities: ["Activity Room", "Garden", "Transport", "Medical Room"],
    established: 1990
  },
  {
    name: "DAV Public School",
    location: "Bhubaneswar, Odisha",
    city: "Bhubaneswar",
    state: "Odisha",
    category: "Middle",
    type: "Private",
    description: "DAV institution focusing on traditional values with modern education.",
    address: "654 Temple Road, Bhubaneswar",
    phone: "+91-674-5678901",
    email: "davbbsr@dav.edu",
    website: "www.davbbsr.edu",
    averageRating: 4.3,
    reviewCount: 20,
    latitude: 20.3050,
    longitude: 85.8150,
    facilities: ["Library", "Science Labs", "Sports Complex", "Cafeteria"],
    established: 1992
  },
  {
    name: "Delhi Public School R.K. Puram",
    location: "New Delhi, Delhi",
    city: "New Delhi",
    state: "Delhi",
    category: "High",
    type: "Private",
    description: "One of the most prestigious schools in Delhi with excellent academic records.",
    address: "Dr. S. Radhakrishnan Marg, R.K. Puram, New Delhi",
    phone: "+91-11-26171234",
    email: "dpsrkp@dpsrkp.org",
    website: "www.dpsrkp.org",
    averageRating: 4.7,
    reviewCount: 45,
    latitude: 28.6139,
    longitude: 77.2090,
    facilities: ["Smart Classrooms", "Auditorium", "Sports Complex", "Science Labs", "Library"],
    established: 1972
  },
  {
    name: "St. Xavier's College",
    location: "Mumbai, Maharashtra",
    city: "Mumbai",
    state: "Maharashtra",
    category: "College",
    type: "Private",
    description: "Premier educational institution known for academic excellence and cultural activities.",
    address: "5, Mahapalika Marg, Mumbai",
    phone: "+91-22-22621361",
    email: "info@xaviers.edu",
    website: "www.xaviers.edu",
    averageRating: 4.6,
    reviewCount: 38,
    latitude: 18.9290,
    longitude: 72.8340,
    facilities: ["Library", "Computer Center", "Sports Ground", "Auditorium", "Cafeteria"],
    established: 1869
  },
  {
    name: "Kendriya Vidyalaya IIT Madras",
    location: "Chennai, Tamil Nadu",
    city: "Chennai",
    state: "Tamil Nadu",
    category: "High",
    type: "Public",
    description: "Quality education with focus on science and technology.",
    address: "IIT Madras Campus, Chennai",
    phone: "+91-44-22578234",
    email: "kv.iitm@gmail.com",
    website: "www.kviitm.edu",
    averageRating: 4.1,
    reviewCount: 22,
    latitude: 12.9716,
    longitude: 80.0389,
    facilities: ["Science Labs", "Computer Lab", "Library", "Sports Ground"],
    established: 1975
  },
  {
    name: "La Martiniere for Girls",
    location: "Kolkata, West Bengal",
    city: "Kolkata",
    state: "West Bengal",
    category: "High",
    type: "Private",
    description: "Historic school with excellent academic and extracurricular programs.",
    address: "11, Loudon Street, Kolkata",
    phone: "+91-33-22878234",
    email: "info@lamartiniereforgirls.edu",
    website: "www.lamartiniereforgirls.edu",
    averageRating: 4.4,
    reviewCount: 31,
    latitude: 22.5726,
    longitude: 88.3639,
    facilities: ["Library", "Science Labs", "Sports Complex", "Auditorium"],
    established: 1836
  },
  {
    name: "St. Joseph's Public School",
    location: "Bangalore, Karnataka",
    city: "Bangalore",
    state: "Karnataka",
    category: "High",
    type: "Private",
    description: "Modern education with focus on holistic development and values.",
    address: "Residency Road, Bangalore",
    phone: "+91-80-22223456",
    email: "info@stjosephs.edu",
    website: "www.stjosephs.edu",
    averageRating: 4.3,
    reviewCount: 28,
    latitude: 12.9716,
    longitude: 77.5946,
    facilities: ["Smart Classrooms", "Library", "Sports Ground", "Computer Lab"],
    established: 1980
  }
];

async function seedSchools() {
  try {
    console.log('Starting to seed schools data...');
    
    for (const school of sampleSchools) {
      await db.collection('schools').add({
        ...school,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log(`Added school: ${school.name}`);
    }
    
    console.log('Schools data seeded successfully!');
  } catch (error) {
    console.error('Error seeding schools:', error);
  }
}

// Add some sample users
const sampleUsers = [
  {
    name: "John Doe",
    email: "john@example.com",
    password: "password123", // In production, this should be hashed
    profile_picture: "https://via.placeholder.com/150/667eea/ffffff?text=JD",
    bio: "Parent looking for the best school for my child",
    role: "user",
    createdAt: new Date().toISOString()
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    password: "password123",
    profile_picture: "https://via.placeholder.com/150/667eea/ffffff?text=JS",
    bio: "Education enthusiast and parent",
    role: "user",
    createdAt: new Date().toISOString()
  }
];

async function seedUsers() {
  try {
    console.log('Starting to seed users data...');
    
    for (const user of sampleUsers) {
      await db.collection('users').add(user);
      console.log(`Added user: ${user.name}`);
    }
    
    console.log('Users data seeded successfully!');
  } catch (error) {
    console.error('Error seeding users:', error);
  }
}

// Run the seeding
async function seedAll() {
  await seedSchools();
  await seedUsers();
  console.log('All data seeded successfully!');
  process.exit(0);
}

// Run if this file is executed directly
if (require.main === module) {
  seedAll();
}

module.exports = { seedSchools, seedUsers, seedAll }; 