/**
 * Converts a value to a boolean representation based on common string representations of boolean values.
 *
 * @param {string} value - The value to be converted.
 * @returns {boolean} - The corresponding boolean value of the input.
 * @throws {Error} - Throws an error if the value cannot be converted to a boolean.
 */
export function parseEnvToBoolean(value) {
  if (value === 'true' || value === '1')
    return true;
  if (value === 'false' || value === '0')
    return false;

   throw new Error(`Invalid value for boolean casting: ${value}`);
}