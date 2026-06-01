#!/bin/bash
# Vercel Deployment Helper Script
# Usage: ./deploy-setup.sh

set -e

echo "========================================"
echo "BizFlow Enterprise - Vercel Setup Helper"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check prerequisites
echo "Checking prerequisites..."
echo ""

# Check Node.js version
if ! command -v node &> /dev/null; then
    print_error "Node.js not installed"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js 18+ required (current: v$(node -v | cut -d'v' -f2))"
    exit 1
fi
print_success "Node.js $(node -v | cut -d'v' -f2) detected"

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git not installed"
    exit 1
fi
print_success "Git installed"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm not installed"
    exit 1
fi
print_success "npm installed"

echo ""
echo "========================================"
echo "1. Verify Project Structure"
echo "========================================"
echo ""

# Check if vercel.json files exist
if [ -f "./bizflow-api/vercel.json" ]; then
    print_success "Backend vercel.json exists"
else
    print_error "Backend vercel.json missing"
    exit 1
fi

if [ -f "./bizflow-ui/vercel.json" ]; then
    print_success "Frontend vercel.json exists"
else
    print_error "Frontend vercel.json missing"
    exit 1
fi

echo ""
echo "========================================"
echo "2. Generate JWT Secrets"
echo "========================================"
echo ""

print_info "Generating secure JWT secrets..."
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

echo ""
print_success "JWT_SECRET generated"
echo "   Value: $JWT_SECRET"
echo ""
print_success "JWT_REFRESH_SECRET generated"
echo "   Value: $JWT_REFRESH_SECRET"
echo ""

echo "========================================"
echo "3. Environment Variables Checklist"
echo "========================================"
echo ""

print_info "BACKEND (bizflow-api) environment variables needed:"
echo "   □ MONGODB_URI         (MongoDB Atlas connection string)"
echo "   □ DB_NAME             (default: bizflow)"
echo "   □ JWT_SECRET          (generated above)"
echo "   □ JWT_REFRESH_SECRET  (generated above)"
echo "   □ CORS_ORIGIN         (your frontend URL)"
echo "   □ NODE_ENV            (set to: production)"
echo ""

print_info "FRONTEND (bizflow-ui) environment variables needed:"
echo "   □ ENVIRONMENT_API_URL (your backend API URL)"
echo ""

echo "========================================"
echo "4. Local Build Test"
echo "========================================"
echo ""

read -p "Would you like to test builds locally? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    print_info "Building backend..."
    cd bizflow-api
    npm run build > /dev/null 2>&1 && print_success "Backend build successful" || print_error "Backend build failed"
    cd ..
    
    echo ""
    print_info "Building frontend..."
    cd bizflow-ui
    npm run build > /dev/null 2>&1 && print_success "Frontend build successful" || print_error "Frontend build failed"
    cd ..
fi

echo ""
echo "========================================"
echo "5. Vercel Deployment Instructions"
echo "========================================"
echo ""

print_info "BACKEND DEPLOYMENT:"
echo "   1. Go to https://vercel.com/dashboard"
echo "   2. Click 'Add New' → 'Project'"
echo "   3. Select your GitHub repository"
echo "   4. Configure:"
echo "      - Root Directory: ./bizflow-api"
echo "      - Build Command: npm run build"
echo "      - Output Directory: dist"
echo "   5. Add environment variables (see above)"
echo "   6. Deploy"
echo "   7. Save backend URL"
echo ""

print_info "FRONTEND DEPLOYMENT:"
echo "   1. Go to https://vercel.com/dashboard"
echo "   2. Click 'Add New' → 'Project'"
echo "   3. Select your GitHub repository"
echo "   4. Configure:"
echo "      - Root Directory: ./bizflow-ui"
echo "      - Build Command: npm run build"
echo "      - Output Directory: dist/bizflow-ui"
echo "   5. Set ENVIRONMENT_API_URL to your backend API URL"
echo "   6. Deploy"
echo "   7. Test frontend!"
echo ""

print_info "IMPORTANT:"
echo "   - Deploy backend first to get the API URL"
echo "   - Use backend API URL when deploying frontend"
echo "   - Update backend CORS_ORIGIN after frontend deploys"
echo ""

echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
print_success "You're ready to deploy to Vercel!"
echo ""
print_info "For detailed instructions, see VERCEL_DEPLOYMENT.md"
print_info "For quick reference, see VERCEL_QUICK_START.md"
echo ""
