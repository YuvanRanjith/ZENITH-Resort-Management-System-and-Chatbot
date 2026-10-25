export const IMAGES = {
  hero: 'https://images.pexels.com/photos/23696832/pexels-photo-23696832.jpeg?auto=compress&cs=tinysrgb&w=1920',
  heroSecondary: 'https://images.pexels.com/photos/11118953/pexels-photo-11118953.jpeg?auto=compress&cs=tinysrgb&w=1920',
  pool: 'https://images.pexels.com/photos/20975727/pexels-photo-20975727.jpeg?auto=compress&cs=tinysrgb&w=1600',
  aerial: 'https://images.pexels.com/photos/7748791/pexels-photo-7748791.jpeg?auto=compress&cs=tinysrgb&w=1600',
  aerial2: 'https://images.pexels.com/photos/417351/pexels-photo-417351.jpeg?auto=compress&cs=tinysrgb&w=1600',
  spa: 'https://images.pexels.com/photos/31234756/pexels-photo-31234756.jpeg?auto=compress&cs=tinysrgb&w=1600',
  spa2: 'https://images.pexels.com/photos/31234754/pexels-photo-31234754.jpeg?auto=compress&cs=tinysrgb&w=1600',
  suite1: 'https://images.pexels.com/photos/8082217/pexels-photo-8082217.jpeg?auto=compress&cs=tinysrgb&w=1600',
  suite2: 'https://images.pexels.com/photos/8134808/pexels-photo-8134808.jpeg?auto=compress&cs=tinysrgb&w=1600',
  suite3: 'https://images.pexels.com/photos/3688261/pexels-photo-3688261.jpeg?auto=compress&cs=tinysrgb&w=1600',
  suite4: 'https://images.pexels.com/photos/34645081/pexels-photo-34645081.jpeg?auto=compress&cs=tinysrgb&w=1600',
  suite5: 'https://images.pexels.com/photos/6466496/pexels-photo-6466496.jpeg?auto=compress&cs=tinysrgb&w=1600',
};

export const ROOM_IMAGES: Record<string, string> = {
  'Standard Room': 'https://images.pexels.com/photos/3688261/pexels-photo-3688261.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Deluxe Room': 'https://images.pexels.com/photos/6466496/pexels-photo-6466496.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Premium Suite': 'https://images.pexels.com/photos/8134808/pexels-photo-8134808.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Executive Suite': 'https://images.pexels.com/photos/8082217/pexels-photo-8082217.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Presidential Suite': 'https://images.pexels.com/photos/34645081/pexels-photo-34645081.jpeg?auto=compress&cs=tinysrgb&w=1200',
};

export function roomImage(room: { image_url: string | null; room_type: string }): string {
  return room.image_url || ROOM_IMAGES[room.room_type] || IMAGES.suite1;
}
