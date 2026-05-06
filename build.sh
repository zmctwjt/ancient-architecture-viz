#!/bin/bash
# =============================================
# Build & Deploy for 千年营造·华夏砖木
# Usage: bash build.sh [--preview|--deploy|--nginx-only]
#   (no args)     = build + auto deploy (Nginx on Linux, preview on others)
#   --preview     = build + start vite preview server only
#   --deploy      = build + Nginx deploy (skip preview)
#   --nginx-only  = skip build, only configure/restart Nginx
# =============================================

cd "$(dirname "$0")"
PROJECT_DIR="$(pwd)"
DIST_DIR="$PROJECT_DIR/dist"
NGINX_CONF="/etc/nginx/conf.d/architecture.conf"

MODE="auto"
if [ "$1" = "--preview" ]; then MODE="preview"; fi
if [ "$1" = "--deploy" ]; then MODE="deploy"; fi
if [ "$1" = "--nginx-only" ]; then MODE="nginx-only"; fi

echo ""
echo "============================================"
echo "  千年营造·华夏砖木 - Build & Deploy"
echo "============================================"
echo ""

# ==========================================
# Section 1: Build (skip if --nginx-only)
# ==========================================
if [ "$MODE" != "nginx-only" ]; then

    # ---------- Check Node.js ----------
    if command -v node &> /dev/null; then
        echo "  Node.js: $(node -v)"
    else
        echo "  Node.js not found!"
        echo "  Trying to auto-install..."
        echo ""

        INSTALLED=false

        # ---- Method 1: nvm ----
        if [ "$INSTALLED" = false ]; then
            if command -v nvm &> /dev/null || [ -s "$HOME/.nvm/nvm.sh" ]; then
                echo "  [1/4] Installing via nvm..."
                [ -s "$HOME/.nvm/nvm.sh" ] && source "$HOME/.nvm/nvm.sh"
                nvm install --lts
                if [ $? -eq 0 ]; then INSTALLED=true; echo "  nvm install OK"; fi
            else
                echo "  [1/4] nvm not available, skipping..."
            fi
            echo ""
        fi

        # ---- Method 2: OS package manager ----
        if [ "$INSTALLED" = false ]; then
            if [[ "$OSTYPE" == "linux-gnu"* ]]; then
                echo "  [2/4] Installing via package manager..."
                if command -v apt &> /dev/null; then
                    sudo apt update -qq && sudo apt install -y nodejs npm
                elif command -v dnf &> /dev/null; then
                    sudo dnf install -y nodejs npm
                elif command -v yum &> /dev/null; then
                    sudo yum install -y nodejs npm
                elif command -v pacman &> /dev/null; then
                    sudo pacman -S --noconfirm nodejs npm
                else
                    echo "  No supported package manager found."
                fi
                if command -v node &> /dev/null; then INSTALLED=true; fi
            elif [[ "$OSTYPE" == "darwin"* ]]; then
                echo "  [2/4] Installing via Homebrew..."
                if command -v brew &> /dev/null; then
                    brew install node
                    if command -v node &> /dev/null; then INSTALLED=true; fi
                fi
            fi
            echo ""
        fi

        # ---- Method 3: Direct download ----
        if [ "$INSTALLED" = false ]; then
            echo "  [3/4] Downloading Node.js LTS binary..."
            NODE_VERSION="v20.11.1"
            if [[ "$(uname -m)" == "x86_64" ]]; then ARCH="x64"
            elif [[ "$(uname -m)" == "aarch64" || "$(uname -m)" == "arm64" ]]; then ARCH="arm64"
            else ARCH="x64"
            fi

            if [[ "$OSTYPE" == "linux-gnu"* ]]; then
                NODE_TAR="node-${NODE_VERSION}-linux-${ARCH}.tar.xz"
                NODE_DIR="$HOME/.local/node"
            elif [[ "$OSTYPE" == "darwin"* ]]; then
                NODE_TAR="node-${NODE_VERSION}-darwin-${ARCH}.tar.gz"
                NODE_DIR="$HOME/.local/node"
            else
                NODE_TAR=""
            fi

            if [ -n "$NODE_TAR" ]; then
                NODE_URL="https://nodejs.org/dist/${NODE_VERSION}/${NODE_TAR}"
                TMPDIR=$(mktemp -d)
                echo "  Downloading $NODE_URL ..."
                if command -v curl &> /dev/null; then curl -fsSL "$NODE_URL" -o "$TMPDIR/$NODE_TAR"
                elif command -v wget &> /dev/null; then wget -q "$NODE_URL" -O "$TMPDIR/$NODE_TAR"
                fi

                if [ -f "$TMPDIR/$NODE_TAR" ]; then
                    mkdir -p "$NODE_DIR"
                    tar xf "$TMPDIR/$NODE_TAR" -C "$NODE_DIR" --strip-components=1
                    export PATH="$NODE_DIR/bin:$PATH"
                    echo 'export PATH="$HOME/.local/node/bin:$PATH"' >> "$HOME/.bashrc" 2>/dev/null
                    if command -v node &> /dev/null; then INSTALLED=true; echo "  Download OK"; fi
                    rm -rf "$TMPDIR"
                else
                    echo "  Download failed"
                    rm -rf "$TMPDIR"
                fi
            fi
            echo ""
        fi

        # ---- Method 4: Fallback ----
        if [ "$INSTALLED" = false ]; then
            echo "  [4/4] Auto-install failed."
            echo "  Please install Node.js manually: https://nodejs.org/"
            exit 1
        fi
        echo ""
        echo "  Node.js installed: $(node -v)"
    fi

    # ---------- Fix cross-platform node_modules ----------
    NEED_INSTALL=false

    if [ ! -d "node_modules" ]; then
        NEED_INSTALL=true
    else
        CURRENT_OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
        if [[ "$CURRENT_OS" == "linux" ]]; then
            WRONG_ESBUILD="@esbuild/win32-x64"
        elif [[ "$CURRENT_OS" == "darwin" ]]; then
            WRONG_ESBUILD="@esbuild/win32-x64"
        else
            WRONG_ESBUILD=""
        fi

        if [ -n "$WRONG_ESBUILD" ] && [ -d "node_modules/$WRONG_ESBUILD" ]; then
            echo ""
            echo "  [WARN] Detected Windows node_modules on $CURRENT_OS"
            echo "  Cleaning and reinstalling..."
            rm -rf node_modules
            NEED_INSTALL=true
        fi
    fi

    if [ "$NEED_INSTALL" = true ]; then
        echo ""
        echo "  Installing dependencies..."
        npm install
        if [ $? -ne 0 ]; then
            echo ""
            echo "  npm install failed, trying China mirror..."
            npm config set registry https://registry.npmmirror.com
            npm install
            if [ $? -ne 0 ]; then
                echo ""
                echo "  [ERROR] npm install failed"
                exit 1
            fi
        fi
    fi

    # ---------- Build ----------
    echo ""
    echo "  Building..."
    echo ""
    npm run build
    if [ $? -ne 0 ]; then
        echo ""
        echo "  [ERROR] Build failed"
        exit 1
    fi

    echo ""
    echo "============================================"
    echo "  Build OK! Output: dist/"
    echo "============================================"

