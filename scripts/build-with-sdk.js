#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { build } = require('esbuild');
const config = require('./config');

async function buildWithSDK() {
    console.log('🔧 Building n8n-nodes-vlmrun with bundled vlmrun SDK...');

    // Install and build SDK
    console.log(`📦 Installing vlmrun SDK ${config.sdk.version} from GitHub...`);
    try {
        const gitUrl = `git+${config.sdk.repository}#${config.sdk.version}`;
        execSync(`pnpm add ${gitUrl}`, { 
            stdio: 'inherit',
            cwd: process.cwd()
        });
        console.log(`✅ vlmrun SDK ${config.sdk.version} installed successfully`);
    } catch (error) {
        console.error('❌ Failed to install vlmrun SDK:', error.message);
        process.exit(1);
    }

    console.log('🔨 Installing vlmrun SDK dependencies...');
    try {
        execSync(`cd node_modules/${config.sdk.name} && npm install`, { 
            stdio: 'inherit',
            cwd: process.cwd()
        });
        console.log('✅ vlmrun SDK dependencies installed');
    } catch (error) {
        console.error('❌ Failed to install vlmrun SDK dependencies:', error.message);
        process.exit(1);
    }

    console.log('🔨 Building vlmrun SDK...');
    try {
        execSync(`cd node_modules/${config.sdk.name} && npm run build`, { 
            stdio: 'inherit',
            cwd: process.cwd()
        });
        console.log('✅ vlmrun SDK built successfully');
    } catch (error) {
        console.error('❌ Failed to build vlmrun SDK:', error.message);
        process.exit(1);
    }

    // Build TypeScript files
    console.log('🔨 Building TypeScript files...');
    try {
        execSync('tsc', { stdio: 'inherit' });
        console.log('✅ TypeScript compilation completed');
    } catch (error) {
        console.error('❌ TypeScript compilation failed:', error.message);
        process.exit(1);
    }

    // Bundle node file with SDK
    console.log('📦 Bundling VlmRun node with SDK...');
    const nodeEntryPoint = path.join(__dirname, '../', config.paths.nodeEntry);
    const nodeOutputPath = path.join(__dirname, '../', config.paths.nodeEntry.replace('.js', '.bundled.js'));

    try {
        await build({
            entryPoints: [nodeEntryPoint],
            bundle: true,
            outfile: nodeOutputPath,
            platform: 'node',
            target: config.build.target,
            format: config.build.format,
            external: config.build.external,
            minify: config.build.minify,
            sourcemap: config.build.sourcemap,
            resolveExtensions: ['.ts', '.js'],
            loader: {
                '.node': 'file'
            }
        });
        
        fs.renameSync(nodeOutputPath, nodeEntryPoint);
        console.log('✅ VlmRun node bundled successfully');
    } catch (error) {
        console.error('❌ Failed to bundle VlmRun node:', error.message);
        process.exit(1);
    }

    // Bundle credentials file
    console.log('📦 Bundling credentials...');
    const credentialsEntryPoint = path.join(__dirname, '../', config.paths.credentialsEntry);
    const credentialsOutputPath = path.join(__dirname, '../', config.paths.credentialsEntry.replace('.js', '.bundled.js'));

    try {
        await build({
            entryPoints: [credentialsEntryPoint],
            bundle: true,
            outfile: credentialsOutputPath,
            platform: 'node',
            target: config.build.target,
            format: config.build.format,
            external: config.build.external,
            minify: config.build.minify,
            sourcemap: config.build.sourcemap,
            resolveExtensions: ['.ts', '.js'],
            loader: {
                '.node': 'file'
            }
        });
        
        fs.renameSync(credentialsOutputPath, credentialsEntryPoint);
        console.log('✅ Credentials bundled successfully');
    } catch (error) {
        console.error('❌ Failed to bundle credentials:', error.message);
        process.exit(1);
    }

    // Build icons
    console.log('🎨 Building icons...');
    try {
        execSync('gulp build:icons', { stdio: 'inherit' });
        console.log('✅ Icons built successfully');
    } catch (error) {
        console.error('❌ Failed to build icons:', error.message);
        process.exit(1);
    }

    // Clean up temporary SDK installation
    console.log('🧹 Cleaning up temporary vlmrun installation...');
    try {
        execSync(`pnpm remove ${config.sdk.name}`, { stdio: 'inherit' });
        console.log('✅ Temporary vlmrun installation removed');
    } catch (error) {
        console.warn('⚠️ Warning: Could not remove temporary vlmrun installation:', error.message);
    }

    // Clean up dist/package.json
    console.log('🧹 Cleaning up dist/package.json...');
    try {
        const distPackageJsonPath = path.join(__dirname, '../', config.paths.dist, 'package.json');
        const distPackageJson = JSON.parse(fs.readFileSync(distPackageJsonPath, 'utf8'));
        
        if (distPackageJson.dependencies && distPackageJson.dependencies[config.sdk.name]) {
            delete distPackageJson.dependencies[config.sdk.name];
        }
        
        if (distPackageJson.dependencies && Object.keys(distPackageJson.dependencies).length === 0) {
            delete distPackageJson.dependencies;
        }
        
        fs.writeFileSync(distPackageJsonPath, JSON.stringify(distPackageJson, null, 4));
        console.log('✅ dist/package.json cleaned up');
    } catch (error) {
        console.warn('⚠️ Warning: Could not clean dist/package.json:', error.message);
    }

    console.log('🎉 Build completed successfully!');
    console.log('📄 The bundled package is ready in the dist/ directory');
    console.log('🚀 You can now publish this self-contained package');
}

buildWithSDK().catch(error => {
    console.error('❌ Build failed:', error);
    process.exit(1);
}); 