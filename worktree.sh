#!/bin/bash

# Git 工作树管理脚本
# 用法: ./worktree.sh [命令] [选项]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git rev-parse --show-toplevel)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # 无颜色

# 打印彩色输出
print_info() {
    echo -e "${BLUE}[信息]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[成功]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[警告]${NC} $1"
}

print_error() {
    echo -e "${RED}[错误]${NC} $1"
}

# 显示使用说明
show_usage() {
    echo "Git 工作树管理脚本"
    echo ""
    echo "用法: $0 [命令] [选项]"
    echo ""
    echo "命令:"
    echo "  list, ls          - 列出所有工作树"
    echo "  add <名称> [分支]  - 添加新工作树"
    echo "  remove, rm <名称> - 删除工作树"
    echo "  clean             - 清理已删除的工作树"
    echo "  switch, sw <名称> - 切换到工作树目录"
    echo "  status            - 显示所有工作树状态"
    echo "  help              - 显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 list"
    echo "  $0 add feature-branch"
    echo "  $0 add hotfix origin/main"
    echo "  $0 remove feature-branch"
    echo "  $0 switch feature-branch"
}

# 列出所有工作树
list_worktrees() {
    print_info "当前工作树:"
    git worktree list
}

# 添加新工作树
add_worktree() {
    local name="$1"
    local branch="$2"

    if [[ -z "$name" ]]; then
        print_error "需要指定工作树名称"
        echo "用法: $0 add <名称> [分支]"
        exit 1
    fi

    # 默认创建同名分支
    if [[ -z "$branch" ]]; then
        branch="$name"
    fi

    local worktree_path="../$name"

    print_info "正在添加工作树 '$name'，分支为 '$branch'"

    # 检查分支是否存在
    if git show-ref --verify --quiet "refs/heads/$branch"; then
        print_info "分支 '$branch' 已存在，检出现有分支"
        git worktree add "$worktree_path" "$branch"
    elif git show-ref --verify --quiet "refs/remotes/origin/$branch"; then
        print_info "远程分支 'origin/$branch' 存在，创建本地跟踪分支"
        git worktree add -b "$branch" "$worktree_path" "origin/$branch"
    else
        print_info "创建新分支 '$branch'"
        git worktree add -b "$branch" "$worktree_path"
    fi

    print_success "工作树 '$name' 已创建到 '$worktree_path'"
    print_info "切换到工作树: cd $worktree_path"
}

# 删除工作树
remove_worktree() {
    local name="$1"

    if [[ -z "$name" ]]; then
        print_error "需要指定工作树名称"
        echo "用法: $0 remove <名称>"
        exit 1
    fi

    local worktree_path="../$name"

    if [[ ! -d "$worktree_path" ]]; then
        print_error "工作树 '$name' 在 '$worktree_path' 不存在"
        exit 1
    fi

    print_warning "即将删除工作树 '$name'，位置: '$worktree_path'"
    read -p "确定要删除吗? (y/N): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git worktree remove "$worktree_path"
        print_success "工作树 '$name' 已删除"
    else
        print_info "操作已取消"
    fi
}

# 清理已删除的工作树
clean_worktrees() {
    print_info "正在清理已删除的工作树"
    git worktree prune
    print_success "清理完成"
}

# 切换到工作树目录
switch_worktree() {
    local name="$1"

    if [[ -z "$name" ]]; then
        print_error "需要指定工作树名称"
        echo "用法: $0 switch <名称>"
        exit 1
    fi

    local worktree_path="../$name"

    if [[ ! -d "$worktree_path" ]]; then
        print_error "工作树 '$name' 在 '$worktree_path' 不存在"
        exit 1
    fi

    print_info "正在切换到工作树 '$name'"
    cd "$worktree_path"
    exec "$SHELL"
}

# 显示所有工作树状态
show_status() {
    print_info "工作树状态:"

    while IFS= read -r line; do
        local path=$(echo "$line" | awk '{print $1}')
        local commit=$(echo "$line" | awk '{print $2}')
        local branch=$(echo "$line" | awk '{print $3}' | tr -d '[]')

        echo ""
        echo -e "${BLUE}路径:${NC} $path"
        echo -e "${BLUE}分支:${NC} $branch"
        echo -e "${BLUE}提交:${NC} $commit"

        if [[ -d "$path" ]]; then
            (cd "$path" && git status --porcelain | head -5)
        fi
    done < <(git worktree list)
}

# Main script logic
case "${1:-help}" in
    "list"|"ls")
        list_worktrees
        ;;
    "add")
        add_worktree "$2" "$3"
        ;;
    "remove"|"rm")
        remove_worktree "$2"
        ;;
    "clean")
        clean_worktrees
        ;;
    "switch"|"sw")
        switch_worktree "$2"
        ;;
    "status")
        show_status
        ;;
    "help"|*)
        show_usage
        ;;
esac