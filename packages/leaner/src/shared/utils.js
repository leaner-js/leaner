export function appendToArray( item, target ) {
  if ( Array.isArray( item ) )
    target.push( ...item );
  else
    target.push( item );
}

export function isPlainObject( value ) {
  if ( typeof value == 'object' && value != null ) {
    const prototype = Object.getPrototypeOf( value );
    if ( prototype == null || prototype == Object.prototype )
      return true;
  }
  return false;
}

export function isPlainObjectOrArray( value ) {
  return isPlainObject( value ) || Array.isArray( value );
}
