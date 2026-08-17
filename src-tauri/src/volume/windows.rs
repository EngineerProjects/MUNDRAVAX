use windows::Win32::Media::Audio::Endpoints::IAudioEndpointVolume;
use windows::Win32::Media::Audio::{eConsole, eRender, IMMDeviceEnumerator, MMDeviceEnumerator};
use windows::Win32::System::Com::{CoCreateInstance, CoInitializeEx, CoUninitialize, CLSCTX_ALL, COINIT_APARTMENTTHREADED};

/// Initializes COM for this call (apartment-threaded, per Tauri's command
/// thread pool - each call gets its own init/uninit pair), gets the default
/// audio endpoint's volume interface, and runs `f` against it.
fn with_endpoint_volume<T>(f: impl FnOnce(&IAudioEndpointVolume) -> windows::core::Result<T>) -> Result<T, String> {
	unsafe {
		// SUCCEEDED (which `is_ok` checks) covers both S_OK and S_FALSE
		// (already initialized on this thread) - both must be balanced by a
		// matching CoUninitialize call.
		let should_uninitialize = CoInitializeEx(None, COINIT_APARTMENTTHREADED).is_ok();

		let result = (|| -> windows::core::Result<T> {
			let enumerator: IMMDeviceEnumerator = CoCreateInstance(&MMDeviceEnumerator, None, CLSCTX_ALL)?;
			let device = enumerator.GetDefaultAudioEndpoint(eRender, eConsole)?;
			let endpoint_volume: IAudioEndpointVolume = device.Activate(CLSCTX_ALL, None)?;
			f(&endpoint_volume)
		})();

		if should_uninitialize {
			CoUninitialize();
		}

		result.map_err(|error| error.to_string())
	}
}

pub fn get() -> Result<u32, String> {
	with_endpoint_volume(|endpoint_volume| {
		let scalar = unsafe { endpoint_volume.GetMasterVolumeLevelScalar()? };
		Ok((scalar * 100.0).round() as u32)
	})
}

pub fn set(level: u32) -> Result<(), String> {
	with_endpoint_volume(|endpoint_volume| {
		let scalar = level as f32 / 100.0;
		unsafe { endpoint_volume.SetMasterVolumeLevelScalar(scalar, std::ptr::null())? };
		Ok(())
	})
}
