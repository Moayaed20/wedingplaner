"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const user_role_enum_1 = require("./common/enums/user-role.enum");
const hall_status_enum_1 = require("./common/enums/hall-status.enum");
const booking_status_enum_1 = require("./common/enums/booking-status.enum");
const calendar_status_enum_1 = require("./common/enums/calendar-status.enum");
const user_schema_1 = require("./users/schemas/user.schema");
const hall_schema_1 = require("./halls/schemas/hall.schema");
const catering_schema_1 = require("./caterings/schemas/catering.schema");
const decoration_schema_1 = require("./decorations/schemas/decoration.schema");
const car_schema_1 = require("./cars/schemas/car.schema");
const music_schema_1 = require("./music/schemas/music.schema");
const service_schema_1 = require("./services/schemas/service.schema");
const booking_schema_1 = require("./bookings/schemas/booking.schema");
const review_schema_1 = require("./reviews/schemas/review.schema");
async function bootstrap() {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/wedding_hall_booking';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    const db = mongoose.connection;
    await db.dropDatabase();
    console.log('Dropped existing database');
    const userModel = mongoose.model(user_schema_1.User.name, user_schema_1.UserSchema);
    const hallModel = mongoose.model(hall_schema_1.Hall.name, hall_schema_1.HallSchema);
    const cateringModel = mongoose.model(catering_schema_1.Catering.name, catering_schema_1.CateringSchema);
    const decorationModel = mongoose.model(decoration_schema_1.Decoration.name, decoration_schema_1.DecorationSchema);
    const carModel = mongoose.model(car_schema_1.Car.name, car_schema_1.CarSchema);
    const musicModel = mongoose.model(music_schema_1.Music.name, music_schema_1.MusicSchema);
    const serviceModel = mongoose.model(service_schema_1.Service.name, service_schema_1.ServiceSchema);
    const bookingModel = mongoose.model(booking_schema_1.Booking.name, booking_schema_1.BookingSchema);
    const reviewModel = mongoose.model(review_schema_1.Review.name, review_schema_1.ReviewSchema);
    const hash = (pwd) => bcrypt.hashSync(pwd, 10);
    const [admin, owner, customer] = await userModel.insertMany([
        {
            name: 'Admin User',
            email: 'admin@example.com',
            password: hash('admin123'),
            role: user_role_enum_1.UserRole.ADMIN,
            phone: '555-0001',
        },
        {
            name: 'Hall Owner',
            email: 'owner@example.com',
            password: hash('owner123'),
            role: user_role_enum_1.UserRole.HALL_OWNER,
            phone: '555-0002',
        },
        {
            name: 'Alice Customer',
            email: 'alice@example.com',
            password: hash('alice123'),
            role: user_role_enum_1.UserRole.CUSTOMER,
            phone: '555-0003',
        },
    ]);
    console.log(`Created ${3} users`);
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
            images: ['https://example.com/hall1.jpg'],
            images_360: ['https://example.com/hall1-360.jpg'],
            contact: '555-1000',
            status: hall_status_enum_1.HallStatus.ACTIVE,
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
            images: ['https://example.com/hall2.jpg'],
            images_360: [],
            contact: '555-2000',
            status: hall_status_enum_1.HallStatus.ACTIVE,
            availability_calendar: [],
        },
    ]);
    console.log(`Created ${2} halls`);
    const [catering1a, catering1b, catering2a] = await cateringModel.insertMany([
        {
            hall_id: hall1._id,
            menu_name: 'Royal Buffet',
            price_per_person: 35,
            menu_type: 'Buffet',
            description: 'A rich buffet with international cuisine',
            status: hall_status_enum_1.HallStatus.ACTIVE,
        },
        {
            hall_id: hall1._id,
            menu_name: 'Plated Dinner',
            price_per_person: 45,
            menu_type: 'Plated',
            description: 'Elegant plated service',
            status: hall_status_enum_1.HallStatus.ACTIVE,
        },
        {
            hall_id: hall2._id,
            menu_name: 'Garden BBQ',
            price_per_person: 30,
            menu_type: 'Buffet',
            description: 'Outdoor BBQ experience',
            status: hall_status_enum_1.HallStatus.ACTIVE,
        },
    ]);
    const [deco1, deco2] = await decorationModel.insertMany([
        {
            hall_id: hall1._id,
            theme_name: 'Golden Elegance',
            price: 1200,
            description: 'Gold and white floral theme',
            images: ['https://example.com/deco1.jpg'],
            status: hall_status_enum_1.HallStatus.ACTIVE,
        },
        {
            hall_id: hall2._id,
            theme_name: 'Rustic Garden',
            price: 900,
            description: 'Natural rustic garden theme',
            images: ['https://example.com/deco2.jpg'],
            status: hall_status_enum_1.HallStatus.ACTIVE,
        },
    ]);
    const [car1, car2] = await carModel.insertMany([
        {
            hall_id: hall1._id,
            car_name: 'Rolls Royce Phantom',
            model: '2023',
            price: 800,
            capacity: 4,
            description: 'Luxury wedding car',
            images: ['https://example.com/car1.jpg'],
            status: hall_status_enum_1.HallStatus.ACTIVE,
        },
        {
            hall_id: hall2._id,
            car_name: 'Vintage Cadillac',
            model: '1965',
            price: 600,
            capacity: 4,
            description: 'Classic American wedding car',
            images: ['https://example.com/car2.jpg'],
            status: hall_status_enum_1.HallStatus.ACTIVE,
        },
    ]);
    const [music1, music2] = await musicModel.insertMany([
        {
            hall_id: hall1._id,
            name: 'Royal Orchestra',
            type: 'Live Band',
            price: 2500,
            description: 'Full live band performance',
            status: hall_status_enum_1.HallStatus.ACTIVE,
        },
        {
            hall_id: hall2._id,
            name: 'DJ Sunset',
            type: 'DJ',
            price: 1200,
            description: 'Professional DJ with lighting',
            status: hall_status_enum_1.HallStatus.ACTIVE,
        },
    ]);
    const [photo, cake] = await serviceModel.insertMany([
        {
            type: 'photography',
            name: 'Premium Wedding Photography',
            price: 1500,
            description: 'Full day coverage with 300 edited photos',
            images: ['https://example.com/photo.jpg'],
            status: hall_status_enum_1.HallStatus.ACTIVE,
        },
        {
            type: 'cake',
            name: 'Three-Tier Wedding Cake',
            price: 400,
            description: 'Custom decorated cake',
            images: ['https://example.com/cake.jpg'],
            status: hall_status_enum_1.HallStatus.ACTIVE,
        },
    ]);
    console.log(`Created options: ${3} caterings, ${2} decorations, ${2} cars, ${2} music, ${2} services`);
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + 30);
    eventDate.setUTCHours(0, 0, 0, 0);
    const guestCount = 150;
    const hallPrice = hall1.price_per_person * guestCount;
    const cateringTotal = (catering1a.price_per_person + catering1b.price_per_person) * guestCount;
    const totalPrice = hallPrice + cateringTotal + deco1.price + car1.price + music1.price;
    const [booking] = await bookingModel.insertMany([
        {
            customer_id: customer._id,
            hall_id: hall1._id,
            event_date: eventDate,
            guest_count: guestCount,
            status: booking_status_enum_1.BookingStatus.PENDING,
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
    hall1.availability_calendar.push({ date: eventDate, status: calendar_status_enum_1.CalendarStatus.PENDING });
    await hall1.save();
    console.log(`Created 1 booking (ID: ${booking._id})`);
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
//# sourceMappingURL=seed.js.map