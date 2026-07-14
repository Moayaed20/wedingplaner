import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { UserRole } from './common/enums/user-role.enum';
import { HallStatus } from './common/enums/hall-status.enum';
import { BookingStatus } from './common/enums/booking-status.enum';
import { CalendarStatus } from './common/enums/calendar-status.enum';
import { User, UserSchema } from './users/schemas/user.schema';
import { Hall, HallSchema } from './halls/schemas/hall.schema';
import { Catering, CateringSchema } from './caterings/schemas/catering.schema';
import { Decoration, DecorationSchema } from './decorations/schemas/decoration.schema';
import { Car, CarSchema } from './cars/schemas/car.schema';
import { Music, MusicSchema } from './music/schemas/music.schema';
import { Service, ServiceSchema } from './services/schemas/service.schema';
import { Booking, BookingSchema } from './bookings/schemas/booking.schema';
import { Review, ReviewSchema } from './reviews/schemas/review.schema';

async function bootstrap() {
  const mongoUri =
    process.env.MONGO_URI || 'mongodb://localhost:27017/wedding_hall_booking';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  const db = mongoose.connection;

  // Drop existing data so the seed is repeatable
  await db.dropDatabase();
  console.log('Dropped existing database');

  const userModel = mongoose.model(User.name, UserSchema);
  const hallModel = mongoose.model(Hall.name, HallSchema);
  const cateringModel = mongoose.model(Catering.name, CateringSchema);
  const decorationModel = mongoose.model(Decoration.name, DecorationSchema);
  const carModel = mongoose.model(Car.name, CarSchema);
  const musicModel = mongoose.model(Music.name, MusicSchema);
  const serviceModel = mongoose.model(Service.name, ServiceSchema);
  const bookingModel = mongoose.model(Booking.name, BookingSchema);
  const reviewModel = mongoose.model(Review.name, ReviewSchema);

  const hash = (pwd: string) => bcrypt.hashSync(pwd, 10);

  // Users
  const [admin, owner, customer] = await userModel.insertMany([
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hash('admin123'),
      role: UserRole.ADMIN,
      phone: '555-0001',
    },
    {
      name: 'Hall Owner',
      email: 'owner@example.com',
      password: hash('owner123'),
      role: UserRole.HALL_OWNER,
      phone: '555-0002',
    },
    {
      name: 'Alice Customer',
      email: 'alice@example.com',
      password: hash('alice123'),
      role: UserRole.CUSTOMER,
      phone: '555-0003',
    },
  ]);
  console.log(`Created ${3} users`);

  // Halls
  const [hall1, hall2] = await hallModel.insertMany([
    {
      owner_id: owner._id,
      name: 'Royal Palace Hall',
      address: '123 Royal Ave',
      city: 'New York',
      postcode: '10001',
      price_per_person: 75,
      min_capacity: 100,
      max_capacity: 500,
      rating: 4.5,
      images: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=600&fit=crop'],
      images_360: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop'],
      contact: '555-1000',
      status: HallStatus.ACTIVE,
      availability_calendar: [],
    },
    {
      owner_id: owner._id,
      name: 'Garden View Hall',
      address: '456 Garden Rd',
      city: 'Los Angeles',
      postcode: '90001',
      price_per_person: 60,
      min_capacity: 50,
      max_capacity: 300,
      rating: 4,
      images: ['https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800&h=600&fit=crop'],
      images_360: [],
      contact: '555-2000',
      status: HallStatus.ACTIVE,
      availability_calendar: [],
    },
  ]);
  console.log(`Created ${2} halls`);

  // Caterings
  const [catering1a, catering1b, catering2a] = await cateringModel.insertMany([
    {
      hall_id: hall1._id,
      menu_name: 'Royal Buffet',
      price_per_person: 35,
      menu_type: 'Buffet',
      description: 'A rich buffet with international cuisine',
      status: HallStatus.ACTIVE,
    },
    {
      hall_id: hall1._id,
      menu_name: 'Plated Dinner',
      price_per_person: 45,
      menu_type: 'Plated',
      description: 'Elegant plated service',
      status: HallStatus.ACTIVE,
    },
    {
      hall_id: hall2._id,
      menu_name: 'Garden BBQ',
      price_per_person: 30,
      menu_type: 'Buffet',
      description: 'Outdoor BBQ experience',
      status: HallStatus.ACTIVE,
    },
  ]);

  // Decorations
  const [deco1, deco2] = await decorationModel.insertMany([
    {
      hall_id: hall1._id,
      theme_name: 'Golden Elegance',
      price: 1200,
      description: 'Gold and white floral theme',
      images: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=600&fit=crop'],
      status: HallStatus.ACTIVE,
    },
    {
      hall_id: hall1._id,
      theme_name: 'Rose Romance',
      price: 950,
      description: 'Soft pink and rose petal theme',
      images: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop'],
      status: HallStatus.ACTIVE,
    },
    {
      hall_id: hall1._id,
      theme_name: 'Modern Minimalist',
      price: 750,
      description: 'Clean white and silver modern look',
      images: ['https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800&h=600&fit=crop'],
      status: HallStatus.ACTIVE,
    },
    {
      hall_id: hall2._id,
      theme_name: 'Rustic Garden',
      price: 900,
      description: 'Natural rustic garden theme',
      images: ['https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800&h=600&fit=crop'],
      status: HallStatus.ACTIVE,
    },
    {
      hall_id: hall2._id,
      theme_name: 'Bohemian Dream',
      price: 800,
      description: 'Boho style with macrame and candles',
      images: ['https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&h=600&fit=crop'],
      status: HallStatus.ACTIVE,
    },
  ]);

  // Cars
  const [car1, car2] = await carModel.insertMany([
    {
      hall_id: hall1._id,
      car_name: 'Rolls Royce Phantom',
      model: '2023',
      price: 800,
      capacity: 4,
      description: 'Luxury wedding car',
      images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop'],
      status: HallStatus.ACTIVE,
    },
    {
      hall_id: hall1._id,
      car_name: 'Mercedes S-Class',
      model: '2022',
      price: 500,
      capacity: 4,
      description: 'Elegant executive sedan',
      images: ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop'],
      status: HallStatus.ACTIVE,
    },
    {
      hall_id: hall1._id,
      car_name: 'Vintage Bentley',
      model: '1970',
      price: 650,
      capacity: 4,
      description: 'Classic vintage Bentley',
      images: ['https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop'],
      status: HallStatus.ACTIVE,
    },
    {
      hall_id: hall2._id,
      car_name: 'Vintage Cadillac',
      model: '1965',
      price: 600,
      capacity: 4,
      description: 'Classic American wedding car',
      images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop'],
      status: HallStatus.ACTIVE,
    },
    {
      hall_id: hall2._id,
      car_name: 'White Limousine',
      model: '2020',
      price: 700,
      capacity: 8,
      description: 'Stretch limousine for the wedding party',
      images: ['https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&h=600&fit=crop'],
      status: HallStatus.ACTIVE,
    },
  ]);

  // Music
  const [music1, music2] = await musicModel.insertMany([
    {
      hall_id: hall1._id,
      name: 'Royal Orchestra',
      type: 'Live Band',
      price: 2500,
      description: 'Full live band performance',
      status: HallStatus.ACTIVE,
    },
    {
      hall_id: hall2._id,
      name: 'DJ Sunset',
      type: 'DJ',
      price: 1200,
      description: 'Professional DJ with lighting',
      status: HallStatus.ACTIVE,
    },
  ]);

  // Global Services
  const [photo, cake] = await serviceModel.insertMany([
    {
      type: 'photography',
      name: 'Premium Wedding Photography',
      price: 1500,
      description: 'Full day coverage with 300 edited photos',
      images: ['https://example.com/photo.jpg'],
      status: HallStatus.ACTIVE,
    },
    {
      type: 'cake',
      name: 'Three-Tier Wedding Cake',
      price: 400,
      description: 'Custom decorated cake',
      images: ['https://example.com/cake.jpg'],
      status: HallStatus.ACTIVE,
    },
  ]);
  console.log(`Created options: 3 caterings, 5 decorations, 5 cars, 2 music, 2 services`);

  // Bookings
  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() + 30);
  eventDate.setUTCHours(0, 0, 0, 0);

  const guestCount = 150;
  const hallPrice = hall1.price_per_person * guestCount;
  const cateringTotal =
    (catering1a.price_per_person + catering1b.price_per_person) * guestCount;
  const totalPrice = hallPrice + cateringTotal + deco1.price + car1.price + music1.price;

  const [booking] = await bookingModel.insertMany([
    {
      customer_id: customer._id,
      hall_id: hall1._id,
      event_date: eventDate,
      guest_count: guestCount,
      status: BookingStatus.PENDING,
      total_price: totalPrice,
      selected_caterings: [
        {
          catering_id: catering1a._id,
          name: 'Royal Buffet',
          price_per_person: catering1a.price_per_person,
          total: catering1a.price_per_person * guestCount,
        },
        {
          catering_id: catering1b._id,
          name: 'Plated Dinner',
          price_per_person: catering1b.price_per_person,
          total: catering1b.price_per_person * guestCount,
        },
      ],
      selected_decoration_id: deco1._id,
      selected_car_id: car1._id,
      selected_music_id: music1._id,
      qr_code: null,
    },
  ]);

  hall1.availability_calendar.push({ date: eventDate, status: CalendarStatus.PENDING });
  await hall1.save();
  console.log(`Created 1 booking (ID: ${booking._id})`);

  // Reviews
  await reviewModel.insertMany([
    {
      user_id: customer._id,
      hall_id: hall1._id,
      rating: 5,
      review_text: 'Absolutely beautiful venue and great service!',
    },
    {
      user_id: customer._id,
      hall_id: hall2._id,
      rating: 4,
      review_text: 'Lovely garden atmosphere.',
    },
  ]);
  console.log('Created 2 reviews');

  console.log('\nSeed complete! Sample login credentials:');
  console.log('  admin@example.com    / admin123');
  console.log('  owner@example.com    / owner123');
  console.log('  alice@example.com    / alice123');

  await mongoose.disconnect();
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
