use aes_gcm::{Aes256Gcm, KeyInit, aead::OsRng};
use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64};
use keyring::Entry;

const SERVICE: &str = "dev.mundravax.app";
const USERNAME: &str = "virtual-drive-key";

/// Returns the AES-256 key stored in the OS-native keychain, generating and
/// storing a new random one on first run.
pub fn get_or_create_key() -> Result<[u8; 32], String> {
	let entry = Entry::new(SERVICE, USERNAME).map_err(|error| error.to_string())?;

	match entry.get_password() {
		Ok(encoded) => decode_key(&encoded),
		Err(keyring::Error::NoEntry) => {
			let key = Aes256Gcm::generate_key(&mut OsRng);
			let encoded = BASE64.encode(key);
			entry.set_password(&encoded).map_err(|error| error.to_string())?;
			Ok(key.into())
		}
		Err(error) => Err(error.to_string()),
	}
}

fn decode_key(encoded: &str) -> Result<[u8; 32], String> {
	let bytes = BASE64.decode(encoded).map_err(|error| error.to_string())?;
	bytes.try_into().map_err(|_| "stored key has an unexpected length".to_string())
}
