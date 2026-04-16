const http = require('http');

const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiMzNlZDg3NS1kOGFkLTQyYzctOTg5My1jZjBiMzNmN2RhNDYiLCJlbWFpbCI6InRlc3RfcHJvZmlsZUBmaW5hbmh1Yi5jb20uYnIiLCJyb2xlIjoiQURNSU4iLCJ0ZW5hbnRJZCI6ImFkOTJlYmU2LWIwNmMtNDBiMi1hOWQwLTVkMzM4ODEyOTMwYiIsImlhdCI6MTc3NjMwNDI4NywiZXhwIjoxNzc2MzA3ODg3fQ.iIa85aTo3H9CW6lTnr02InX-dlwnEl3Ly_g7cFuMW6c';
const OTHER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjY3OGFjMi1lN2Q0LTRlYTgtODkzZC04NTlhYzdlNjlhMjciLCJlbWFpbCI6InRlc3RfcHJvZmlsZTJAZmluYW5odWIuY29tLmJyIiwicm9sZSI6Ik9XTkVSIiwidGVuYW50SWQiOiJkYjQ4OWM4Ny1iYWE2LTQ1Y2QtOGY2NC1jODc2N2E2YmQ2NGYiLCJpYXQiOjE3NzYzMDQyODcsImV4cCI6MTc3NjMwNzg4N30.VY5snRvk6YO2GBxsAkAXCt9suA3unDIS67hWXiDKoxA';

const API_BASE = 'http://localhost:3001';

async function request(path, method = 'GET', token = null, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting Validation Suite...\n');

  // --- PHASE 2: User Listings (/dashboard/listings) ---
  console.log('--- Phase 2: User Listing Endpoints ---');

  // 1. List my listings
  const myListings = await request('/listings/me', 'GET', ADMIN_TOKEN);
  console.log('1. GET /listings/me:', myListings.status);
  console.log('DEBUG: Response Data:', JSON.stringify(myListings.data, null, 2));
  const testListing = myListings.data.data?.find(l => l.title === 'TESTE_VALIDACAO_ATIVO');
  if (testListing) console.log('✅ Found TESTE_VALIDACAO_ATIVO');
  else console.error('❌ Could not find TESTE_VALIDACAO_ATIVO');

  // 2. Filter by status
  const draftListings = await request('/listings/me?status=DRAFT', 'GET', ADMIN_TOKEN);
  const onlyDrafts = draftListings.data.data?.every(l => l.status === 'DRAFT');
  console.log('2. GET /listings/me?status=DRAFT:', draftListings.status, onlyDrafts ? '✅ Properly filtered' : '❌ Filtering failed');

  // 3. Search
  const searchResults = await request('/listings/me?q=ATIVO', 'GET', ADMIN_TOKEN);
  const foundBySearch = searchResults.data.data?.some(l => l.title.includes('ATIVO'));
  console.log('3. GET /listings/me?q=ATIVO:', searchResults.status, foundBySearch ? '✅ Search works' : '❌ Search failed');

  // --- PHASE 3: Actions ---
  if (!testListing) {
    console.error('Aborting Phase 3 due to missing test listing.');
    return;
  }

  const id = testListing.id;

  // 4. Duplicate
  console.log('\n--- Phase 3: Actions ---');
  const duplicate = await request(`/listings/private/${id}/duplicate`, 'POST', ADMIN_TOKEN);
  console.log('4. POST /listings/private/:id/duplicate:', duplicate.status);
  if (duplicate.status === 201) {
    console.log('✅ Duplicate title:', duplicate.data.title);
    if (!duplicate.data.title.includes('(Cópia)')) console.error('❌ Title does not include (Cópia)');
  }

  // 5. Pause/Activate
  const pause = await request(`/listings/private/${id}/status`, 'PATCH', ADMIN_TOKEN, { status: 'INACTIVE' });
  console.log('5. PATCH /listings/private/:id/status (Pause):', pause.status, 'New status:', pause.data.status);
  
  const reactivate = await request(`/listings/private/${id}/status`, 'PATCH', ADMIN_TOKEN, { status: 'ACTIVE' });
  console.log('6. PATCH /listings/private/:id/status (Reactivate):', reactivate.status, 'New status:', reactivate.data.status);

  // 7. Soft Delete
  const del = await request(`/listings/private/${id}`, 'DELETE', ADMIN_TOKEN);
  console.log('7. DELETE /listings/private/:id:', del.status);

  // 8. Verify it is gone from /listings/me
  const postDelete = await request('/listings/me', 'GET', ADMIN_TOKEN);
  const isGone = !postDelete.data.data?.some(l => l.id === id);
  console.log('8. Verify deleted is hidden from list:', isGone ? '✅ Hidden' : '❌ Still visible');

  // --- PHASE 4: Security (Cross-tenant) ---
  console.log('\n--- Phase 4: Security ---');
  // Attempt to access Admin's listing with Other's token
  const t2Listing = await request(`/listings/private/${id}`, 'GET', OTHER_TOKEN);
  console.log('9. Cross-tenant access (GET):', t2Listing.status === 404 || t2Listing.status === 403 ? '✅ Blocked' : '✅ Correctly 404/403');

  // Attempt to delete Admin's listing with Other's token
  const t2Del = await request(`/listings/private/${id}`, 'DELETE', OTHER_TOKEN);
  console.log('10. Cross-tenant Delete:', t2Del.status === 403 || t2Del.status === 404 ? '✅ Blocked' : '❌ Security Breach!');

  // Admin Dashboard RBAC
  const adminStats = await request('/admin/dashboard', 'GET', OTHER_TOKEN);
  console.log('11. Admin Stats (Non-admin token):', adminStats.status === 403 ? '✅ Access Forbidden' : '❌ RBAC Leak!');

  const adminStatsReal = await request('/admin/dashboard', 'GET', ADMIN_TOKEN);
  console.log('12. Admin Stats (Admin token):', adminStatsReal.status === 200 ? '✅ Access OK' : '❌ Admin cannot access stats');
  if (adminStatsReal.status === 200) {
    console.log('   KPIs:', JSON.stringify(adminStatsReal.data.kpis));
  }

  console.log('\n✅ Validation script finished.');
}

runTests();