fi # end of build section

# ==========================================
# Section 2: Deploy
# ==========================================

# Decide deploy mode: on Linux try Nginx, on others fall back to preview
IS_LINUX=false
if [[ "$(uname -s)" == "Linux" ]]; then IS_LINUX=true; fi

if [ "$MODE" = "preview" ]; then
    # Force preview mode
    echo ""
    echo "  Starting vite preview server..."
    echo "  Press Ctrl+C to stop"
    echo ""
    npx vite preview --host 0.0.0.0
    exit 0
fi

if [ "$IS_LINUX" = true ] && [ "$MODE" != "preview" ]; then
    # ---------- Nginx Deploy on Linux ----------
    echo ""
    echo "--------------------------------------------"
    echo "  Deploying via Nginx..."
    echo "--------------------------------------------"
    echo ""

    # Install Nginx if missing
    if ! command -v nginx &> /dev/null; then
        echo "  Installing Nginx..."

        if command -v apt &> /dev/null; then
            sudo apt update -qq && sudo apt install -y nginx

        elif command -v dnf &> /dev/null; then
            # Alibaba Cloud Linux / CentOS / RHEL
            # Try EPEL first
            sudo dnf install -y epel-release 2>/dev/null
            sudo dnf install -y nginx 2>/dev/null

            # If still missing, use Nginx official repo with rhel/9 (works for Alibaba Cloud Linux 3)
            if ! command -v nginx &> /dev/null; then
                echo "  Adding Nginx official repo..."
                # Detect RHEL major version, fallback to 9 for Alibaba Cloud Linux
                RHEL_VER=$(rpm -E '%{rhel}' 2>/dev/null || echo "9")
                if [ "$RHEL_VER" -le 3 ] 2>/dev/null; then
                    RHEL_VER="9"
                fi
                sudo tee /etc/yum.repos.d/nginx.repo > /dev/null << REPOEOF
