param(
	[Parameter(Position = 0)]
	[string] $Action = "help",
	[switch] $Release
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$PnpmLocal = Join-Path $Root "node_modules\.bin\pnpm.CMD"
$DebugExe = Join-Path $Root "src-tauri\target\debug\mundravax.exe"
$ReleaseExe = Join-Path $Root "src-tauri\target\release\mundravax.exe"
$BundleDir = Join-Path $Root "src-tauri\target\release\bundle"

function Invoke-Pnpm {
	param([Parameter(ValueFromRemainingArguments = $true)] [string[]] $Arguments)

	if (Test-Path -LiteralPath $PnpmLocal) {
		& $PnpmLocal @Arguments
	} else {
		& corepack pnpm @Arguments
	}

	if ($LASTEXITCODE -ne 0) {
		exit $LASTEXITCODE
	}
}

function Start-Mundravax {
	$exe = if ($Release) { $ReleaseExe } elseif (Test-Path -LiteralPath $DebugExe) { $DebugExe } else { $ReleaseExe }

	if (-not (Test-Path -LiteralPath $exe)) {
		Write-Host "No executable found at: $exe" -ForegroundColor Yellow
		Write-Host "Run './make.ps1 exe' first for a release build, or './make.ps1 dev' for dev mode."
		exit 1
	}

	Write-Host "Starting $exe"
	Start-Process -FilePath $exe -WorkingDirectory (Split-Path -Parent $exe)
}

function Show-Help {
	Write-Host ""
	Write-Host "Mundravax make script"
	Write-Host ""
	Write-Host "Usage:"
	Write-Host "  ./make.ps1 <command>"
	Write-Host "  make <command>"
	Write-Host ""
	Write-Host "Commands:"
	Write-Host "  dev         Start Tauri dev mode"
	Write-Host "  web         Start the web demo only"
	Write-Host "  build       Build all packages/web output"
	Write-Host "  build-web   Build the demo web app"
	Write-Host "  exe         Build the Windows executable with Tauri"
	Write-Host "  exe-run     Build the Windows executable, then launch it"
	Write-Host "  run         Launch the latest local exe (debug first, release with -Release)"
	Write-Host "  open-exe    Open the release/bundle output folder"
	Write-Host "  lint        Run lint with fixes"
	Write-Host "  lint-check  Run lint without fixes"
	Write-Host "  test        Run tests"
	Write-Host "  clean       Clean generated JS build outputs"
	Write-Host "  install     Install workspace dependencies"
	Write-Host ""
	Write-Host "Examples:"
	Write-Host "  make dev"
	Write-Host "  make exe"
	Write-Host "  make exe-run"
	Write-Host "  ./make.ps1 run -Release"
	Write-Host ""
}

Set-Location $Root

switch ($Action.ToLowerInvariant()) {
	"help" { Show-Help }
	"h" { Show-Help }
	"install" { Invoke-Pnpm install }
	"dev" { Invoke-Pnpm run tauri:dev }
	"web" { Invoke-Pnpm run demo:start }
	"build" { Invoke-Pnpm run build }
	"build-web" { Invoke-Pnpm run demo:build }
	"exe" { Invoke-Pnpm run tauri:build }
	"tauri-build" { Invoke-Pnpm run tauri:build }
	"exe-run" {
		Invoke-Pnpm run tauri:build
		$script:Release = $true
		Start-Mundravax
	}
	"run" { Start-Mundravax }
	"open-exe" {
		if (Test-Path -LiteralPath $BundleDir) {
			Start-Process explorer.exe $BundleDir
		} else {
			Start-Process explorer.exe (Split-Path -Parent $ReleaseExe)
		}
	}
	"lint" { Invoke-Pnpm run lint }
	"lint-check" { Invoke-Pnpm run lint:nofix }
	"test" { Invoke-Pnpm run test }
	"clean" { Invoke-Pnpm run clean }
	default {
		Write-Host "Unknown command: $Action" -ForegroundColor Red
		Show-Help
		exit 1
	}
}
