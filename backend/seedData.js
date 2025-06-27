const db = require('./firestore');

const sampleSchools = [
  {
    name: "St. Mary's High School",
    location: "Bhubaneswar, Odisha",
    category: "High",
    type: "Private",
    description: "A prestigious private high school known for academic excellence and holistic development.",
    address: "123 Main Street, Bhubaneswar",
    phone: "+91-674-1234567",
    email: "info@stmarys.edu",
    website: "www.stmarys.edu",
    averageRating: 4.5,
    reviewCount: 23,
    coordinates: { lat: 20.2961, lng: 85.8245 },
    facilities: ["Library", "Computer Lab", "Sports Ground", "Science Lab"],
    established: 1995
  },
  {
    name: "Delhi Public School",
    location: "Bhubaneswar, Odisha",
    category: "High",
    type: "Private",
    description: "Part of the renowned DPS chain, offering quality education with modern facilities.",
    address: "456 College Road, Bhubaneswar",
    phone: "+91-674-2345678",
    email: "admissions@dpsbbsr.edu",
    website: "www.dpsbbsr.edu",
    averageRating: 4.2,
    reviewCount: 18,
    coordinates: { lat: 20.2961, lng: 85.8245 },
    facilities: ["Smart Classrooms", "Auditorium", "Cafeteria", "Transport"],
    established: 2000
  },
  {
    name: "Kendriya Vidyalaya No. 1",
    location: "Bhubaneswar, Odisha",
    category: "High",
    type: "Public",
    description: "Government school providing quality education with affordable fees.",
    address: "789 Government Colony, Bhubaneswar",
    phone: "+91-674-3456789",
    email: "kv1bbsr@gmail.com",
    website: "www.kv1bbsr.edu",
    averageRating: 3.8,
    reviewCount: 15,
    coordinates: { lat: 20.2961, lng: 85.8245 },
    facilities: ["Library", "Playground", "Computer Lab"],
    established: 1985
  },
  {
    name: "Mother's Public School",
    location: "Bhubaneswar, Odisha",
    category: "Elementary",
    type: "Private",
    description: "Nurturing environment for young learners with focus on creativity and values.",
    address: "321 Lake View, Bhubaneswar",
    phone: "+91-674-4567890",
    email: "info@motherspublic.edu",
    website: "www.motherspublic.edu",
    averageRating: 4.0,
    reviewCount: 12,
    coordinates: { lat: 20.2961, lng: 85.8245 },
    facilities: ["Activity Room", "Garden", "Transport", "Medical Room"],
    established: 1990
  },
  {
    name: "DAV Public School",
    location: "Bhubaneswar, Odisha",
    category: "Middle",
    type: "Private",
    description: "DAV institution focusing on traditional values with modern education.",
    address: "654 Temple Road, Bhubaneswar",
    phone: "+91-674-5678901",
    email: "davbbsr@dav.edu",
    website: "www.davbbsr.edu",
    averageRating: 4.3,
    reviewCount: 20,
    coordinates: { lat: 20.2961, lng: 85.8245 },
    facilities: ["Library", "Science Labs", "Sports Complex", "Cafeteria"],
    established: 1992
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