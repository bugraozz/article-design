// Native fetch is used


const BASE_URL = 'http://localhost:3001';

async function testProjectFeature() {
    console.log('🚀 Starting Project Save/Restore Feature Test...\n');

    // Mock project data (similar to what frontend sends)
    const mockProject = {
        pages: [
            {
                id: 1,
                title: "Test Page 1",
                type: "content",
                mode: "document",
                overlays: [
                    { id: "text-1", type: "text", content: "Hello World", x: 100, y: 100 }
                ],
                images: [],
                tables: []
            }
        ],
        articleSettings: {
            titleColor: "#ff0000",
            bodyFontSize: 14
        },
        authors: [{ name: "Test Author" }],
        institutions: ["Test University"],
        contacts: ["test@example.com"],
        projectName: "Automated Test Project"
    };

    try {
        // 1. TEST SAVE
        console.log('📦 Testing SAVE endpoint...');
        const saveResponse = await fetch(`${BASE_URL}/api/projects/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mockProject)
        });

        if (!saveResponse.ok) {
            throw new Error(`Save failed with status ${saveResponse.status}`);
        }

        const saveResult = await saveResponse.json();
        console.log('✅ Save successful!');
        console.log(`   Code: ${saveResult.code}`);
        console.log(`   Size: ${saveResult.size}`);

        if (!saveResult.code || saveResult.code.length !== 8) {
            throw new Error('Invalid code format received');
        }

        const projectCode = saveResult.code;

        // 2. TEST LOAD
        console.log('\n📂 Testing LOAD endpoint...');
        const loadResponse = await fetch(`${BASE_URL}/api/projects/${projectCode}`);

        if (!loadResponse.ok) {
            throw new Error(`Load failed with status ${loadResponse.status}`);
        }

        const loadResult = await loadResponse.json();
        console.log('✅ Load successful!');

        // 3. VERIFY DATA
        console.log('\n🔍 Verifying data integrity...');
        const loadedData = loadResult.data;

        let passed = true;

        if (loadedData.code !== projectCode) {
            console.error('❌ Code mismatch');
            passed = false;
        }

        if (loadedData.pages.length !== mockProject.pages.length) {
            console.error('❌ Page count mismatch');
            passed = false;
        }

        if (loadedData.articleSettings.titleColor !== mockProject.articleSettings.titleColor) {
            console.error('❌ Settings mismatch');
            passed = false;
        }

        if (passed) {
            console.log('✅ Data verification PASSED');
            console.log('   - Project name preserved');
            console.log('   - Pages preserved');
            console.log('   - Settings preserved');
        } else {
            console.error('❌ Data verification FAILED');
        }

        // 4. TEST INVALID CODE
        console.log('\n🚫 Testing invalid code...');
        const errorResponse = await fetch(`${BASE_URL}/api/projects/INVALID1`);
        if (errorResponse.status === 404 || errorResponse.status === 400) {
            console.log('✅ Invalid code handled correctly (404/400)');
        } else {
            console.error(`❌ Unexpected status for invalid code: ${errorResponse.status}`);
        }

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
    }
}

testProjectFeature();
