/**
 * Parser namespace.
 * @external ParserState
 */
( factory => {
	"use strict";

	// CommonJS & Node.js:
	if ( typeof module === "object" && typeof module.exports === "object" ) {
		// Dependencies:
		const { ParserState } = require( "./ParserState" );

		// Apply to the «exports» object:
		factory( exports, ParserState );
	}

	// AMD:
	/*else if ( typeof define === "function" && define.amd ) {
		define( "Parser", [ "ParserState" ], factory )
	}*/

	// Browser & Web Workers:
	else {
		// Apply to «window» or Web Workers' «self»:
		factory( self, self.ParserState );
	}

} )( (exports, ParserState) => {
"use strict";

/**
 * @enum Iterator keys
 */
const Iterator = Object.freeze( {
	BEGIN: Symbol( "Iterator.Begin" ),
	FIRST: Symbol( "Iterator.First" ),
	PREV:  Symbol( "Iterator.Prev" ),
	CURR:  Symbol( "Iterator.Curr" ),
	NEXT:  Symbol( "Iterator.Next" ),
	LAST:  Symbol( "Iterator.Last" ),
	END:   Symbol( "Iterator.End" )
} );

/**
 * @class Parser
 */
class Parser {

	/**
	 * @enum-like Parser statuses
	 * @static
	 */
	static get ON()  { return Symbol.for( "Parser.Status.ON" );  }
	static get OFF() { return Symbol.for( "Parser.Status.OFF" ); }

	/**
	 * Parser constructor.
	 * @param {string} input - Content to parse.
	 * @param {string|RegExp} delimiter - Content to parse.
	 * @param {ParserState} state - First State of the state chain.
	 * @param {boolean} verbose - If the parser should log messages.
	 */
	constructor( input = "", delimiter = "", state = new ParserState(), verbose = false ) {
		// Unique ID:
		this.UID = new Date().toISOString(); // new Date().valueOf().toString( 36 );
		
		// Content to parse:
		this.input = input;

		// Delimiter to apply to the content:
		this.delimiter = delimiter;

		// Iterator:
		this.iterator = null;

		// Status:
		this.status = this.constructor.OFF;

		// State:
		this.state = state;

		// Verbose:
		this.verbose = Boolean( verbose );

		// Parsed content:
		this.buffer = [];
	}

	/**
	 * Get the class iterator (singleton-like).
	 * @private
	 * @returns {Object} - The Parser iterator.
	 */
	getIterator() {
		return this.iterator || (
			this.iterator = ( ( content, delimiter ) => {
				const tokens = content.split( delimiter );
				const length = tokens.length;
				let index    = -1;

				return {
					[Iterator.FIRST]() {
						index = 0;
						return {
							done: false,
							value: tokens[ index ]
						};
					},
					[Iterator.PREV]() {
						--index;
						if ( -1 < index ) {
							return {
								done: false,
								value: tokens[ index ]
							};
						} else {
							index = -1;
							return {
								done: true
							};
						}
					},
					[Iterator.CURR]() {
						if ( -1 < index && index < length ) {
							return {
								done: false,
								value: tokens[ index ]
							};
						} else {
							return {
								done: true
							};
						}
					},
					[Iterator.NEXT]() {
						++index;
						if ( index < length ) {
							return {
								done: false,
								value: tokens[ index ]
							};
						} else {
							index = length;
							return {
								done: true
							};
						}
					},
					[Iterator.LAST]() {
						index = length - 1;
						return {
							done: false,
							value: tokens[ index ]
						};
					}
				};
			} )( this.input, this.delimiter )
		);
	}

	/**
	 * Gets a value from the class iterator.
	 * @private
	 * @returns {string|null} - Value from iterator or null if it's done.
	 */
	get( item ) {
		// Get value from the iterator:
		const it = this.getIterator()[ item ]();

		// Return the value or null if it's done:
		return !it.done ? it.value : null;
	}

	/** Iterator interface. */
	/**
	 * Get first item.
	 * @returns {string} - The first value.
	 */
	first() {
		return this.get( Iterator.FIRST );
	}
	/**
	 * Get previous item.
	 * @returns {string|null} - The previous value or null if it's done.
	 */
	prev() {
		return this.get( Iterator.PREV );
	}
	/**
	 * Get current item.
	 * @returns {string|null} - The current value or null if it's done.
	 */
	curr() {
		return this.get( Iterator.CURR );
	}
	/**
	 * Get next item.
	 * @returns {string|null} - The next value or null if it's done.
	 */
	next() {
		return this.get( Iterator.NEXT );
	}
	/**
	 * Get last item.
	 * @returns {string} - The last value.
	 */
	last() {
		return this.get( Iterator.LAST );
	}
	/** End Iterator interface. */

	/**
	 * Sets the state.
	 * @param {ParserState} state - The new State of the Parser.
	 */
	setState( state ) {
		this.state = state;
		return this;
	}

	/**
	 * Sets the status.
	 * @param {Status} status - The new Parser status.
	 */
	setStatus( status ) {
		this.status = status;
		return this;
	}

	/**
	 * Checks if the Parser should log messages.
	 * @returns {boolean}
	 */ 
	isVerbose() {
		return this.verbose;
	}

	/**
	 * Adds a parsed token to the output buffer.
	 * @param {string} token - A string token.
	 */
	add( token ) {
		this.buffer.push( token );
		return this;
	}

	/**
	 * Logs useful messages if the parser is verbose.
	 * @param {...*} args - Anything to log.
	 */
	log( ...args ) {
		if ( this.verbose ) {
			console.log.apply( console, args );
		}
		return this;
	}

	/**
	 * Initiates and executes the Parser through its States.
	 * @param {string} delimiter - The delimiter to merge the
	 * @returns {string} - Parsed content.
	 */
	execute( delimiter = this.delimiter ) {
		// Set status as "on":
		this.status = this.constructor.ON;

		// Process:
		while ( this.status === this.constructor.ON ) {
			this.state.process( this );
		}
		
		// Return the State:
		return this.buffer.join( delimiter );
	}

}

/**
 * @exports Parser
 */
exports.Parser = Parser;

} );