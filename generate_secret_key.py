"""
Generate a secure SECRET_KEY for JWT authentication
Run this script and copy the output to your .env file
"""
import secrets

print("=" * 60)
print("SECRET_KEY Generator for Interview Practice Partner")
print("=" * 60)
print()
print("Copy this SECRET_KEY to your backend/.env file:")
print()
print(f"SECRET_KEY={secrets.token_urlsafe(32)}")
print()
print("=" * 60)
print("✓ This key is cryptographically secure and unique")
print("✓ Keep it secret - never commit to version control")
print("✓ Use a different key for production")
print("=" * 60)
