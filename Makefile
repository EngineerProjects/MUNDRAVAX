.PHONY: help install dev web build build-web exe exe-run run run-release open-exe lint lint-check test clean

POWERSHELL := powershell.exe
MAKE_PS := make.ps1

help:
	$(POWERSHELL) -NoProfile -ExecutionPolicy Bypass -File $(MAKE_PS) help

install:
	$(POWERSHELL) -NoProfile -ExecutionPolicy Bypass -File $(MAKE_PS) install

dev:
	$(POWERSHELL) -NoProfile -ExecutionPolicy Bypass -File $(MAKE_PS) dev

web:
	$(POWERSHELL) -NoProfile -ExecutionPolicy Bypass -File $(MAKE_PS) web

build:
	$(POWERSHELL) -NoProfile -ExecutionPolicy Bypass -File $(MAKE_PS) build

build-web:
	$(POWERSHELL) -NoProfile -ExecutionPolicy Bypass -File $(MAKE_PS) build-web

exe:
	$(POWERSHELL) -NoProfile -ExecutionPolicy Bypass -File $(MAKE_PS) exe

exe-run:
	$(POWERSHELL) -NoProfile -ExecutionPolicy Bypass -File $(MAKE_PS) exe-run

run:
	$(POWERSHELL) -NoProfile -ExecutionPolicy Bypass -File $(MAKE_PS) run

run-release:
	$(POWERSHELL) -NoProfile -ExecutionPolicy Bypass -File $(MAKE_PS) run -Release

open-exe:
	$(POWERSHELL) -NoProfile -ExecutionPolicy Bypass -File $(MAKE_PS) open-exe

lint:
	$(POWERSHELL) -NoProfile -ExecutionPolicy Bypass -File $(MAKE_PS) lint

lint-check:
	$(POWERSHELL) -NoProfile -ExecutionPolicy Bypass -File $(MAKE_PS) lint-check

test:
	$(POWERSHELL) -NoProfile -ExecutionPolicy Bypass -File $(MAKE_PS) test

clean:
	$(POWERSHELL) -NoProfile -ExecutionPolicy Bypass -File $(MAKE_PS) clean
