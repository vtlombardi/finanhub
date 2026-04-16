const jwt = require('jsonwebtoken');

const SECRET = 'jwt_secret_dev';

function generateToken(userId, email, role, tenantId) {
  return jwt.sign(
    { sub: userId, email, role, tenantId },
    SECRET,
    { expiresIn: '1h' }
  );
}

const adminToken = generateToken(
  'b33ed875-d8ad-42c7-9893-cf0b33f7da46',
  'test_profile@finanhub.com.br',
  'ADMIN',
  'ad92ebe6-b06c-40b2-a9d0-5d338812930b'
);

const otherToken = generateToken(
  '12678ac2-e7d4-4ea8-893d-859ac7e69a27',
  'test_profile2@finanhub.com.br',
  'OWNER',
  'db489c87-baa6-45cd-8f64-c8767a6bd64f'
);

console.log('ADMIN_TOKEN=' + adminToken);
console.log('OTHER_TOKEN=' + otherToken);
