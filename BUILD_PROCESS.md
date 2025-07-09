# Build Process Documentation

## Overview

This n8n node package uses a custom build process that bundles the `vlmrun` SDK directly into the final package, eliminating the need for external dependencies at runtime.

**Requirements**: Node.js 20.0 or higher (the bundled code is optimized for Node.js 20)

## Build Process

### 1. Hybrid Approach: GitHub Installation + Bundling

The build process implements a hybrid approach:
- **Development**: Uses direct GitHub URL to install a specific version of vlmrun SDK
- **Bundling**: Uses esbuild to bundle everything into a self-contained package
- **Publishing**: Results in zero external dependencies for end users

### 2. Build Steps

The build process (`scripts/build-with-sdk.js`) performs the following steps:

1. **Install vlmrun SDK from GitHub (configured version)**
   ```bash
   # Version is configured in scripts/config.js
   pnpm add git+https://github.com/vlm-run/vlmrun-node-sdk.git#v0.3.0
   ```

2. **Build the vlmrun SDK**
   - Install SDK dependencies
   - Build the SDK using its own build process

3. **Build TypeScript files**
   - Compile all TypeScript files to JavaScript

4. **Bundle with esbuild**
   - Bundle the main node file with the vlmrun SDK
   - Bundle the credentials file
   - Target Node.js 20 for optimal performance
   - Keep n8n-workflow as external dependency

5. **Build icons**
   - Process SVG icons using gulp

6. **Clean up**
   - Remove temporary vlmrun installation
   - Clean up dist/package.json to remove vlmrun dependency

### 3. Build Commands

- `pnpm build` - Full build with SDK bundling (production)
- `pnpm build:dev` - Development build without bundling
- `pnpm clean` - Clean the dist directory

### 4. Benefits

- **Zero Runtime Dependencies**: End users don't need to install vlmrun SDK
- **Stable and Predictable**: Uses specific configured version of SDK from GitHub during build
- **Self-Contained**: Single package contains everything needed
- **Easy Updates**: Update the version tag in build script and rebuild to get new SDK version
- **No Version Conflicts**: Bundled SDK version is isolated

### 5. Development Workflow

For development:
1. Use `pnpm build:dev` for faster builds without bundling
2. Use `pnpm build` before publishing to create bundled version
3. The bundled version is what gets published to npm

### 6. Publishing

The `prepublishOnly` script ensures the full bundled build is created before publishing:
```bash
pnpm build && pnpm lint -c .eslintrc.prepublish.js nodes credentials package.json
```

### 7. File Sizes

- Bundled VlmRun.node.js: ~1MB (includes entire vlmrun SDK)
- Original VlmRun.node.js: ~10KB (without SDK)

### 8. Updating SDK Version

To update to a different vlmrun SDK release:

1. Check for available releases at: https://github.com/vlm-run/vlmrun-node-sdk/releases
2. Update the version in `scripts/config.js`:
   ```javascript
   sdk: {
       repository: 'https://github.com/vlm-run/vlmrun-node-sdk.git',
       version: 'v0.4.0', // Update this line
       name: 'vlmrun'
   },
   ```
3. Run `pnpm build` to build with the new version

### 9. Configuration

All build settings are centralized in `scripts/config.js`:
- **SDK Version**: Easy to update in one place
- **Build Settings**: esbuild configuration (Node.js 20 target, CJS format, minify, etc.)
- **File Paths**: Centralized path configuration

This approach provides the best of both worlds: predictable builds with controlled SDK version management, and a completely self-contained package for end users. 