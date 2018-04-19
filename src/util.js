export function getNestedPropWithString( object, keyString ) {

	const nomalizedKeyString = keyString
		.replace( /\//g, '.' )          // slash to dot (arrow both slash and dot for separation)
		.replace( /\[(\w+)\]/g, '.$1' ) // convert indexes to properties
		.replace( /^\./, '' );          // strip a leading dot

	const keyArray = nomalizedKeyString.split( '.' );

	let current = object;

	for ( let i = 0, l = keyArray.length; i < l; ++ i ) {

		const key = keyArray[ i ];

		if ( key in current ) {

			current = current[ key ];

		} else {

			return;

		}

	}

	return current;

}

export function setNestedPropWithString( object, keyString, value ) {

	const nomalizedKeyString = keyString
		.replace( /\//g, '.' )          // slash to dot (arrow both slash and dot for separation)
		.replace( /\[(\w+)\]/g, '.$1' ) // convert indexes to properties
		.replace( /^\./, '' );          // strip a leading dot

	const keyArray = nomalizedKeyString.split( '.' );

	let current = object;

	for ( let i = 0, l = keyArray.length; i < l; ++ i ) {

		const key = keyArray[ i ];

		if ( i === l - 1 ) {

			current[ key ] = value;
			return;

		}

		if ( ! ( key in current ) ) {

			current[ key ] = {};

		}

		current = current[ key ];

	}

}

// same one as vuex
export function deepCopy( obj, cache = [] ) {

	// just return if obj is immutable value
	if ( obj === null || typeof obj !== 'object' ) return obj;

	// if obj is hit, it is in circular structure
	const hit = find( cache, c => c.original === obj );

	if ( hit ) return hit.copy;

	const copy = Array.isArray( obj ) ? [] : {};
	// put the copy into cache at first
	// because we want to refer it in recursive deepCopy
	cache.push( {
		original: obj,
		copy,
	} );

	Object.keys( obj ).forEach( key => {

	  copy[ key ] = deepCopy( obj[ key ], cache );

	} );

	return copy;

}

// https://stackoverflow.com/a/25456134/1512272
export function deepEqual( obj1, obj2 ) {

	if ( obj1 === obj2 ) return true;

	//compare primitives
	if ( isPrimitive( obj1 ) && isPrimitive( obj2 ) ) return obj1 === obj2;

	if ( Object.keys( obj1 ).length !== Object.keys( obj2 ).length ) return false;

	//compare objects with same number of keys
	for ( let key in obj1 ) {

		if ( ! ( key in obj2 ) ) return false; //other object doesn't have this prop
		if ( ! deepEqual( obj1[ key ], obj2[ key ] ) ) return false;

	}

	return true;

}

//check if value is primitive
function isPrimitive( obj ) {

	return ( obj !== Object( obj ) );

}

export function assert( condition, msg ) {

	if ( ! condition ) throw new Error( `[VueUndoRedo] ${msg}` );

}
