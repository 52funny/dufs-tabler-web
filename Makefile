DUFS ?= dufs
HOST ?= 0.0.0.0
PORT ?= 5055
ROOT ?= ../
ASSETS ?= ./assets
AUTH ?= admin:admin@/:rw
IMAGE ?= dufs-tabler-web
DOCKER_PORT ?= 5050
DOCKER_ROOT ?= $(CURDIR)

.PHONY: help check scan test build-assets serve serve-ro serve-auth smoke docker-build docker-run docker-run-auth clean

help:
	@echo "Targets:"
	@echo "  make check       Check JavaScript syntax"
	@echo "  make scan        Scan local assets for remote resource references"
	@echo "  make test        Run check and scan"
	@echo "  make build-assets Minify assets into dist/assets"
	@echo "  make serve       Run dufs with all permissions"
	@echo "  make serve-ro    Run dufs in read-only mode"
	@echo "  make serve-auth  Run dufs with basic auth; default admin/admin"
	@echo "  make smoke       Start dufs, fetch page/assets, then stop it"
	@echo "  make docker-build Build Docker image with local UI assets"
	@echo "  make docker-run   Run Docker image with all permissions"
	@echo "  make docker-run-auth Run Docker image with basic auth; default admin/admin"
	@echo ""
	@echo "Variables:"
	@echo "  DUFS=$(DUFS) HOST=$(HOST) PORT=$(PORT) ROOT=$(ROOT) ASSETS=$(ASSETS)"
	@echo "  IMAGE=$(IMAGE) DOCKER_PORT=$(DOCKER_PORT) DOCKER_ROOT=$(DOCKER_ROOT)"

check:
	npm run check

scan:
	@! rg -n "(src|href)=['\"]https?://|@import|url\(['\"]?https?://|//cdn|unpkg|jsdelivr|googleapis|gstatic" assets

test: check scan

build-assets:
	npm run build:assets

serve:
	$(DUFS) $(ROOT) -A --assets $(ASSETS) -b $(HOST) -p $(PORT)

serve-ro:
	$(DUFS) $(ROOT) --assets $(ASSETS) -b $(HOST) -p $(PORT)

serve-auth:
	$(DUFS) $(ROOT) --assets $(ASSETS) --allow-upload --allow-delete --allow-search --allow-archive -a "$(AUTH)" -b $(HOST) -p $(PORT)

smoke:
	@set -eu; \
	tmp=$$(mktemp -d); \
	$(DUFS) $(ROOT) -A --assets $(ASSETS) -b $(HOST) -p $(PORT) > "$$tmp/dufs.log" 2>&1 & \
	pid=$$!; \
	trap 'kill $$pid >/dev/null 2>&1 || true; wait $$pid >/dev/null 2>&1 || true; rm -rf "$$tmp"' EXIT; \
	sleep 1; \
	curl -fsS -A "Mozilla/5.0" "http://$(HOST):$(PORT)/" > "$$tmp/index.html"; \
	prefix=$$(sed -n 's/.*href="\([^"]*__dufs[^"]*\/\)[^"]*\.css[^"]*".*/\1/p' "$$tmp/index.html" | head -n 1); \
	test -n "$$prefix"; \
	curl -fsS -A "Mozilla/5.0" -o /dev/null "http://$(HOST):$(PORT)$${prefix}tabler.min.css"; \
	curl -fsS -A "Mozilla/5.0" -o /dev/null "http://$(HOST):$(PORT)$${prefix}index.css"; \
	curl -fsS -A "Mozilla/5.0" -o /dev/null "http://$(HOST):$(PORT)$${prefix}index.js"; \
	curl -fsS -A "Mozilla/5.0" -o /dev/null "http://$(HOST):$(PORT)$${prefix}favicon.svg"; \
	echo "Smoke test passed: http://$(HOST):$(PORT)/"

docker-build:
	docker build -t $(IMAGE) .

docker-run:
	docker run --rm -p $(DOCKER_PORT):5000 -v "$(DOCKER_ROOT):/data" $(IMAGE)

docker-run-auth:
	docker run --rm -p $(DOCKER_PORT):5000 -v "$(DOCKER_ROOT):/data" $(IMAGE) /data --assets /assets --allow-upload --allow-delete --allow-search --allow-archive -a "$(AUTH)" -b 0.0.0.0 -p 5000

clean:
	@find . -name ".DS_Store" -delete
	@rm -rf dist