[nginx-stable]
name=nginx stable repo
baseurl=http://nginx.org/packages/rhel/${RHEL_VER}/\$basearch/
gpgcheck=1
enabled=1
gpgkey=https://nginx.org/keys/nginx_signing.key
module_hotfixes=true
REPOEOF
                sudo dnf clean all --disablerepo='*' --enablerepo=nginx-stable 2>/dev/null
                sudo dnf install -y nginx
            fi

        elif command -v yum &> /dev/null; then
            sudo yum install -y epel-release 2>/dev/null
            sudo yum install -y nginx 2>/dev/null

            if ! command -v nginx &> /dev/null; then
                echo "  Adding Nginx official repo..."
                RHEL_VER=$(rpm -E '%{rhel}' 2>/dev/null || echo "7")
                if [ "$RHEL_VER" -le 3 ] 2>/dev/null; then
                    RHEL_VER="7"
                fi
                sudo tee /etc/yum.repos.d/nginx.repo > /dev/null << REPOEOF
[nginx-stable]
name=nginx stable repo
baseurl=http://nginx.org/packages/rhel/${RHEL_VER}/\$basearch/
gpgcheck=1
enabled=1
gpgkey=https://nginx.org/keys/nginx_signing.key
REPOEOF
                sudo yum install -y nginx
            fi
        fi

        if ! command -v nginx &> /dev/null; then
            echo ""
            echo "  [ERROR] Failed to install Nginx automatically."
            echo "  Please install manually:"
            echo "    dnf install -y epel-release && dnf install -y nginx"
            echo "  Then re-run: bash build.sh --nginx-only"
            exit 1
        fi
        echo "  Nginx installed."
    else
        echo "  Nginx: $(nginx -v 2>&1)"
    fi

    # Write Nginx config
    echo "  Writing Nginx config..."
    sudo mkdir -p /etc/nginx/conf.d

    # Detect ARM vs x64 for potential future use
    NGINX_ROOT="$DIST_DIR"

    sudo tee "$NGINX_CONF" > /dev/null << NGINXEOF
server {
    listen 80;
    server_name _;

    root $NGINX_ROOT;
    index index.html;

    # MPA routing: try exact file, then .html, then index
    location / {
        try_files \$uri \$uri/ \$uri.html /index.html;
    }

    # Static assets cache
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|json|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml image/svg+xml application/font-woff2;
    gzip_min_length 1024;
    gzip_comp_level 6;
}
NGINXEOF

    echo "  Config written to $NGINX_CONF"
    echo "  Document root: $NGINX_ROOT"

    # Test and reload Nginx
    echo ""
    echo "  Testing Nginx config..."
    sudo nginx -t 2>&1
    if [ $? -ne 0 ]; then
        echo ""
        echo "  [ERROR] Nginx config test failed"
        echo "  Check: sudo nginx -t"
        exit 1
    fi

    # Start or reload
    if sudo systemctl is-active --quiet nginx; then
        echo "  Reloading Nginx..."
        sudo systemctl reload nginx
    else
        echo "  Starting Nginx..."
        sudo systemctl start nginx
        sudo systemctl enable nginx 2>/dev/null
    fi

    # Get public IP
    PUBLIC_IP=""
    if command -v curl &> /dev/null; then
        PUBLIC_IP=$(curl -s --max-time 3 ifconfig.me 2>/dev/null || curl -s --max-time 3 ipinfo.io/ip 2>/dev/null)
    fi

    echo ""
    echo "============================================"
    echo "  Deploy OK!"
    echo "============================================"
    echo ""
    if [ -n "$PUBLIC_IP" ]; then
        echo "  Access: http://$PUBLIC_IP"
    else
        echo "  Access: http://<your-server-ip>"
    fi
    echo ""
    echo "  Note: Make sure port 80 is open in your"
    echo "  cloud provider's security group settings."
    echo ""

else
    # Not Linux, fall back to preview server
    echo ""
    echo "  (Not Linux, starting preview server instead)"
    echo "  Press Ctrl+C to stop"
    echo ""
    npx vite preview --host 0.0.0.0
fi
