/*
# ZENITH - Seed 20 demonstration rooms

DEMONSTRATION DATA - clearable before production.
Seeds 20 rooms across the five categories (4 each):
- Standard Room (101-104)
- Deluxe Room (201-204)
- Premium Suite (301-304)
- Executive Suite (401-404)
- Presidential Suite (501-504)
Prices in INR. Amenities per category. Image URLs are placeholders (editable).
*/

insert into public.rooms (room_number, room_type, description, nightly_price, capacity, amenities, image_url, operational_status)
values
-- Standard Room
('101','Standard Room','Cozy 28 sqm room with a queen bed, garden view, and en-suite bathroom. Ideal for solo travellers or short stays.', 4500, 2, array['Free Wi-Fi','Air Conditioning','Flat-screen TV','Tea/Coffee Maker','Daily Housekeeping'], 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg', 'available'),
('102','Standard Room','Calm 28 sqm room with twin beds and a work desk for business travellers.', 4500, 2, array['Free Wi-Fi','Air Conditioning','Flat-screen TV','Tea/Coffee Maker','Daily Housekeeping'], 'https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg', 'available'),
('103','Standard Room','Quiet interior-facing standard room with blackout curtains and a reading nook.', 4800, 2, array['Free Wi-Fi','Air Conditioning','Flat-screen TV','Tea/Coffee Maker','Daily Housekeeping'], 'https://images.pexels.com/photos/2029698/pexels-photo-2029698.jpeg', 'available'),
('104','Standard Room','Ground-floor standard room with patio access and accessible layout.', 4800, 2, array['Free Wi-Fi','Air Conditioning','Flat-screen TV','Tea/Coffee Maker','Daily Housekeeping','Wheelchair Accessible'], 'https://images.pexels.com/photos/3033/pexels-photo.jpg', 'maintenance'),
-- Deluxe Room
('201','Deluxe Room','Spacious 38 sqm deluxe room with a king bed, lounge area, and pool view.', 8500, 3, array['Free Wi-Fi','Mini Bar','King Bed','Pool View','Bathrobe & Slippers','Smart TV'], 'https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg', 'available'),
('202','Deluxe Room','Contemporary deluxe room with a rain shower and a private balcony overlooking the gardens.', 8800, 3, array['Free Wi-Fi','Mini Bar','King Bed','Pool View','Bathrobe & Slippers','Smart TV'], 'https://images.pexels.com/photos/210265/pexels-photo-210265.jpeg', 'available'),
('203','Deluxe Room','Family-friendly deluxe room with a separate kids'' nook and a sofa bed.', 9200, 4, array['Free Wi-Fi','Mini Bar','King Bed','Pool View','Bathrobe & Slippers','Smart TV','Sofa Bed'], 'https://images.pexels.com/photos/1029036/pexels-photo-1029036.jpeg', 'available'),
('204','Deluxe Room','Top-floor deluxe room with vaulted ceilings and panoramic garden views.', 8800, 3, array['Free Wi-Fi','Mini Bar','King Bed','Pool View','Bathrobe & Slippers','Smart TV'], 'https://images.pexels.com/photos/2631746/pexels-photo-2631746.jpeg', 'available'),
-- Premium Suite
('301','Premium Suite','Elegant 55 sqm suite with a separate living room, soaking tub, and ocean breeze.', 16000, 3, array['Free Wi-Fi','Living Room','Soaking Tub','Nespresso Machine','Bathrobe & Slippers','Smart TV','Mini Bar'], 'https://images.pexels.com/photos/1743231/pexels-photo-1743231.jpeg', 'available'),
('302','Premium Suite','Premium suite with a private terrace, daybed, and a marble bathroom.', 16500, 3, array['Free Wi-Fi','Living Room','Private Terrace','Nespresso Machine','Bathrobe & Slippers','Smart TV','Mini Bar'], 'https://images.pexels.com/photos/2467558/pexels-photo-2467558.jpeg', 'available'),
('303','Premium Suite','Corner premium suite with dual-aspect windows and a writing desk.', 16500, 3, array['Free Wi-Fi','Living Room','Soaking Tub','Nespresso Machine','Bathrobe & Slippers','Smart TV','Mini Bar'], 'https://images.pexels.com/photos/3144580/pexels-photo-3144580.jpeg', 'available'),
('304','Premium Suite','Premium suite with a connecting door to 303 for families.', 17000, 4, array['Free Wi-Fi','Living Room','Soaking Tub','Nespresso Machine','Bathrobe & Slippers','Smart TV','Mini Bar','Connecting Room'], 'https://images.pexels.com/photos/3651057/pexels-photo-3651057.jpeg', 'available'),
-- Executive Suite
('401','Executive Suite','Refined 75 sqm executive suite with a dining area, study, and butler service on request.', 28000, 4, array['Free Wi-Fi','Dining Area','Private Study','Butler Service','Premium Bedding','Smart TV','Mini Bar','Espresso Machine'], 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg', 'available'),
('402','Executive Suite','Executive suite with a panoramic lounge and a walk-in dressing room.', 29000, 4, array['Free Wi-Fi','Dining Area','Walk-in Closet','Butler Service','Premium Bedding','Smart TV','Mini Bar','Espresso Machine'], 'https://images.pexels.com/photos/2101916/pexels-photo-2101916.jpeg', 'available'),
('403','Executive Suite','Quiet executive suite with a private library nook and lounge seating for four.', 29500, 4, array['Free Wi-Fi','Dining Area','Library Nook','Butler Service','Premium Bedding','Smart TV','Mini Bar','Espresso Machine'], 'https://images.pexels.com/photos/261395/pexels-photo-261395.jpeg', 'available'),
('404','Executive Suite','Two-bedroom executive suite with a shared living room, ideal for executives travelling together.', 32000, 5, array['Free Wi-Fi','Dining Area','Two Bedrooms','Butler Service','Premium Bedding','Smart TV','Mini Bar','Espresso Machine'], 'https://images.pexels.com/photos/2029722/pexels-photo-2029722.jpeg', 'available'),
-- Presidential Suite
('501','Presidential Suite','The Zenith Presidential Suite: 160 sqm of curated luxury with a grand piano, private bar, and panoramic ocean view.', 75000, 6, array['Free Wi-Fi','Grand Piano','Private Bar','Private Chef on Request','Panoramic Ocean View','Butler Service','Jacuzzi','Smart TV','Espresso Machine','Walk-in Closet'], 'https://images.pexels.com/photos/1450363/pexels-photo-1450363.jpeg', 'available'),
('502','Presidential Suite','Sky-level presidential suite with a private terrace hot tub and sunset views.', 78000, 6, array['Free Wi-Fi','Private Terrace','Hot Tub','Private Chef on Request','Sunset View','Butler Service','Smart TV','Espresso Machine','Walk-in Closet'], 'https://images.pexels.com/photos/2467558/pexels-photo-2467558.jpeg', 'available'),
('503','Presidential Suite','Garden-wing presidential suite with a private meditation room and library.', 76000, 6, array['Free Wi-Fi','Meditation Room','Library','Private Chef on Request','Garden View','Butler Service','Smart TV','Espresso Machine','Walk-in Closet'], 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg', 'available'),
('504','Presidential Suite','The Crown: penthouse presidential suite with a private rooftop lounge and plunge pool.', 95000, 8, array['Free Wi-Fi','Rooftop Lounge','Plunge Pool','Private Chef on Request','Panoramic View','Butler Service','Smart TV','Espresso Machine','Walk-in Closet'], 'https://images.pexels.com/photos/3144580/pexels-photo-3144580.jpeg', 'available')
on conflict (room_number) do nothing;
