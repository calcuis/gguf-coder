import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import test from 'ava';
import { checkForUpdates } from './update-checker.js';
console.log(`\nupdate-checker.spec.ts`);
// Get current version from package.json dynamically
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, '../../package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
const CURRENT_VERSION = packageJson.version;
// Mock fetch globally for testing
const originalFetch = globalThis.fetch;
// Helper to create mock fetch responses
function createMockFetch(status, data, shouldReject = false) {
    return (async () => {
        if (shouldReject) {
            throw new Error('Network error');
        }
        return {
            ok: status >= 200 && status < 300,
            status,
            statusText: status === 200 ? 'OK' : 'Error',
            json: async () => data,
        };
    });
}
test.beforeEach(() => {
    // Reset fetch before each test
    globalThis.fetch = originalFetch;
    // Default to npm install override
    process.env.CODER_INSTALL_METHOD = 'npm';
});
test.afterEach(() => {
    // Restore original fetch and env after each test
    globalThis.fetch = originalFetch;
    delete process.env.CODER_INSTALL_METHOD;
});
// Version Comparison Tests
test('checkForUpdates: detects newer major version', async (t) => {
    // Calculate a newer major version dynamically
    const currentParts = CURRENT_VERSION.split('.');
    const newerMajorVersion = `${parseInt(currentParts[0]) + 1}.0.0`;
    globalThis.fetch = createMockFetch(200, {
        version: newerMajorVersion,
        name: '@gguf/coder',
    });
    const result = await checkForUpdates();
    t.true(result.hasUpdate);
    t.is(result.currentVersion, CURRENT_VERSION);
    t.is(result.latestVersion, newerMajorVersion);
    t.truthy(result.updateCommand);
});
test('checkForUpdates: detects newer minor version', async (t) => {
    // Calculate a newer minor version dynamically
    const currentParts = CURRENT_VERSION.split('.');
    const newerMinorVersion = `${currentParts[0]}.${parseInt(currentParts[1]) + 1}.0`;
    globalThis.fetch = createMockFetch(200, {
        version: newerMinorVersion,
        name: '@gguf/coder',
    });
    const result = await checkForUpdates();
    t.true(result.hasUpdate);
    t.is(result.latestVersion, newerMinorVersion);
});
test('checkForUpdates: detects newer patch version', async (t) => {
    // Calculate a newer patch version dynamically
    const currentParts = CURRENT_VERSION.split('.');
    const newerPatchVersion = `${currentParts[0]}.${currentParts[1]}.${parseInt(currentParts[2]) + 1}`;
    globalThis.fetch = createMockFetch(200, {
        version: newerPatchVersion,
        name: '@gguf/coder',
    });
    const result = await checkForUpdates();
    t.true(result.hasUpdate);
    t.is(result.latestVersion, newerPatchVersion);
});
test('checkForUpdates: detects same version (no update)', async (t) => {
    globalThis.fetch = createMockFetch(200, {
        version: CURRENT_VERSION,
        name: '@gguf/coder',
    });
    const result = await checkForUpdates();
    t.false(result.hasUpdate);
    t.is(result.currentVersion, CURRENT_VERSION);
    t.is(result.latestVersion, CURRENT_VERSION);
    t.is(result.updateCommand, undefined);
});
test('checkForUpdates: detects older version (no update)', async (t) => {
    // Calculate an older patch version dynamically
    const currentParts = CURRENT_VERSION.split('.');
    const patchNum = parseInt(currentParts[2]);
    // Use 0 if current patch is already 0, otherwise decrement
    const olderPatchVersion = `${currentParts[0]}.${currentParts[1]}.${Math.max(0, patchNum - 1)}`;
    globalThis.fetch = createMockFetch(200, {
        version: olderPatchVersion,
        name: '@gguf/coder',
    });
    const result = await checkForUpdates();
    t.false(result.hasUpdate);
    t.is(result.latestVersion, olderPatchVersion);
});
test('checkForUpdates: handles version with v prefix', async (t) => {
    // Use a newer major version with v prefix
    const currentParts = CURRENT_VERSION.split('.');
    const newerMajorVersion = `v${parseInt(currentParts[0]) + 1}.0.0`;
    globalThis.fetch = createMockFetch(200, {
        version: newerMajorVersion,
        name: '@gguf/coder',
    });
    const result = await checkForUpdates();
    t.true(result.hasUpdate);
    t.is(result.latestVersion, newerMajorVersion);
});
test('checkForUpdates: handles pre-release versions', async (t) => {
    // Use a newer major version with pre-release tag
    const currentParts = CURRENT_VERSION.split('.');
    const newerPreReleaseVersion = `${parseInt(currentParts[0]) + 1}.0.0-beta.1`;
    globalThis.fetch = createMockFetch(200, {
        version: newerPreReleaseVersion,
        name: '@gguf/coder',
    });
    const result = await checkForUpdates();
    // Pre-release info is stripped during comparison
    t.true(result.hasUpdate);
    t.is(result.latestVersion, newerPreReleaseVersion);
});
// Network Error Handling Tests
test('checkForUpdates: handles network errors gracefully', async (t) => {
    globalThis.fetch = createMockFetch(200, {}, true);
    const result = await checkForUpdates();
    t.false(result.hasUpdate);
    t.truthy(result.currentVersion);
    t.is(result.latestVersion, undefined);
});
test('checkForUpdates: handles HTTP 404 error', async (t) => {
    globalThis.fetch = createMockFetch(404, {
        error: 'Not found',
    });
    const result = await checkForUpdates();
    t.false(result.hasUpdate);
    t.truthy(result.currentVersion);
});
test('checkForUpdates: handles HTTP 500 error', async (t) => {
    globalThis.fetch = createMockFetch(500, {
        error: 'Internal server error',
    });
    const result = await checkForUpdates();
    t.false(result.hasUpdate);
    t.truthy(result.currentVersion);
});
test('checkForUpdates: handles timeout (via AbortSignal)', async (t) => {
    // Simulate timeout by throwing AbortError
    globalThis.fetch = (async () => {
        const error = new Error('The operation was aborted');
        error.name = 'AbortError';
        throw error;
    });
    const result = await checkForUpdates();
    // Should handle timeout gracefully
    t.false(result.hasUpdate);
});
// Response Format Tests
test('checkForUpdates: returns correct update command', async (t) => {
    globalThis.fetch = createMockFetch(200, {
        version: '2.0.0',
        name: '@gguf/coder',
    });
    const result = await checkForUpdates();
    t.is(result.updateCommand, 'npm update -g @gguf/coder');
});
test('checkForUpdates: returns correct Homebrew command when installed via Homebrew', async (t) => {
    globalThis.fetch = createMockFetch(200, {
        version: '2.0.0',
        name: '@gguf/coder',
    });
    process.env.CODER_INSTALL_METHOD = 'homebrew';
    const result = await checkForUpdates();
    t.is(result.updateCommand, 'brew list coder >/dev/null 2>&1 && brew upgrade coder || (echo "Error: coder not found in Homebrew. Please install it first with: brew install coder" && exit 1)');
});
test('checkForUpdates: returns message for Nix installations (no executable command)', async (t) => {
    globalThis.fetch = createMockFetch(200, {
        version: '2.0.0',
        name: '@gguf/coder',
    });
    process.env.CODER_INSTALL_METHOD = 'nix';
    const result = await checkForUpdates();
    t.is(result.updateMessage, 'To update, re-run: nix run github:gguf/coder (or update your flake).');
});
test('checkForUpdates: includes current version in response', async (t) => {
    globalThis.fetch = createMockFetch(200, {
        version: '2.0.0',
        name: '@gguf/coder',
    });
    const result = await checkForUpdates();
    t.truthy(result.currentVersion);
    t.regex(result.currentVersion, /^\d+\.\d+\.\d+/);
});
test('checkForUpdates: handles missing version field in response', async (t) => {
    globalThis.fetch = createMockFetch(200, {
        name: '@gguf/coder',
        // version field missing
    });
    const result = await checkForUpdates();
    t.false(result.hasUpdate);
});
test('checkForUpdates: handles malformed JSON response', async (t) => {
    globalThis.fetch = (async () => {
        return {
            ok: true,
            status: 200,
            statusText: 'OK',
            json: async () => {
                throw new Error('Invalid JSON');
            },
        };
    });
    const result = await checkForUpdates();
    t.false(result.hasUpdate);
});
// Edge Cases
test('checkForUpdates: handles empty version string', async (t) => {
    globalThis.fetch = createMockFetch(200, {
        version: '',
        name: '@gguf/coder',
    });
    const result = await checkForUpdates();
    t.false(result.hasUpdate);
});
test('checkForUpdates: handles version with extra segments', async (t) => {
    globalThis.fetch = createMockFetch(200, {
        version: '2.0.0.1',
        name: '@gguf/coder',
    });
    const result = await checkForUpdates();
    // Should compare first 3 segments
    t.true(result.hasUpdate);
});
test('checkForUpdates: handles invalid version format', async (t) => {
    globalThis.fetch = createMockFetch(200, {
        version: 'not-a-version',
        name: '@gguf/coder',
    });
    const result = await checkForUpdates();
    // Should handle gracefully
    t.false(result.hasUpdate);
});
// Integration Tests
test('checkForUpdates: complete workflow for update available', async (t) => {
    globalThis.fetch = createMockFetch(200, {
        version: '99.99.99',
        name: '@gguf/coder',
    });
    const result = await checkForUpdates();
    t.true(result.hasUpdate);
    t.truthy(result.currentVersion);
    t.is(result.latestVersion, '99.99.99');
    t.is(result.updateCommand, 'npm update -g @gguf/coder');
});
test('checkForUpdates: complete workflow for no update', async (t) => {
    globalThis.fetch = createMockFetch(200, {
        version: '0.0.1',
        name: '@gguf/coder',
    });
    const result = await checkForUpdates();
    t.false(result.hasUpdate);
    t.truthy(result.currentVersion);
    t.is(result.latestVersion, '0.0.1');
    t.is(result.updateCommand, undefined);
});
test('checkForUpdates: complete workflow for network failure', async (t) => {
    globalThis.fetch = createMockFetch(200, {}, true);
    const result = await checkForUpdates();
    t.false(result.hasUpdate);
    t.truthy(result.currentVersion);
    t.is(result.latestVersion, undefined);
    t.is(result.updateCommand, undefined);
});
//# sourceMappingURL=update-checker.spec.js.map