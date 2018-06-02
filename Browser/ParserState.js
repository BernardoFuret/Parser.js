/**
 * Parser State namespace.
 */
( factory => {
	"use strict";

	// CommonJS & Node.js:
	if ( typeof module === "object" && typeof module.exports === "object" ) {
		// Apply to the «exports» object:
		factory( exports );
	}

	// AMD:
	/*else if ( typeof define === "function" && define.amd ) {
		define( "ParserState", [], factory )
	}*/

	// Browser & Web Workers:
	else {
		// Apply to «window» or Web Workers' «self»:
		factory( self );
	}

} )( exports => {
"use strict";

/**
 * @class Abstract State
 * @abstract
 */
class ParserState {

	/**
	 * Processes the token retrieved by the parser.
	 * @abstract
	 */
	process() {
		throw new Error( "Attempt to use abstract method «process» from class «ParserState»!" );
	}

}

/**
 * @exports ParserState
 */
exports.ParserState = ParserState;

} );
