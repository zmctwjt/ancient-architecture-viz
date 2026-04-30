#!/bin/bash
# =============================================
# Build project and start local preview server
# Usage: bash build.sh
# Auto-installs Node.js if missing
# =============================================

cd "$(dirname "$0")"

echo ""
echo "============================================"
echo "  Build and Preview"
echo "============================================"
echo ""

# ---------- Check Node.js ----------
if command -v node &> /dev/null; then
    echo "  Node.js: $(node -v)"
else
    echo "  Node.js not found!"
    echo "  Trying to auto-install..."
    echo ""

    INSTALLED=false

    # ---- Method 1: nvm (cross-platform) ----
    if [ "$INSTALLED" = false ]; then
        if command -v nvm &> /dev/null || [ -s "$HOME/.nvm/nvm.sh" ]; then
            echo "  [1/4] Installing via nvm..."
            [ -s "$HOME/.nvm/nvm.sh" ] && source "$HOME/.nvm/nvm.sh"
            nvm install --lts
            if [ $? -eq 0 ]; then
                INSTALLED=true
                echo "  nvm install OK"
            fi
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

    # ---- Method 3: Direct download (curl/wget) ----
    if [ "$INSTALLED" = false ]; then
        echo "  [3/4] Downloading Node.js LTS binary..."
        NODE_VERSION="v20.11.1"
        if [[ "$(uname -m)" == "x86_64" ]]; then
            ARCH="x64"
        elif [[ "$(uname -m)" == "aarch64" || "$(uname -m)" == "arm64" ]]; then
            ARCH="arm64"
        else
            ARCH="x64"
        fi

        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            NODE_TAR="node-${NODE_VERSION}-linux-${ARCH}.tar.xz"
            NODE_URL="https://nodejs.org/dist/${NODE_VERSION}/${NODE_TAR}"
            NODE_DIR="$HOME/.local/node"
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            NODE_TAR="node-${NODE_VERSION}-darwin-${ARCH}.tar.gz"
            NODE_URL="https://nodejs.org/dist/${NODE_VERSION}/${NODE_TAR}"
            NODE_DIR="$HOME/.local/node"
        else
            NODE_URL=""
        fi

        if [ -n "$NODE_URL" ]; then
            TMPDIR=$(mktemp -d)
            echo "  Downloading $NODE_URL ..."
            if command -v curl &> /dev/null; then
                curl -fsSL "$NODE_URL" -o "$TMPDIR/$NODE_TAR"
            elif command -v wget &> /dev/null; then
                wget -q "$NODE_URL" -O "$TMPDIR/$NODE_TAR"
            fi

            if [ -f "$TMPDIR/$NODE_TAR" ]; then
                mkdir -p "$NODE_DIR"
                tar xf "$TMPDIR/$NODE_TAR" -C "$NODE_DIR" --strip-components=1
                export PATH="$NODE_DIR/bin:$PATH"
                # Persist in shell profile
                echo 'export PATH="$HOME/.local/node/bin:$PATH"' >> "$HOME/.bashrc" 2>/dev/null
                if command -v node &> /dev/null; then
                    INSTALLED=true
                    echo "  Download and install OK"
                fi
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
        echo "  After installing, run: bash build.sh"
        echo ""
        exit 1
    fi

    echo ""
    echo "  Node.js installed: $(node -v)"
fi

# ---------- Check dependencies ----------
if [ ! -d "node_modules" ]; then
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
echo ""
echo "  Starting preview server..."
echo "  Press Ctrl+C to stop"
echo ""

# ---------- Start preview ----------
npm run preview
