const API_URL = 'http://localhost:3001';
const CREDENTIALS = {
  email: 'test@finanhub.com.br',
  password: 'Homolog123!'
};

async function run() {
  try {
    console.log('--- STARTING VALIDATION (FETCH NATIVE) ---');
    
    // 1. Login
    console.log('1. Logging in...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(CREDENTIALS)
    });
    
    if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status}`);
    const loginData = await loginRes.json();
    const token = loginData.access_token;
    const authHeader = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
    console.log('   Login successful.');

    // 2. Create Listing
    console.log('2. Creating temporary listing...');
    const createRes = await fetch(`${API_URL}/listings/private`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({
        title: `HOMOLOG_LIFECYCLE_TEST_${Date.now()}`,
        description: 'Test description',
        categoryId: 'b0941f12-7181-4a90-927d-6a4c653a7bad', // HOMOLOG_CATEGORY
        companyId: 'f62722d1-b7b9-478a-9ad5-572469715b31', // HOMOLOG_EMPRESA_SELLER
        price: 500000,
        state: 'SP',
        city: 'Sao Paulo'
      })
    });
    
    if (!createRes.ok) {
        const errData = await createRes.json();
        throw new Error(`Create failed: ${createRes.status} - ${JSON.stringify(errData)}`);
    }
    const createData = await createRes.json();
    const listingId = createData.id;
    console.log(`   Created ID: ${listingId}`);

    // 3. Update Listing (PATCH)
    console.log('3. Updating (PATCH) listing...');
    const updateRes = await fetch(`${API_URL}/listings/private/${listingId}`, {
      method: 'PATCH',
      headers: authHeader,
      body: JSON.stringify({
        title: 'HOMOLOG_LIFECYCLE_TEST_UPDATED',
        price: 600000
      })
    });
    
    if (!updateRes.ok) throw new Error(`Update failed: ${updateRes.status}`);
    console.log('   Update successful (No hang detected).');

    // 4. Duplicate
    console.log('4. Duplicating listing...');
    const dupRes = await fetch(`${API_URL}/listings/private/${listingId}/duplicate`, {
      method: 'POST',
      headers: authHeader
    });
    
    if (!dupRes.ok) throw new Error(`Duplicate failed: ${dupRes.status}`);
    const dupData = await dupRes.json();
    const duplicatedId = dupData.id;
    console.log(`   Duplicated ID: ${duplicatedId}`);

    // 5. Soft Delete
    console.log('5. Deleting (Soft Delete) the copy...');
    const delRes = await fetch(`${API_URL}/listings/private/${duplicatedId}`, {
      method: 'DELETE',
      headers: authHeader
    });
    
    if (!delRes.ok) throw new Error(`Delete failed: ${delRes.status}`);
    console.log('   Delete successful.');

    // 6. Verify Removal
    console.log('6. Verifying removal in listings list...');
    const listRes = await fetch(`${API_URL}/listings/me?page=1&limit=10`, {
      headers: authHeader
    });
    
    if (!listRes.ok) throw new Error(`List failed: ${listRes.status}`);
    const listData = await listRes.json();
    const found = listData.data.find(l => l.id === duplicatedId);
    if (!found) {
      console.log('   Verification successful: Deleted item not found in list.');
    } else {
      console.error('   FAILED: Deleted item still found in list.');
      process.exit(1);
    }

    console.log('--- ALL BACKEND STEPS PASSED ---');
  } catch (error) {
    console.error('--- VALIDATION FAILED ---');
    console.error(error.message);
    process.exit(1);
  }
}

run();
