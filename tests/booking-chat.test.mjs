import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validDate, validateStay, stayEstimate, localDate } from '../src/lib/booking-chat.ts';
const stay={checkIn:'2026-11-01',checkOut:'2026-11-03',guests:2,category:''};
test('chat rejects invalid calendar dates, past stays and invalid guest counts',()=>{
 assert.equal(validDate('2026-02-30'),false);
 assert.equal(validDate('2028-02-29'),true);
 assert.equal(validDate('next Friday'),false);
 assert.match(validateStay({...stay,checkIn:'2026-10-24'},'2026-10-25'),/today or later/);
 assert.match(validateStay({...stay,checkOut:stay.checkIn},'2026-10-25'),/after check-in/);
 for(const guests of [0,21,2.5,NaN]) assert.match(validateStay({...stay,guests},'2026-10-25'),/whole guest count/);
 assert.equal(validateStay(stay,'2026-10-25'),null);
});
test('chat estimate preserves calendar nights and rounds 3% tax in paise',()=>{
 assert.deepEqual(stayEstimate(stay,4500),{nights:2,base:9000,tax:270,total:9270});
 assert.deepEqual(stayEstimate({...stay,checkOut:'2026-11-02'},99.99),{nights:1,base:99.99,tax:3,total:102.99});
 assert.equal(stayEstimate({...stay,checkIn:'2026-03-07',checkOut:'2026-03-10'},100).nights,3);
 assert.equal(localDate(new Date(2026,9,25,23,30)),'2026-10-25');
});
