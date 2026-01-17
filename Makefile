SHELL := /bin/sh
COMPOSE ?= docker compose
MVN_IMAGE ?= maven:3.9-eclipse-temurin-21
SERVICES := auth-service gateway portfolio-service simulation-service

.PHONY: up down logs ps build restart test

up:
	$(COMPOSE) up --build

down:
	$(COMPOSE) down -v --remove-orphans

logs:
	$(COMPOSE) logs -f --tail=200

ps:
	$(COMPOSE) ps

build:
	$(COMPOSE) build

restart:
	$(COMPOSE) restart

test:
	@for svc in $(SERVICES); do \
		echo "==> $$svc"; \
		docker run --rm -v "$(CURDIR)/backend/$$svc":/ws -w /ws $(MVN_IMAGE) mvn -q test; \
	done
