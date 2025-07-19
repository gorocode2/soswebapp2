#!/usr/bin/env node

/**
 * 🦈 School of Sharks - Security Secrets Generator
 * Generates cryptographically secure secrets for production
 */

const crypto = require('crypto');

console.log('🦈 ================================');
console.log('   Security Secrets Generator');
console.log('🦈 ================================\n');

/**
 * Generate a cryptographically secure random string
 */
function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate a base64 encoded secret (alternative format)
 */
function generateSecretBase64(length = 48) {
  return crypto.randomBytes(length).toString('base64');
}

// Generate secrets
const jwtSecret = generateSecret(64);  // 128 hex characters = 512 bits
const sessionSecret = generateSecret(64);
const apiKey = generateSecret(32);     // 64 hex characters = 256 bits

// Alternative format (base64)
const jwtSecretB64 = generateSecretBase64(48);
const sessionSecretB64 = generateSecretBase64(48);

console.log('🔐 PRODUCTION SECRETS (Copy these to your VPS .env.production):');
console.log('=' * 70);
console.log('');
console.log('# Hex format (recommended):');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`SESSION_SECRET=${sessionSecret}`);
console.log('');
console.log('# Alternative Base64 format:');
console.log(`JWT_SECRET=${jwtSecretB64}`);
console.log(`SESSION_SECRET=${sessionSecretB64}`);
console.log('');
console.log('🔑 Additional API Key (if needed):');
console.log(`API_SECRET_KEY=${apiKey}`);
console.log('');
console.log('⚠️  SECURITY WARNINGS:');
console.log('   🚨 NEVER commit these secrets to git');
console.log('   🚨 Store them securely (password manager)');
console.log('   🚨 Use different secrets for dev/staging/production');
console.log('   🚨 Rotate secrets periodically (every 90 days)');
console.log('');
console.log('✅ Secret Specifications:');
console.log(`   📏 JWT Secret: ${jwtSecret.length} characters (${jwtSecret.length * 4} bits)`);
console.log(`   📏 Session Secret: ${sessionSecret.length} characters (${sessionSecret.length * 4} bits)`);
console.log('   🔒 Cryptographically secure random generation');
console.log('   💪 Strong enough for production use');
console.log('');
console.log('🦈 Copy the hex format secrets to your VPS .env.production file!');
