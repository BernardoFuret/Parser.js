/**
 * Main wrapper.
 */
( function _mainParserWrapper( window ) {

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
 * @enum Parser statuses
 */
/*const Status = Object.freeze( {
	ON:  "[Status] On",
	OFF: "[Status] Off"
} );
*/
/**
 * @class Abstract State
 * @abstract
 */
class State {

	/**
	 * Processes the token retrieved by the parser.
	 * @abstract
	 */
	process() {
		throw new Error( "Attempt to use abstract method «process» from class «State»!" );
	}

}

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
	 * @param {State} state - First State of the state chain.
	 * @parse {boolean} verbose - If the parser should log messages.
	 */
	constructor( input = "", delimiter = "", state = new State(), verbose = false ) {
		// Unique ID:
		this.UID = new Date().toUTCString();
		
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
	 * @param {State} state - The new State of the Parser.
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
			window.console.log.apply( console, args );
		}
		return this;
	}

	/**
	 * Initiates and executes the Parser through its States.
	 */
	execute() {
		// Set status as "on":
		this.status = this.constructor.ON;

		// Process:
		while ( this.status === this.constructor.ON ) {
			this.state.process( this );
		}
		
		// Return the State:
		return this.state;
	}

}

/**
 * @exports State
 */
window.State = State;

/**
 * @exports Parser
 */
window.Parser = Parser;

} )( window );