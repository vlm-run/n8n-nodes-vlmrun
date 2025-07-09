// Build configuration for n8n-nodes-vlmrun SDK
module.exports = {
    sdk: {
        repository: 'https://github.com/vlm-run/vlmrun-node-sdk.git',
        version: 'v0.3.0',
        name: 'vlmrun'
    },
    
    build: {
        target: 'node20',
        format: 'cjs',
        minify: false,
        sourcemap: false,
        external: ['n8n-workflow']
    },
    
    paths: {
        dist: 'dist',
        nodeEntry: 'dist/nodes/VlmRun/VlmRun.node.js',
        credentialsEntry: 'dist/credentials/VlmRunApi.credentials.js'
    }
}; 