import argon2 from 'argon2';

console.log(await argon2.hash('strongPassword123', {hashLenght: 64, timeCost: 2 ** 8}));
