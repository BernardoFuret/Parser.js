/**
 * Card Gallery States namespace.
 * @external ParserState
 * @external Parser
 * @external CardGalleryEntry
 */
( factory => {
	"use strict";

	// CommonJS & Node.js:
	if ( typeof module === "object" && typeof module.exports === "object" ) {
		// Dependencies: // TODO: Organize this.
		const { ParserState } = require( "../ParserState" );
		const { Parser } = require( "../Parser" );
		const { CardGalleryEntry } = require( "../../../Objects.js/WikiGalleryObjects/WikiGalleryObjects" );

		// Apply to the «exports» object:
		factory( exports, ParserState, Parser, CardGalleryEntry );
	}

	// AMD:
	/*else if ( typeof define === "function" && define.amd ) {
		define( "CardGalleryStates", [
			"ParserState", "Parser", "CardGalleryEntry"
		], factory );
	}*/

	// Browser & Web Workers:
	else {
		// Apply to «window» or Web Workers' «self»:
		factory( self, self.ParserState, self.Parser, self.CardGalleryEntry );
	}

} )( (exports, ParserState, Parser, CardGalleryEntry) => {
"use strict";

/**
 * @class SearchingState
 */
class SearchingState extends ParserState {

	/**
	 * State processor.
	 * @param {Parser} parser - Parser to apply.
	 */
	process( parser ) {
		// Get next token to parse:
		const token = parser.next();
		
		// Check if there is a line:
		if ( token === null ) {
			parser
				.log( "[SearchingState] No token! Changing state to: «CompletedState»." )
				.setState( new CompletedState() )
			;
		} else if ( /\{\{ *GalleryHeader *(\| *lang *= *\w*)? *\}\}/i.test( token ) ) {
			parser
				.log( "[SearchingState] Match with {{GalleryHeader}}! Changing state to ConvertingState." )
				.setState( new ConvertingState() )
				.prev()
			;
		} else {
			parser
				.log( "[SearchingState] Pushing token:", token )
				.add( token )
			;
		}
	}

}


/**
 * @class ConvertingState
 */
class ConvertingState extends ParserState {

	/**
	 * State processor.
	 * @param {Parser} parser - Parser to apply.
	 */
	process( parser ) {
		// Get next token to parse:
		const token = parser.next();

		// Var to hold the regex match groups:
		let match = null;

		// Check if there is a line:
		if ( token === null ) {

			// No line, when we expected something to convert:
			parser
				.log( "[ConvertingState] No token! Changing state to: «ErrorState»." )
				.setState( new ErrorState( "No new token while on «ConvertingState»!" ) )
			;

		} else if ( match = /\{\{ *GalleryHeader *\| *lang *= *(\w+?) *\}\}/i.exec( token ) ) {

			// Match with {{GalleryHeader}}.
			// Converting (getting region).
			parser
				.log( "[ConvertingState] Match with {{GalleryHeader}}! Getting region. Creating {{Card gallery}} header." )
				.add( `{{Card gallery|region=${match[ 1 ].toUpperCase()}|` )
			;

		} else if ( /^ *< *\/? *gallery/im.test( token ) ) {

			// Found an opening or closing <gallery> tag.
			// In this case, purely ignore them
			// (there shouldn't be anymore stuff on a line containing them).
			parser.log( "[ConvertingState] Match with gallery tag! Ignoring token:", token );

		} else if ( /^ *\|\} *$/m.test( token ) ) {

			// Found the end of a gallery table.
			// Converting: "|}" -> "}}"
			// Go back to the SearchingState.
			parser
				.log( "[ConvertingState] Match with end of gallery table! Changing state to: «SearchingState»." )
				.add( "}}" )
				.setState( new SearchingState() )
			;

		} else {
			// Should be a gallery entry, so build one:
			const entry = new CardGalleryEntry( token );

			// Push the entry:
			parser
				.log( "[ConvertingState] Possible match with gallery entry! Pushing entry:", entry )
				.add( entry.toString() )
			;
		}
	}

}


/**
 * @class IgnoringState
 */
class IgnoringState extends ParserState {}


/**
 * @class CompletedState
 */
class CompletedState extends ParserState {

	/**
	 * State processor.
	 * @param {Parser} parser - Parser to apply.
	 */
	process( parser ) {
		// Set parser status as "off":
		parser
			.log( "[CompletedState] Parser has finished. Exiting." )
			.setStatus( Parser.OFF )
		;

		return this;
	}

}


/**
 * @class ErrorState
 */
class ErrorState extends ParserState {

	/**
	 * ErrorState constructor.
	 * @param {string} message - Message to throw.
	 */
	constructor( message ) {
		this.message = message;
	}

	/**
	 * State processor.
	 * @param {Parser} parser - Parser to apply.
	 * @throws {Error} - The message.
	 */
	process( parser ) {
		// Set parser status as "off":
		parser
			.log( "[ErrorState] Parser has terminated unexpectedly. Exiting." )
			.setStatus( Parser.OFF )
		;

		// Throw message:
		throw new Error( this.message );
	}

}

/**
 * @exports SearchingState
 */
exports.SearchingState = SearchingState;

} );
