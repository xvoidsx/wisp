#!/usr/bin/env bash
set -euo pipefail
APP=wisp

MUTED='\033[0;2m'
PINK='\033[38;5;201m'
GREEN='\033[38;5;46m'
RED='\033[0;31m'
NC='\033[0m' # No Color

usage() {
    cat <<EOF
wisp Installer — your navi code agent.

Usage: install.sh [options]

Options:
    -h, --help              Display this help message
    -v, --version <version> Install a specific version (e.g., 0.1.0)
    -b, --binary <path>     Install from a local binary instead of downloading
        --no-modify-path    Don't modify shell config files (.zshrc, .bashrc, etc.)

Examples:
    curl -fsSL https://xvoidsx.github.io/wisp/install.sh | bash
    curl -fsSL https://xvoidsx.github.io/wisp/install.sh | bash -s -- --version 0.1.0
    ./install.sh --binary /path/to/wisp
EOF
}

requested_version=${VERSION:-}
no_modify_path=false
binary_path=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        -h|--help)
            usage
            exit 0
            ;;
        -v|--version)
            if [[ -n "${2:-}" ]]; then
                requested_version="$2"
                shift 2
            else
                echo -e "${RED}Error: --version requires a version argument${NC}"
                exit 1
            fi
            ;;
        -b|--binary)
            if [[ -n "${2:-}" ]]; then
                binary_path="$2"
                shift 2
            else
                echo -e "${RED}Error: --binary requires a path argument${NC}"
                exit 1
            fi
            ;;
        --no-modify-path)
            no_modify_path=true
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            usage
            exit 1
            ;;
    esac
done

# Detect OS and architecture
os=$(uname -s | tr '[:upper:]' '[:lower:]')
arch=$(uname -m)
case "$arch" in
    x86_64) arch="x64" ;;
    aarch64|arm64) arch="arm64" ;;
    *) echo -e "${RED}Unsupported architecture: $arch${NC}"; exit 1 ;;
esac
case "$os" in
    linux|darwin) ;;
    *) echo -e "${RED}Unsupported OS: $os${NC}"; exit 1 ;;
esac

INSTALL_DIR="${WISP_INSTALL_DIR:-$HOME/.wisp/bin}"
mkdir -p "$INSTALL_DIR"

if [[ -n "$binary_path" ]]; then
    echo -e "${PINK}Installing wisp from local binary...${NC}"
    cp "$binary_path" "$INSTALL_DIR/wisp"
    chmod +x "$INSTALL_DIR/wisp"
else
    # Download from GitHub releases
    if [[ -n "$requested_version" ]]; then
        version="$requested_version"
    else
        echo -e "${PINK}Fetching latest wisp release...${NC}"
        version=$(curl -fsSL https://api.github.com/repos/xvoidsx/wisp/releases/latest | grep '"tag_name"' | sed -E 's/.*"([^"]+)".*/\1/')
        if [[ -z "$version" ]]; then
            echo -e "${RED}Could not determine latest version. Is there a release yet?${NC}"
            echo -e "${MUTED}Check https://github.com/xvoidsx/wisp/releases${NC}"
            exit 1
        fi
    fi

    filename="wisp-${os}-${arch}.tar.gz"
    url="https://github.com/xvoidsx/wisp/releases/download/${version}/${filename}"

    echo -e "${PINK}Downloading wisp ${version} for ${os}-${arch}...${NC}"
    tmpdir=$(mktemp -d)
    trap "rm -rf $tmpdir" EXIT

    if ! curl -fsSL "$url" -o "$tmpdir/wisp.tar.gz"; then
        echo -e "${RED}Download failed: $url${NC}"
        echo -e "${MUTED}Check https://github.com/xvoidsx/wisp/releases for available versions${NC}"
        exit 1
    fi

    tar -xzf "$tmpdir/wisp.tar.gz" -C "$tmpdir"
    # Find the binary (might be nested)
    bin=$(find "$tmpdir" -name "wisp" -type f | head -1)
    if [[ -z "$bin" ]]; then
        echo -e "${RED}wisp binary not found in archive${NC}"
        exit 1
    fi
    cp "$bin" "$INSTALL_DIR/wisp"
    chmod +x "$INSTALL_DIR/wisp"
fi

echo -e "${GREEN}wisp installed to $INSTALL_DIR/wisp${NC}"

# PATH setup
if [[ "$no_modify_path" != "true" ]]; then
    current_shell=$(basename "${SHELL:-sh}")
    config_files=""
    case "$current_shell" in
        bash) config_files="$HOME/.bashrc $HOME/.bash_profile" ;;
        zsh) config_files="$HOME/.zshrc" ;;
        fish) config_files="$HOME/.config/fish/config.fish" ;;
    esac

    if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
        for file in $config_files; do
            if [[ -f "$file" ]]; then
                if [[ "$current_shell" == "fish" ]]; then
                    echo "fish_add_path $INSTALL_DIR # wisp" >> "$file"
                else
                    echo "export PATH=\"$INSTALL_DIR:\$PATH\" # wisp" >> "$file"
                fi
                echo -e "${MUTED}Added $INSTALL_DIR to PATH in $file${NC}"
                break
            fi
        done
    fi
fi

echo -e ""
echo -e "${PINK}  ✦ wisp — your navi code agent${NC}"
echo -e ""
echo -e "${MUTED}To start:${NC}"
echo -e ""
echo -e "  cd <project>  ${MUTED}# Open directory${NC}"
echo -e "  wisp          ${MUTED}# Run command${NC}"
echo -e ""
echo -e "${MUTED}Default: nightshadeNeon theme, Ollama local models${NC}"
echo -e ""
