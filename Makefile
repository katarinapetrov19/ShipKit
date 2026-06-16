# ==============================================================================
# ShipKit SaaS Boilerplate Orchestrator Makefile
# ==============================================================================
# Use these target commands to quickly initialize, run, build, and package
# the ShipKit SaaS Boilerplate package.

.PHONY: help install dev build start seed-admin clean package

help:
	@echo "========================================================================="
	@echo "⚡ ShipKit Command Center"
	@echo "========================================================================="
	@echo "Available Makefile commands:"
	@echo "  make install     Install all dependencies for root, server, and client"
	@echo "  make dev         Start both server and client dev servers concurrently"
	@echo "  make build       Compile optimized React frontend client assets"
	@echo "  make start       Launch the unified app in production mode on Port 3000"
	@echo "  make seed-admin  Run administrative CLI helper to create a superuser"
	@echo "  make clean       Wipe temporary logs, outputs, and build assets"
	@echo "  make package     Produce a clean distributable shipkit-boilerplate.tar.gz"
	@echo "========================================================================="

install:
	@echo "⚡ Installing monorepo workspace dependencies..."
	npm run install:all

dev:
	@echo "⚡ Launching client + API development instances concurrently..."
	npm run dev

build:
	@echo "⚡ Compiling static client assets for production..."
	npm run build

start:
	@echo "⚡ Starting unified Production Express server on PORT 3000..."
	NODE_ENV=production PORT=3000 npm run start

seed-admin:
	@echo "⚡ Seed a secure administrator account in SQLite..."
	node server/scripts/create-admin.js

clean:
	@echo "⚡ Cleaning workspace caches, logs, and compiled distributions..."
	rm -rf client/dist
	rm -rf *.log
	rm -rf server/*.log
	rm -rf .DS_Store
	rm -rf client/.DS_Store
	rm -rf server/.DS_Store

package: clean
	@echo "⚡ Archiving a clean, light boilerplate for distribution..."
	tar --exclude='node_modules' \
	    --exclude='client/node_modules' \
	    --exclude='server/node_modules' \
	    --exclude='dist' \
	    --exclude='client/dist' \
	    --exclude='.env' \
	    --exclude='db.sqlite' \
	    --exclude='db.sqlite-journal' \
	    --exclude='db.sqlite-shm' \
	    --exclude='db.sqlite-wal' \
	    --exclude='.git' \
	    --exclude='.DS_Store' \
	    --exclude='shipkit-boilerplate.tar.gz' \
	    -czf /tmp/shipkit-boilerplate.tar.gz .
	mv /tmp/shipkit-boilerplate.tar.gz .
	@echo "========================================================================="
	@echo "🎉 Package successfully generated: shipkit-boilerplate.tar.gz"
	@echo "========================================================================="
