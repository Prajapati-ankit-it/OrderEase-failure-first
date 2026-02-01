#!/bin/bash

# Rate Limiting Test Script for OrderEase API Gateway
# This script demonstrates IP-based rate limiting functionality

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  OrderEase API Gateway - IP Rate Limiting Test            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Configuration
GATEWAY_URL="${GATEWAY_URL:-http://localhost:4000}"
TEST_ENDPOINT="${TEST_ENDPOINT:-/api/public/health}"
REQUESTS="${REQUESTS:-8}"

echo "Configuration:"
echo "  Gateway URL: $GATEWAY_URL"
echo "  Test Endpoint: $TEST_ENDPOINT"
echo "  Number of Requests: $REQUESTS"
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Test 1: Rate Limit Enforcement                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Make multiple requests to test rate limiting
for i in $(seq 1 $REQUESTS); do
    echo "Request #$i:"
    
    # Make request and capture response
    response=$(curl -s -w "\n%{http_code}" "$GATEWAY_URL$TEST_ENDPOINT")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    # Get rate limit headers
    headers=$(curl -s -I "$GATEWAY_URL$TEST_ENDPOINT" 2>/dev/null)
    rate_limit=$(echo "$headers" | grep -i "X-RateLimit-Limit" | head -1 | cut -d: -f2 | tr -d ' \r')
    remaining=$(echo "$headers" | grep -i "X-RateLimit-Remaining" | head -1 | cut -d: -f2 | tr -d ' \r')
    reset=$(echo "$headers" | grep -i "X-RateLimit-Reset" | head -1 | cut -d: -f2 | tr -d ' \r')
    retry_after=$(echo "$headers" | grep -i "Retry-After" | head -1 | cut -d: -f2 | tr -d ' \r')
    
    # Display results
    echo "  HTTP Status: $http_code"
    
    if [ "$http_code" -eq 429 ]; then
        echo "  ✅ RATE LIMITED (as expected)"
        if [ -n "$retry_after" ]; then
            echo "  Retry After: ${retry_after}s"
        fi
    elif [ "$http_code" -ge 400 ] && [ "$http_code" -lt 429 ]; then
        echo "  ⚠️  Error (non-rate-limit)"
        echo "  Limit: $rate_limit"
        echo "  Remaining: $remaining"
        echo "  Reset: ${reset}s"
    else
        echo "  ✅ ALLOWED"
        echo "  Limit: $rate_limit"
        echo "  Remaining: $remaining"
        echo "  Reset: ${reset}s"
    fi
    
    echo ""
    sleep 0.5
done

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Test 2: Rate Limit Reset After Time Window               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Get the reset time
headers=$(curl -s -I "$GATEWAY_URL$TEST_ENDPOINT" 2>/dev/null)
reset=$(echo "$headers" | grep -i "X-RateLimit-Reset" | head -1 | cut -d: -f2 | tr -d ' \r')

if [ -n "$reset" ] && [ "$reset" -gt 0 ]; then
    echo "Waiting for rate limit to reset (${reset}s)..."
    sleep $((reset + 1))
    echo ""
    
    echo "Making request after reset:"
    response=$(curl -s -w "\n%{http_code}" "$GATEWAY_URL$TEST_ENDPOINT")
    http_code=$(echo "$response" | tail -n1)
    
    # Get rate limit headers
    headers=$(curl -s -I "$GATEWAY_URL$TEST_ENDPOINT" 2>/dev/null)
    remaining=$(echo "$headers" | grep -i "X-RateLimit-Remaining" | head -1 | cut -d: -f2 | tr -d ' \r')
    
    echo "  HTTP Status: $http_code"
    echo "  Remaining Requests: $remaining"
    
    if [ "$http_code" -ne 429 ]; then
        echo "  ✅ Rate limit successfully reset!"
    else
        echo "  ❌ Rate limit did not reset"
    fi
else
    echo "⚠️  Could not determine reset time, skipping test"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Test Complete                                              ║"
echo "╚════════════════════════════════════════════════════════════╝"
