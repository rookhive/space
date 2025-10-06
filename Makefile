default: start

.PHONY: all

all: build dev stop stop-dev

build:
	docker compose -f compose.build.yaml build --parallel client core sfu
	docker compose -f compose.build.yaml build proxy

dev:
	docker compose -f compose.dev.yaml up -d
	pnpm run dev

stop:
	docker compose -f compose.yaml down --remove-orphans

stop-dev:
	docker compose -f compose.dev.yaml down --remove-orphans
