/**
 * Parser State namespace.
 */
( function _namespaceParserState( window ) {
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
window.ParserState = ParserState;

} )( window );
